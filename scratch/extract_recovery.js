const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG = {
  AI_API_KEY: process.env.AI_PROVIDER_API_KEY || "",
  AI_URL: "https://api.kilo.ai/api/gateway/chat/completions",
  BOOK_PATH: path.join(process.cwd(), 'shamela_data', '6496.json'),
  OUTPUT_SQL: 'manar_waqf_71_114.sql'
};

const SURAH_MAP = {
  "النصر": 110, "تبت": 111, "الإخلاص": 112, "الفلق": 113, "الناس": 114
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
      timeout: 30000, // 30s timeout
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
          if (!json.choices) throw new Error('No choices');
          const content = json.choices[0].message.content;
          const jsonMatch = content.match(/\[.*\]/s);
          resolve(jsonMatch ? JSON.parse(jsonMatch[0]) : []);
        } catch (e) { 
          console.error(`❌ Error parsing Gemini for ${surahName}:`, e.message);
          resolve([]); 
        }
      });
    });
    req.on('error', (e) => {
       console.error(`❌ Request error for ${surahName}:`, e.message);
       resolve([]);
    });
    req.on('timeout', () => {
       req.destroy();
       console.error(`⏰ Timeout for ${surahName}`);
       resolve([]);
    });
    req.write(data);
    req.end();
  });
}

async function start() {
  const bookData = JSON.parse(fs.readFileSync(CONFIG.BOOK_PATH, 'utf8'));
  
  console.log(`🚀 Starting sequential recovery for ${Object.keys(SURAH_MAP).length} surahs...`);

  for (const [name, surahNum] of Object.entries(SURAH_MAP)) {
    const surahTitle = bookData.titles.find(t => t.content.includes(name));
    if (!surahTitle) {
      console.log(`⚠️ Title not found for ${name}`);
      continue;
    }

    const page = bookData.pages.find(p => p.id === parseInt(surahTitle.page));
    if (!page) {
      console.log(`⚠️ Page not found for ${name}`);
      continue;
    }

    console.log(`📡 Processing Surah ${name} (${surahNum})...`);
    const points = await askGemini(page.content, name);
    
    if (points.length > 0) {
      const localLines = points.map(p => {
        return `INSERT INTO \"WaqfPoint\" (\"ayahId\", \"wordIndex\", \"ruling\", \"explanation\", \"type\", \"source\") 
VALUES ((SELECT id FROM \"Ayah\" WHERE \"surahNumber\" = ${surahNum} AND \"numberInSurah\" = ${p.ayah}), 0, '${p.type}', '${p.reason.replace(/'/g, "''")}', '${p.type}', 'Manar al-Huda (Ashmuni)');`;
      });
      fs.appendFileSync(CONFIG.OUTPUT_SQL, '\n' + localLines.join('\n'));
      console.log(`✅ ${points.length} points for Surah ${name}`);
    } else {
      console.log(`ℹ️ No points extracted for ${name}`);
    }
  }

  console.log("🏁 Sequential extraction finished!");
}

start().catch(console.error);
