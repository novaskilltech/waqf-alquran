
const fs = require('fs');
const path = require('path');

// Manual .env loading
const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const env = Object.fromEntries(envFile.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/"/g, '');
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/"/g, '');

async function ingestRemaining() {
  console.log('📥 Ingesting Surahs 1 to 49...');

  for (let s = 1; s <= 49; s++) {
    console.log(`📡 Fetching Surah ${s}...`);
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${s}/quran-uthmani`);
    const data = await res.json();
    const ayahs = data.data.ayahs;

    const payload = ayahs.map(a => ({
      id: `s${s}a${a.numberInSurah}`,
      number: a.numberInSurah,
      surahNumber: s,
      textOthmani: a.text,
      textSimple: a.text.replace(/[\u064B-\u065F\u06D6-\u06ED]/g, '') // Basic normalization
    }));

    const postRes = await fetch(`${SUPABASE_URL}/rest/v1/Ayah`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    if (postRes.ok) {
      console.log(`✅ Surah ${s} ingested.`);
    } else {
      console.error(`❌ Error Surah ${s}:`, await postRes.text());
    }
  }
  console.log('🎉 All Ayahs ingested!');
}

ingestRemaining();
