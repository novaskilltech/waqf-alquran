const fs = require('fs');

function removeTashkeel(text) {
  return text.replace(/[\u064B-\u065F\u0670\u0651\u0652]/g, '');
}

async function fixWordIndexes() {
  const SUPABASE_URL = 'https://tqbcmcddnohnqmcxvgut.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0';

  console.log("Fetching all Ayahs...");
  let offsetAyah = 0;
  const limitAyah = 1000;
  let hasMoreAyah = true;
  let ayahsList = [];

  while (hasMoreAyah) {
    const ayahsRes = await fetch(`${SUPABASE_URL}/rest/v1/Ayah?select=id,textOthmani&limit=${limitAyah}&offset=${offsetAyah}`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const ayahsBatch = await ayahsRes.json();
    if (ayahsBatch.length === 0) {
      hasMoreAyah = false;
      break;
    }
    ayahsList = ayahsList.concat(ayahsBatch);
    offsetAyah += limitAyah;
  }
  
  const ayahsMap = {};
  for (const a of ayahsList) {
    ayahsMap[a.id] = a.textOthmani;
  }

  console.log("Fetching all BOOKS Waqf points...");
  let offset = 0;
  const limit = 1000;
  let hasMore = true;
  let allPoints = [];

  while (hasMore) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint?methodology=eq.BOOKS&select=id,ayahId,data,wordIndex&limit=${limit}&offset=${offset}`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });
    const points = await res.json();
    if (points.length === 0) {
      hasMore = false;
      break;
    }
    allPoints = allPoints.concat(points);
    offset += limit;
  }
  
  console.log(`Processing ${allPoints.length} points...`);
  
  const updates = [];
  
  for (const p of allPoints) {
    const textOthmani = ayahsMap[p.ayahId];
    if (!textOthmani) continue;
    
    const words = textOthmani.split(/\s+/).filter(w => w.trim());
    const wordsNoTashkeel = words.map(removeTashkeel);
    
    const data = JSON.parse(p.data);
    const expl = data.explanation || '';
    
    let newWordIndex = words.length - 1; // Fallback to LAST word
    
    // Try to find words in quotes
    const match = expl.match(/«([^»]+)»/);
    if (match) {
      const targetWord = removeTashkeel(match[1]).trim().split(/\s+/)[0];
      const idx = wordsNoTashkeel.findIndex(w => w.includes(targetWord) || targetWord.includes(w));
      if (idx !== -1) {
        newWordIndex = idx;
      }
    }
    
    if (p.wordIndex !== newWordIndex) {
      updates.push({
        id: p.id,
        ayahId: p.ayahId,
        wordIndex: newWordIndex,
        methodology: 'BOOKS',
        status: 'APPROVED',
        data: p.data
      });
    }
  }
  
  console.log(`Found ${updates.length} points to update.`);
  
  // Update in batches
  for (let i = 0; i < updates.length; i += 100) {
    const batch = updates.slice(i, i + 100);
    // Supabase bulk update using UPSERT
    const res = await fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint`, {
      method: 'POST', // UPSERT
      headers: { 
        'apikey': SUPABASE_KEY, 
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(batch)
    });
    console.log(`Updated batch ${i} - Status: ${res.status}`);
  }
  
  console.log("Done!");
}

fixWordIndexes().catch(console.error);
