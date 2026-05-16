const fs = require('fs');
const path = require('path');

const CONFIG = {
  AI_API_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnYiOiJwcm9kdWN0aW9uIiwia2lsb1VzZXJJZCI6ImQ0ZmEzY2FlLTQxNWMtNDQxMi05NzM4LTZlZDk1NjUwOWIyMSIsImFwaVRva2VuUGVwcGVyIjpudWxsLCJ2ZXJzaW9uIjozLCJpYXQiOjE3Nzg4NjIyNzksImV4cCI6MTkzNjU0MjI3OX0.ztj8qODSAhdbgG4G-b-ttchrBNr6ndMJE_5z7NIOvbo",
  AI_URL: "https://api.kilo.ai/api/gateway/chat/completions",
  BOOK_PATH: path.join(process.cwd(), 'shamela_data', '6496.json')
};

const bookData = JSON.parse(fs.readFileSync(CONFIG.BOOK_PATH, 'utf8'));

async function askGemini(text) {
  const prompt = `Analyze the following Arabic text from the book 'Manar al-Huda' about Waqf (stops) in the Quran.
Extract each Waqf point mentioned into a JSON array.
Each object must have:
- ayah: (number)
- word: (the specific word or phrase where the stop occurs)
- type: (Tam, Kafi, Hasan, or Qabih)
- reason: (short explanation in Arabic)

Text:
"${text}"

JSON Output only:`;


  console.log("📡 Appel Kilo AI...");
  const res = await fetch(CONFIG.AI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.AI_API_KEY.trim()}`
    },
    body: JSON.stringify({
      model: "kilo-auto/free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1
    })
  });
  console.log("📡 Réponse reçue, status:", res.status);


  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ Erreur API (${res.status}):`, errorText);
    return [];
  }

  console.log("📡 Parsing JSON...");
  console.log("📡 Lecture du texte...");
  const textBody = await res.text();
  console.log("📦 Texte reçu (longueur:", textBody.length, ")");
  const data = JSON.parse(textBody);




  try {
    const content = data.choices[0].message.content;
    console.log("🤖 Réponse IA:", content);
    const jsonMatch = content.match(/\[.*\]/s);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);

  } catch (e) {
    console.error("❌ Erreur parsing Gemini:", e);
    return [];
  }
}

const SURAH_MAP = {
  "نوح": 71, "الجن": 72, "المزمل": 73, "المدثر": 74, "القيامة": 75, "الإنسان": 76, "المرسلات": 77, "النبأ": 78, "النازعات": 79, "عبس": 80, "التكوير": 81, "الانفطار": 82, "المطففين": 83, "الانشقاق": 84, "البروج": 85, "الطارق": 86, "الأعلى": 87, "الغاشية": 88, "الفجر": 89, "البلد": 90, "الشمس": 91, "الليل": 92, "الضحى": 93, "الشرح": 94, "التين": 95, "العلق": 96, "القدر": 97, "البينة": 98, "الزلزلة": 99, "العاديات": 100, "القارعة": 101, "التكاثر": 102, "العصر": 103, "الهمزة": 104, "الفيل": 105, "قريش": 106, "الماعون": 107, "الكوثر": 108, "الكافرون": 109, "النصر": 110, "المسد": 111, "الإخلاص": 112, "الفلق": 113, "الناس": 114, "تبت": 111 // Synonyme
};

async function startExtraction() {
  console.log("🚀 Lancement de l'extraction sémantique (71-114)...");
  let finalSql = 'INSERT INTO public."WaqfPoint" (id, "ayahId", "wordIndex", "waqfType", "explanation", "sourceBookId") VALUES\n';
  const entries = [];

  const targetSurahs = bookData.titles.filter(t => t.content.includes("سورة"));
  const sample = targetSurahs.slice(-1); 

  for (const surah of sample) {
    const cleanName = surah.content.replace("سورة ", "").trim();
    const surahNum = SURAH_MAP[cleanName];
    
    if (!surahNum) {
        console.log(`⚠️ Surate ignorée (non mappée) : ${cleanName}`);
        continue;
    }

    console.log(`📡 Traitement de : ${surah.content} (N° ${surahNum})...`);

    const page = bookData.pages.find(p => p.id === parseInt(surah.page));
    if (!page) continue;

    const points = await askGemini(page.content);
    console.log(`✅ ${points.length} points trouvés.`);

    for (const p of points) {
      const ayahId = `s${surahNum}a${p.ayah}`;
      const entryId = `wp_${surahNum}_${p.ayah}_${Math.random().toString(36).substr(2, 9)}`;
      
      entries.push(`('${entryId}', '${ayahId}', 0, '${p.type}', '${p.reason.replace(/'/g, "''")}', 6496)`);
    }

  }

  finalSql += entries.join(',\n') + ';';
  fs.writeFileSync('manar_waqf_points_sample.sql', finalSql);
  console.log("🏁 SQL généré dans manar_waqf_points_sample.sql");
}

startExtraction().catch(console.error);
