const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://tqbcmcddnohnqmcxvgut.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0";

async function getAyahsCache() {
  console.log("Fetching all Ayahs to build cache...");
  const cache = {};
  
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/Ayah?select=id,surahNumber,number&limit=${limit}&offset=${offset}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch Ayahs: " + await response.text());
    }
    
    const ayahs = await response.json();
    if (ayahs.length === 0) {
      hasMore = false;
      break;
    }
    
    for (const ayah of ayahs) {
      cache[`${ayah.surahNumber}_${ayah.number}`] = ayah.id;
    }
    offset += limit;
  }
  
  console.log(`Cached ${Object.keys(cache).length} Ayahs.`);
  return cache;
}

async function ingestWaqfPoints() {
  const sqlFile = path.join(process.cwd(), 'manar_waqf_1_70.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  const ayahsCache = await getAyahsCache();
  const lines = sql.split('\n');
  const payloads = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('VALUES ((SELECT id FROM "Ayah"')) {
      // Find surahNumber and number
      const surahMatch = line.match(/"surahNumber" = (\d+)/);
      const numberMatch = line.match(/"number" = (\d+)/);
      
      if (!surahMatch || !numberMatch) {
        i++;
        continue;
      }
      
      const surahNumber = parseInt(surahMatch[1]);
      const ayahNumber = parseInt(numberMatch[1]);
      
      // The rest of the line: ), 0, 'BOOKS', 'APPROVED', '{...JSON...}')
      // We can just extract the JSON payload by finding the first '{' and the last '}'
      const firstBrace = line.indexOf('{');
      const lastBrace = line.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        console.warn(`Could not parse JSON for Surah ${surahNumber} Ayah ${ayahNumber}`);
        i++;
        continue;
      }
      
      let dataStr = line.substring(firstBrace, lastBrace + 1);
      // Replace '' with ' if they were escaped for SQL
      dataStr = dataStr.replace(/''/g, "'");
      
      let dataObj;
      try {
        dataObj = JSON.parse(dataStr);
      } catch (e) {
        console.error(`Failed to parse JSON for S${surahNumber} A${ayahNumber}:`, dataStr);
        i++;
        continue;
      }
      
      const ayahId = ayahsCache[`${surahNumber}_${ayahNumber}`];
      if (!ayahId) {
        console.warn(`Warning: Could not find ayahId for Surah ${surahNumber} Ayah ${ayahNumber}`);
        i++;
        continue;
      }
      
      payloads.push({
        ayahId,
        wordIndex: 0,
        methodology: 'BOOKS',
        status: 'APPROVED',
        data: dataObj
      });
    }
    i++;
  }
  
  console.log(`Parsed ${payloads.length} WaqfPoints to insert.`);
  
  let successCount = 0;
  for (let idx = 0; idx < payloads.length; idx += 1000) {
    const batch = payloads.slice(idx, idx + 1000);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(batch)
    });
    
    if (res.ok) {
      successCount += batch.length;
      console.log(`Inserted ${successCount} WaqfPoints...`);
    } else {
      console.error(`Failed at batch ${idx}:`, await res.text());
    }
  }
  
  console.log(`\n✅ Finished successfully! Inserted ${successCount} WaqfPoints.`);
}

ingestWaqfPoints().catch(console.error);
