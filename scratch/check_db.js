const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.ayah.aggregate({
    _max: {
      surahNumber: true
    },
    _count: {
      id: true
    }
  });
  console.log("Status DB Ayah:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
