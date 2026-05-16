const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG = {
  AI_API_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnYiOiJwcm9kdWN0aW9uIiwia2lsb1VzZXJJZCI6ImQ0ZmEzY2FlLTQxNWMtNDQxMi05NzM4LTZlZDk1NjUwOWIyMSIsImFwaVRva2VuUGVwcGVyIjpudWxsLCJ2ZXJzaW9uIjozLCJpYXQiOjE3Nzg4NjIyNzksImV4cCI6MTkzNjU0MjI3OX0.ztj8qODSAhdbgG4G-b-ttchrBNr6ndMJE_5z7NIOvbo",
  AI_URL: "https://api.kilo.ai/api/gateway/chat/completions",
  BOOK_PATH: path.join(process.cwd(), 'shamela_data', '6496.json')
};

function askGemini(text) {
  return new Promise((resolve, reject) => {
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

    console.log("📡 Appel Kilo AI (https)...");
    const req = https.request(options, (res) => {
      console.log("📡 Status:", res.statusCode);
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const content = json.choices[0].message.content;
          const jsonMatch = content.match(/\[.*\]/s);
          resolve(jsonMatch ? JSON.parse(jsonMatch[0]) : []);
        } catch (e) {
          console.error("❌ Erreur parsing:", e.message);
          resolve([]);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

// ... le reste du script reste similaire
const bookData = JSON.parse(fs.readFileSync(CONFIG.BOOK_PATH, 'utf8'));
const SURAH_MAP = { "الإخلاص": 112 }; // Test 1 surah

async function main() {
  const surah = bookData.titles.find(t => t.content.includes("الإخلاص"));
  const points = await askGemini("قوله تعالى {قل هو الله أحد} حسن عند أبي عمرو.");

  console.log("✅ Points trouvés:", points);
}

main().catch(console.error);
