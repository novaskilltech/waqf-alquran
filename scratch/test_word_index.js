const fs = require('fs');

// Utility to remove Arabic diacritics (Tashkeel)
function removeTashkeel(text) {
  return text.replace(/[\u064B-\u065F\u0670\u0651\u0652]/g, '');
}

async function testWordIndexHeuristic() {
  const SUPABASE_URL = 'https://tqbcmcddnohnqmcxvgut.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0';

  // Fetch some random Ayahs and their Waqf points
  const res = await fetch(`${SUPABASE_URL}/rest/v1/Ayah?surahNumber=eq.3&number=in.(7,8,9,10,11)&select=id,textOthmani,WaqfPoint(*)`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  
  const ayahs = await res.json();
  
  for (const ayah of ayahs) {
    const words = ayah.textOthmani.split(/\s+/).filter(w => w.trim());
    const wordsNoTashkeel = words.map(removeTashkeel);
    
    console.log(`\nAyah ${ayah.id}: ${ayah.textOthmani.substring(0, 50)}... (${words.length} words)`);
    
    for (const p of ayah.WaqfPoint) {
      if (p.methodology !== 'BOOKS') continue;
      
      const data = JSON.parse(p.data);
      const expl = data.explanation || '';
      
      let wordIndex = words.length - 1; // Fallback to LAST word
      let matchedReason = "Fallback to last word";
      
      // Try to find words in quotes
      const match = expl.match(/«([^»]+)»/);
      if (match) {
        const targetWord = removeTashkeel(match[1]).trim().split(/\s+/)[0]; // Use first word of the quote
        // Find index of this word in the Ayah
        const idx = wordsNoTashkeel.findIndex(w => w.includes(targetWord) || targetWord.includes(w));
        if (idx !== -1) {
          wordIndex = idx;
          matchedReason = `Matched quoted word "«${match[1]}»" -> ${words[idx]}`;
        }
      }
      
      console.log(` - Point [${data.ruling}]: ${expl.substring(0, 50).replace(/\n/g, ' ')}...`);
      console.log(`   -> Assigned Index: ${wordIndex} (${words[wordIndex]}) [Reason: ${matchedReason}]`);
    }
  }
}

testWordIndexHeuristic().catch(console.error);
