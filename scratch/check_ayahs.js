const fs = require('fs');
const https = require('https');

const sql = fs.readFileSync('manar_waqf_71_114_fixed.sql', 'utf8');
const re = /"surahNumber"\s*=\s*(\d+)\s+AND\s+"number"\s*=\s*(\d+)/g;

const pairs = new Set();
let m;
while ((m = re.exec(sql)) !== null) {
  pairs.add(m[1] + ':' + m[2]);
}

// Group by surah
const grouped = {};
for (const p of pairs) {
  const [s, a] = p.split(':');
  if (!grouped[s]) grouped[s] = [];
  grouped[s].push(parseInt(a));
}

console.log('=== Ayah references in manar_waqf_71_114_fixed.sql ===');
for (const s of Object.keys(grouped).sort((a, b) => a - b)) {
  grouped[s].sort((a, b) => a - b);
  console.log(`Surah ${s}: ayahs [${grouped[s].join(',')}]`);
}

// Now check against Supabase
const SUPABASE_URL = 'tqbcmcddnohnqmcxvgut.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0';

const allSurahs = Object.keys(grouped).join(',');
const url = `/rest/v1/Ayah?select=number,surahNumber&surahNumber=in.(${allSurahs})&order=surahNumber,number&limit=1000`;

const opts = {
  hostname: SUPABASE_URL,
  path: url,
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`
  }
};

https.get(opts, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    const rows = JSON.parse(data);
    const dbSet = new Set(rows.map(r => r.surahNumber + ':' + r.number));
    
    console.log('\n=== MISSING Ayahs (in SQL but NOT in DB) ===');
    let missing = 0;
    for (const p of pairs) {
      if (!dbSet.has(p)) {
        console.log(`  MISSING: Surah ${p.split(':')[0]}, Ayah ${p.split(':')[1]}`);
        missing++;
      }
    }
    if (missing === 0) {
      console.log('  None! All ayahs exist in the database.');
    } else {
      console.log(`\nTotal missing: ${missing}`);
    }
  });
}).on('error', (e) => console.error(e));
