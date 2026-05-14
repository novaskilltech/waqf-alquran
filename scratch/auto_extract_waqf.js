const fs = require('fs');
const path = require('path');

// Manual .env loading
const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const env = Object.fromEntries(envFile.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/"/g, '');
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/"/g, '');

const WAQF_MAP = {
  'ۖ': { ruling: 'صلي', explanation: 'الوصل أولى مع جواز الوقف' },
  'ۗ': { ruling: 'قلي', explanation: 'الوقف أولى مع جواز الوصل' },
  'ۚ': { ruling: 'ج', explanation: 'وقف جائز مستوى الطرفين' },
  'ۘ': { ruling: 'م', explanation: 'وقف لازم' },
  'ۙ': { ruling: 'لا', explanation: 'لا تقف هنا (إلا عند الضرورة)' },
  'ۛ': { ruling: 'تعانق', explanation: 'وقف التمانع: إذا وقفت على أحدهما لا تقف على الآخر' }
};

async function processAllAyahs() {
  console.log('🚀 Starting Waqf Extraction for all Ayahs...');

  let allAyahs = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    console.log(`📡 Fetching ayahs ${page * pageSize} to ${(page + 1) * pageSize}...`);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/Ayah?select=id,textOthmani&limit=${pageSize}&offset=${page * pageSize}`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const data = await res.json();
    if (!data || data.length === 0) break;
    allAyahs = allAyahs.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log(`📦 Found ${allAyahs.length} ayahs in total.`);

  const waqfPoints = [];

  for (const ayah of allAyahs) {
    const words = ayah.textOthmani.split(' ');
    words.forEach((word, index) => {
      // Check for any waqf character in the word
      for (const [char, info] of Object.entries(WAQF_MAP)) {
        if (word.includes(char)) {
          waqfPoints.push({
            ayahId: ayah.id,
            wordIndex: index,
            methodology: 'MADINA',
            status: 'APPROVED',
            data: JSON.stringify({
              ruling: info.ruling,
              hukumIbtida: 'جائز',
              explanation: info.explanation,
              source: 'مصحف المدينة (النص العثماني)',
              taalil: 'مستخرج تلقائيا من علامات المصحف'
            })
          });
        }
      }
    });
  }

  console.log(`✨ Extracted ${waqfPoints.length} waqf points. Ingesting...`);

  // 2. Bulk Ingest (chunks of 500)
  for (let i = 0; i < waqfPoints.length; i += 500) {
    const chunk = waqfPoints.slice(i, i + 500);
    const postRes = await fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(chunk)
    });
    
    if (postRes.ok) {
      console.log(`✅ Ingested ${i + chunk.length}/${waqfPoints.length}`);
    } else {
      console.error(`❌ Error at ${i}:`, await postRes.text());
    }
  }

  console.log('🎉 Bulk Ingestion Complete!');
}

processAllAyahs();
