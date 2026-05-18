const fs = require('fs');

async function testExtraction() {
  const SUPABASE_URL = 'https://tqbcmcddnohnqmcxvgut.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0';

  const res = await fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint?methodology=eq.BOOKS&limit=100`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  
  const points = await res.json();
  let matches = 0;
  
  for (const p of points) {
    const data = JSON.parse(p.data);
    const expl = data.explanation;
    // Look for words between guillemets « »
    const match = expl.match(/«([^»]+)»/);
    if (match) {
      console.log(`FOUND: [${match[1]}] in "${expl.substring(0, 50)}..."`);
      matches++;
    } else {
      console.log(`NO MATCH: "${expl.substring(0, 50)}..."`);
    }
  }
  console.log(`\nFound target word in ${matches} out of ${points.length} explanations.`);
}

testExtraction().catch(console.error);
