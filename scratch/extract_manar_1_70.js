const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG = {
  API_KEY: process.env.OPENROUTER_API_KEY || "YOUR_API_KEY_HERE",
  API_HOST: "openrouter.ai",
  API_PATH: "/api/v1/chat/completions",
  MODEL: "google/gemini-2.0-flash-001",
  BOOK_PATH: path.join(process.cwd(), 'shamela_data', '6496.json'),
  OUTPUT_SQL: 'manar_waqf_1_70.sql',
  MAX_CHUNK_SIZE: 3500,
  DELAY_MS: 1200,
  START_SURAH: 1,
  END_SURAH: 70
};

const SURAH_MAP = {
  "الفاتحة": 1, "البقرة": 2, "آل عمران": 3, "النساء": 4, "المائدة": 5,
  "الأنعام": 6, "الأعراف": 7, "الأنفال": 8, "التوبة": 9, "يونس": 10,
  "هود": 11, "يوسف": 12, "الرعد": 13, "إبراهيم": 14, "الحجر": 15,
  "النحل": 16, "الإسراء": 17, "الكهف": 18, "مريم": 19, "طه": 20,
  "الأنبياء": 21, "الحج": 22, "المؤمنون": 23, "النور": 24, "الفرقان": 25,
  "الشعراء": 26, "النمل": 27, "القصص": 28, "العنكبوت": 29, "الروم": 30,
  "لقمان": 31, "السجدة": 32, "الأحزاب": 33, "سبأ": 34, "فاطر": 35,
  "يس": 36, "الصافات": 37, "ص": 38, "الزمر": 39, "غافر": 40,
  "فصلت": 41, "الشورى": 42, "الزخرف": 43, "الدخان": 44, "الجاثية": 45,
  "الأحقاف": 46, "محمد": 47, "الفتح": 48, "الحجرات": 49, "ق": 50,
  "الذاريات": 51, "الطور": 52, "النجم": 53, "القمر": 54, "الرحمن": 55,
  "الواقعة": 56, "الحديد": 57, "المجادلة": 58, "الحشر": 59, "الممتحنة": 60,
  "الصف": 61, "الجمعة": 62, "المنافقون": 63, "التغابن": 64, "الطلاق": 65,
  "التحريم": 66, "الملك": 67, "القلم": 68, "الحاقة": 69, "المعارج": 70
};

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function askAI(text, surahName, chunkLabel) {
  return new Promise((resolve) => {
    const prompt = `أنت خبير في علم الوقف والابتداء.
حلّل النص التالي من كتاب "منار الهدى" للأشموني عن مواضع الوقف في سورة ${surahName}.
استخرج كل موضع وقف ورد في النص وأعده بصيغة JSON.

القواعد:
1. حدد رقم الآية بدقة من النص (مثلاً [٢] أو (٢) تعني الآية 2)
2. صنّف نوع الوقف: تام / كاف / حسن / جائز / صالح / قبيح / ليس بوقف
3. انقل التعليل كما هو بالعربية
4. إذا ذكر "آخر السورة" أو "آخرها تام" فهو تام

Format JSON:
[{"ayah": <number>, "ruling": "<نوع الوقف بالعربية>", "explanation": "<التعليل بالعربية كما في النص>"}]

النص:
"${text}"

أخرج JSON فقط بدون أي كلام آخر:`;

    const data = JSON.stringify({
      model: CONFIG.MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1
    });

    const options = {
      hostname: CONFIG.API_HOST,
      path: CONFIG.API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.API_KEY}`,
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 90000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.error) {
            console.log(`    ⚠️ API error [${chunkLabel}]: ${json.error.message}`);
            resolve([]);
            return;
          }
          if (!json.choices || !json.choices[0]) {
            console.log(`    ⚠️ Empty response [${chunkLabel}]`);
            resolve([]);
            return;
          }
          const content = json.choices[0].message.content;
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            resolve(JSON.parse(jsonMatch[0]));
          } else {
            console.log(`    ⚠️ No JSON in response [${chunkLabel}]`);
            resolve([]);
          }
        } catch (e) {
          console.log(`    ❌ Parse error [${chunkLabel}]: ${e.message}`);
          resolve([]);
        }
      });
    });
    req.on('timeout', () => { req.destroy(); console.log(`    ⏱️ Timeout [${chunkLabel}]`); resolve([]); });
    req.on('error', (e) => { console.log(`    ❌ Network error [${chunkLabel}]: ${e.message}`); resolve([]); });
    req.write(data);
    req.end();
  });
}

function toSQL(surahNum, points) {
  return points.map(p => {
    const ayahNum = parseInt(p.ayah);
    if (isNaN(ayahNum) || ayahNum < 1) return null;
    
    const dataObj = {
      ruling: (p.ruling || '').replace(/\\/g, ''),
      explanation: (p.explanation || '').replace(/\\/g, ''),
      source: "Manar al-Huda (Ashmuni)",
      hukumIbtida: "جائز",
      taalil: ""
    };
    const dataJson = JSON.stringify(dataObj).replace(/'/g, "''");

    return `INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = ${surahNum} AND "number" = ${ayahNum}), 0, 'BOOKS', 'APPROVED', '${dataJson}')
ON CONFLICT DO NOTHING;`;
  }).filter(Boolean);
}

function getPages(bookData, surahTitle) {
  const startPage = parseInt(surahTitle.page);
  const allTitles = bookData.titles
    .filter(t => t.parent === surahTitle.parent)
    .sort((a, b) => parseInt(a.page) - parseInt(b.page));
  
  const idx = allTitles.findIndex(t => t.id === surahTitle.id);
  const endPage = idx < allTitles.length - 1 ? parseInt(allTitles[idx + 1].page) : startPage + 50;
  
  const pages = [];
  for (let pid = startPage; pid < endPage; pid++) {
    const page = bookData.pages.find(p => p.id === pid);
    if (page && page.content) {
      const clean = page.content.replace(/<[^>]+>/g, '').trim();
      if (clean.length > 50) pages.push(clean);
    }
  }
  return pages;
}

async function start() {
  const bookData = JSON.parse(fs.readFileSync(CONFIG.BOOK_PATH, 'utf8'));
  
  fs.writeFileSync(CONFIG.OUTPUT_SQL, `-- =====================================================
-- Points de Waqf : Sourates ${CONFIG.START_SURAH}-${CONFIG.END_SURAH}
-- Source : Manar al-Huda (Ashmuni)
-- API : OpenRouter (${CONFIG.MODEL})
-- Date : ${new Date().toISOString().split('T')[0]}
-- =====================================================\n\n`);

  const surahsToProcess = Object.entries(SURAH_MAP)
    .filter(([_, num]) => num >= CONFIG.START_SURAH && num <= CONFIG.END_SURAH)
    .sort((a, b) => a[1] - b[1]);

  console.log(`🚀 Extraction sourates ${CONFIG.START_SURAH}-${CONFIG.END_SURAH} (${surahsToProcess.length} sourates)`);
  console.log(`   Modèle: ${CONFIG.MODEL} via OpenRouter`);
  console.log(`   Stratégie: page par page, max ${CONFIG.MAX_CHUNK_SIZE} chars/appel\n`);

  let totalPoints = 0;
  let successCount = 0;
  let failCount = 0;

  for (const [name, surahNum] of surahsToProcess) {
    const surahTitle = bookData.titles.find(t => 
      t.content.includes(name) || t.content.includes(`سورة ${name}`)
    );
    
    if (!surahTitle) {
      console.log(`⏭️ [${surahNum}/70] سورة ${name}: not found`);
      failCount++;
      continue;
    }

    const pages = getPages(bookData, surahTitle);
    if (pages.length === 0) {
      console.log(`⏭️ [${surahNum}/70] سورة ${name}: no content`);
      failCount++;
      continue;
    }

    console.log(`📡 [${surahNum}/70] سورة ${name} (${pages.length} pages)...`);
    let surahPoints = [];
    
    for (let i = 0; i < pages.length; i++) {
      const pageText = pages[i];
      
      if (pageText.length > CONFIG.MAX_CHUNK_SIZE) {
        const paragraphs = pageText.split(/\r?\n/);
        let currentChunk = '';
        let sub = 0;
        
        for (const para of paragraphs) {
          if ((currentChunk + para).length > CONFIG.MAX_CHUNK_SIZE && currentChunk.length > 100) {
            const pts = await askAI(currentChunk, name, `p${i}.${sub}`);
            surahPoints.push(...pts);
            await delay(CONFIG.DELAY_MS);
            currentChunk = '';
            sub++;
          }
          currentChunk += para + '\n';
        }
        if (currentChunk.length > 100) {
          const pts = await askAI(currentChunk, name, `p${i}.${sub}`);
          surahPoints.push(...pts);
          await delay(CONFIG.DELAY_MS);
        }
      } else {
        const pts = await askAI(pageText, name, `p${i}`);
        surahPoints.push(...pts);
        await delay(CONFIG.DELAY_MS);
      }
    }
    
    // Deduplicate
    const seen = new Set();
    surahPoints = surahPoints.filter(p => {
      const key = `${p.ayah}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    if (surahPoints.length > 0) {
      const sql = toSQL(surahNum, surahPoints);
      fs.appendFileSync(CONFIG.OUTPUT_SQL, `\n-- سورة ${name} (${surahNum}) - ${surahPoints.length} points\n` + sql.join('\n') + '\n');
      totalPoints += surahPoints.length;
      successCount++;
      console.log(`  ✅ ${surahPoints.length} points\n`);
    } else {
      failCount++;
      console.log(`  ⚠️ 0 points\n`);
    }
  }

  console.log(`\n🏁 Terminé !`);
  console.log(`   ✅ ${successCount} sourates OK`);
  console.log(`   ⚠️ ${failCount} sourates échouées`);
  console.log(`   📊 ${totalPoints} points de Waqf`);
  console.log(`   📄 → ${CONFIG.OUTPUT_SQL}`);
}

start().catch(console.error);
