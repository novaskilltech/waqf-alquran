const url = "https://tqbcmcddnohnqmcxvgut.supabase.co/rest/v1/Surah";
const key = "sb_publishable_MQWl9gzwpng6fHEmwtVF5Q_-PwO3ZfE";

const surahs = [
  { id: 50, number: 50, name: "ق", type: "Meccan" },
  { id: 51, number: 51, name: "الذاريات", type: "Meccan" },
  { id: 52, number: 52, name: "الطور", type: "Meccan" },
  { id: 53, number: 53, name: "النجم", type: "Meccan" },
  { id: 54, number: 54, name: "القمر", type: "Meccan" },
  { id: 55, number: 55, name: "الرحمن", type: "Medinan" },
  { id: 56, number: 56, name: "الواقعة", type: "Meccan" },
  { id: 57, number: 57, name: "الحديد", type: "Medinan" },
  { id: 58, number: 58, name: "المجادلة", type: "Medinan" },
  { id: 59, number: 59, name: "الحشر", type: "Medinan" },
  { id: 60, number: 60, name: "المممتحنة", type: "Medinan" },
  { id: 61, number: 61, name: "الصف", type: "Medinan" },
  { id: 62, number: 62, name: "الجمعة", type: "Medinan" },
  { id: 63, number: 63, name: "المنافقون", type: "Medinan" },
  { id: 64, number: 64, name: "التغابن", type: "Medinan" },
  { id: 65, number: 65, name: "الطلاق", type: "Medinan" },
  { id: 66, number: 66, name: "التحريم", type: "Medinan" },
  { id: 67, number: 67, name: "الملك", type: "Meccan" },
  { id: 68, number: 68, name: "القلم", type: "Meccan" },
  { id: 69, number: 69, name: "الحاقة", type: "Meccan" },
  { id: 70, number: 70, name: "المعارج", type: "Meccan" },
  { id: 71, number: 71, name: "نوح", type: "Meccan" },
  { id: 72, number: 72, name: "الجن", type: "Meccan" },
  { id: 73, number: 73, name: "المزمل", type: "Meccan" },
  { id: 74, number: 74, name: "المدثر", type: "Meccan" },
  { id: 75, number: 75, name: "القيامة", type: "Meccan" },
  { id: 76, number: 76, name: "الإنسان", type: "Medinan" },
  { id: 77, number: 77, name: "المرسلات", type: "Meccan" },
  { id: 78, number: 78, name: "النبأ", type: "Meccan" },
  { id: 79, number: 79, name: "النازعات", type: "Meccan" },
  { id: 80, number: 80, name: "عبس", type: "Meccan" },
  { id: 81, number: 81, name: "التكوير", type: "Meccan" },
  { id: 82, number: 82, name: "الانفطار", type: "Meccan" },
  { id: 83, number: 83, name: "المطففين", type: "Meccan" },
  { id: 84, number: 84, name: "الانشقاق", type: "Meccan" },
  { id: 85, number: 85, name: "البروج", type: "Meccan" },
  { id: 86, number: 86, name: "الطارق", type: "Meccan" },
  { id: 87, number: 87, name: "الأعلى", type: "Meccan" },
  { id: 88, number: 88, name: "الغاشية", type: "Meccan" },
  { id: 89, number: 89, name: "الفجر", type: "Meccan" },
  { id: 90, number: 90, name: "البلد", type: "Meccan" },
  { id: 91, number: 91, name: "الشمس", type: "Meccan" },
  { id: 92, number: 92, name: "الليل", type: "Meccan" },
  { id: 93, number: 93, name: "الضحى", type: "Meccan" },
  { id: 94, number: 94, name: "الشرح", type: "Meccan" },
  { id: 95, number: 95, name: "التين", type: "Meccan" },
  { id: 96, number: 96, name: "العلق", type: "Meccan" },
  { id: 97, number: 97, name: "القدر", type: "Meccan" },
  { id: 98, number: 98, name: "البينة", type: "Medinan" },
  { id: 99, number: 99, name: "الزلزلة", type: "Medinan" },
  { id: 100, number: 100, name: "العاديات", type: "Meccan" },
  { id: 101, number: 101, name: "القارعة", type: "Meccan" },
  { id: 102, number: 102, name: "التكاثر", type: "Meccan" },
  { id: 103, number: 103, name: "العصر", type: "Meccan" },
  { id: 104, number: 104, name: "الهمزة", type: "Meccan" },
  { id: 105, number: 105, name: "الفيل", type: "Meccan" },
  { id: 106, number: 106, name: "قريش", type: "Meccan" },
  { id: 107, number: 107, name: "الماعون", type: "Meccan" },
  { id: 108, number: 108, name: "الكوثر", type: "Meccan" },
  { id: 109, number: 109, name: "الكافرون", type: "Meccan" },
  { id: 110, number: 110, name: "النصر", type: "Medinan" },
  { id: 111, number: 111, name: "المسد", type: "Meccan" },
  { id: 112, number: 112, name: "الإخلاص", type: "Meccan" },
  { id: 113, number: 113, name: "الفلق", type: "Meccan" },
  { id: 114, number: 114, name: "الناس", type: "Meccan" }
];

async function seed() {
  console.log("Seeding surahs via REST API...");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Prefer": "resolution=merge-duplicates"
    },
    body: JSON.stringify(surahs)
  });
  
  if (response.ok) {
    console.log("✅ Seed successful!");
  } else {
    const err = await response.text();
    console.error("❌ Seed failed:", err);
  }
}

seed();
