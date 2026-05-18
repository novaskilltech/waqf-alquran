const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const sqlFile = path.join(process.cwd(), 'manar_waqf_1_70.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Split by ON CONFLICT DO NOTHING; to execute in smaller batches
  const statements = sql.split('ON CONFLICT DO NOTHING;').map(s => s.trim()).filter(s => s.length > 0);
  
  console.log(`Found ${statements.length} INSERT statements. Executing in batches of 100...`);

  let successCount = 0;
  for (let i = 0; i < statements.length; i += 100) {
    const batch = statements.slice(i, i + 100).join(' ON CONFLICT DO NOTHING;\n') + ' ON CONFLICT DO NOTHING;';
    try {
      await prisma.$executeRawUnsafe(batch);
      successCount += statements.slice(i, i + 100).length;
      if (i % 1000 === 0) {
        console.log(`Inserted ${successCount} records...`);
      }
    } catch (e) {
      console.error(`Error at batch starting at index ${i}:`, e.message);
      // Try executing one by one for this batch
      for (const statement of statements.slice(i, i + 100)) {
        try {
          await prisma.$executeRawUnsafe(statement + ' ON CONFLICT DO NOTHING;');
          successCount++;
        } catch (err) {
          console.error(`Failed to execute: ${statement.substring(0, 100)}...`);
          console.error(err.message);
        }
      }
    }
  }

  console.log(`Successfully completed! Inserted/Processed ${successCount} Waqf points.`);
}

main()
  .catch(e => {
    console.error("Critical Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
