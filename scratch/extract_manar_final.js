const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG = {
  AI_API_KEY: process.env.AI_PROVIDER_API_KEY || "",
  AI_URL: "https://api.kilo.ai/api/gateway/chat/completions",
  BOOK_PATH: path.join(process.cwd(), 'shamela_data', '6496.json'),
  OUTPUT_SQL: 'manar_waqf_71_114.sql',
  CONCURRENCY: 3 // Vitesse augmentée
};

const SURAH_MAP = {
  "نوح": 71, "الجن": 72, "المزمل": 73, "المدثر": 74, "القيامة": 75,
  "الإنسان": 76, "المرسلات": 77, "النبأ": 78, "النازعات": 79, "عبس": 80,
  "التكوير": 81, "الانفطار": 82, "المطففين": 83, "الانشقاق": 84, "البروج": 85,
  "الطارق": 86, "الأعلى": 87, "الغاشية": 88, "الفجر": 89, "البلد": 90,
  "الشمس": 91, "الليل": 92, "الضحى": 93, "الانشراح": 94, "التين": 95,
  "العلق": 96, "القدر": 97, "البينة": 98, "الزلزلة": 99, "العاديات": 100,
  "القارعة": 101, "التكاثر": 102, "العصر": 103, "الهمزة": 104, "الفيل": 105,
  "قريش": 106, "الماعون": 107, "الكوثر": 108, "الكافرون": 109, "النصر": 110,
  "تبت": 111, "الإخلاص": 112, "الفلق": 113, "الناس": 114
};

function askGemini(text, surahName) {
  return new Promise((resolve) => {
    const prompt = `Analyze the following Arabic text from 'Manar al-Huda' about Waqf in Surah ${surahName}.
Extract each Waqf point into a JSON array.
Format: { "ayah": number, "word": "string", "type": "Tam/Kafi/Hasan/Qabih", "reason": "string" }
Text: "${text}"
JSON Output only:`;

    const data = JSON.stringify({
      model: "kilo-auto/free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1
    });

    const url = new URL(CONFIG.AI_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.AI_API_KEY.trim()}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const content = json.choices[0].message.content;
          const jsonMatch = content.match(/\[.*\]/s);
          resolve(jsonMatch ? JSON.parse(jsonMatch[0]) : []);
        } catch (e) { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.write(data);
    req.end();
  });
}

async function start() {
  const bookData = JSON.parse(fs.readFileSync(CONFIG.BOOK_PATH, 'utf8'));
  const sqlLines = [];
  
  // Charger les points déjà extraits pour ne pas recommencer
  if (fs.existsSync(CONFIG.OUTPUT_SQL)) {
    const existing = fs.readFileSync(CONFIG.OUTPUT_SQL, 'utf8');
    sqlLines.push(existing);
  }

  const surahsToProcess = Object.entries(SURAH_MAP).filter(([name, num]) => {
     // Process everything from 107 onwards
     return num > 106;
  });

  console.log(`🚀 Starting optimized extraction 74-114 (${surahsToProcess.length} surahs)...`);

  const processSurah = async ([name, surahNum]) => {
    const surahTitle = bookData.titles.find(t => t.content.includes(name));
    if (!surahTitle) return;

    const page = bookData.pages.find(p => p.id === parseInt(surahTitle.page));
    if (!page) return;

    console.log(`📡 Processing Surah ${name} (${surahNum})...`);
    const points = await askGemini(page.content, name);
    
    const localLines = points.map(p => {
      return `INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "ruling", "explanation", "type", "source") 
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = ${surahNum} AND "numberInSurah" = ${p.ayah}), 0, '${p.type}', '${p.reason.replace(/'/g, "''")}', '${p.type}', 'Manar al-Huda (Ashmuni)');`;
    });

    if (localLines.length > 0) {
      fs.appendFileSync(CONFIG.OUTPUT_SQL, '\n' + localLines.join('\n'));
    }
    console.log(`✅ ${points.length} points for Surah ${name}`);
  };

  // Concurrency control
  for (let i = 0; i < surahsToProcess.length; i += CONFIG.CONCURRENCY) {
    const chunk = surahsToProcess.slice(i, i + CONFIG.CONCURRENCY);
    await Promise.all(chunk.map(processSurah));
  }

  console.log("🏁 Finished! SQL in", CONFIG.OUTPUT_SQL);
}

start().catch(console.error);
