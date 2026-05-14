const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const surahs = await prisma.surah.findMany();
    console.log('Total Surahs:', surahs.length);
    if (surahs.length > 0) {
      console.log('First 5 Surahs:', JSON.stringify(surahs.slice(0, 5), null, 2));
    }
    
    const ayahs = await prisma.ayah.count();
    console.log('Total Ayahs:', ayahs);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
