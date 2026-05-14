const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const surahs = [
  { number: 50, name: "ق", type: "Meccan" },
  { number: 51, name: "الذاريات", type: "Meccan" },
  { number: 52, name: "الطور", type: "Meccan" },
  { number: 53, name: "النجم", type: "Meccan" },
  { number: 54, name: "القمر", type: "Meccan" },
  { number: 55, name: "الرحمن", type: "Medinan" },
  { number: 56, name: "الواقعة", type: "Meccan" },
  { number: 57, name: "الحديد", type: "Medinan" },
  { number: 58, name: "المجادلة", type: "Medinan" },
  { number: 59, name: "الحشر", type: "Medinan" },
  { number: 60, name: "المممتحنة", type: "Medinan" },
  { number: 61, name: "الصف", type: "Medinan" },
  { number: 62, name: "الجمعة", type: "Medinan" },
  { number: 63, name: "المنافقون", type: "Medinan" },
  { number: 64, name: "التغابن", type: "Medinan" },
  { number: 65, name: "الطلاق", type: "Medinan" },
  { number: 66, name: "التحريم", type: "Medinan" },
  { number: 67, name: "الملك", type: "Meccan" },
  { number: 68, name: "القلم", type: "Meccan" },
  { number: 69, name: "الحاقة", type: "Meccan" },
  { number: 70, name: "المعارج", type: "Meccan" },
  { number: 71, name: "نوح", type: "Meccan" },
  { number: 72, name: "الجن", type: "Meccan" },
  { number: 73, name: "المزمل", type: "Meccan" },
  { number: 74, name: "المدثر", type: "Meccan" },
  { number: 75, name: "القيامة", type: "Meccan" },
  { number: 76, name: "الإنسان", type: "Medinan" },
  { number: 77, name: "المرسلات", type: "Meccan" },
  { number: 78, name: "النبأ", type: "Meccan" },
  { number: 79, name: "النازعات", type: "Meccan" },
  { number: 80, name: "عبس", type: "Meccan" },
  { number: 81, name: "التكوير", type: "Meccan" },
  { number: 82, name: "الانفطار", type: "Meccan" },
  { number: 83, name: "المطففين", type: "Meccan" },
  { number: 84, name: "الانشقاق", type: "Meccan" },
  { number: 85, name: "البروج", type: "Meccan" },
  { number: 86, name: "الطارق", type: "Meccan" },
  { number: 87, name: "الأعلى", type: "Meccan" },
  { number: 88, name: "الغاشية", type: "Meccan" },
  { number: 89, name: "الفجر", type: "Meccan" },
  { number: 90, name: "البلد", type: "Meccan" },
  { number: 91, name: "الشمس", type: "Meccan" },
  { number: 92, name: "الليل", type: "Meccan" },
  { number: 93, name: "الضحى", type: "Meccan" },
  { number: 94, name: "الشرح", type: "Meccan" },
  { number: 95, name: "التين", type: "Meccan" },
  { number: 96, name: "العلق", type: "Meccan" },
  { number: 97, name: "القدر", type: "Meccan" },
  { number: 98, name: "البينة", type: "Medinan" },
  { number: 99, name: "الزلزلة", type: "Medinan" },
  { number: 100, name: "العاديات", type: "Meccan" },
  { number: 101, name: "القارعة", type: "Meccan" },
  { number: 102, name: "التكاثر", type: "Meccan" },
  { number: 103, name: "العصر", type: "Meccan" },
  { number: 104, name: "الهمزة", type: "Meccan" },
  { number: 105, name: "الفيل", type: "Meccan" },
  { number: 106, name: "قريش", type: "Meccan" },
  { number: 107, name: "الماعون", type: "Meccan" },
  { number: 108, name: "الكوثر", type: "Meccan" },
  { number: 109, name: "الكافرون", type: "Meccan" },
  { number: 110, name: "النصر", type: "Medinan" },
  { number: 111, name: "المسد", type: "Meccan" },
  { number: 112, name: "الإخلاص", type: "Meccan" },
  { number: 113, name: "الفلق", type: "Meccan" },
  { number: 114, name: "الناس", type: "Meccan" }
];

async function main() {
  for (const s of surahs) {
    await prisma.surah.upsert({
      where: { number: s.number },
      update: {},
      create: {
        id: s.number,
        number: s.number,
        name: s.name,
        type: s.type,
      },
    });
  }
  console.log('Seed completed: Qaf to Nas surahs added.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
