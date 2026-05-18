const fs = require('fs');

async function countQuotes() {
  const SUPABASE_URL = 'https://tqbcmcddnohnqmcxvgut.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0';

  let offset = 0;
  const limit = 1000;
  let hasMore = true;
  let allPoints = [];

  while (hasMore) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint?methodology=eq.BOOKS&select=data&limit=${limit}&offset=${offset}`, {
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
  
  let withQuotes = 0;
  let withoutQuotes = 0;
  
  for (const p of allPoints) {
    const data = JSON.parse(p.data);
    const expl = data.explanation || '';
    if (expl.match(/«([^»]+)»/)) {
      withQuotes++;
    } else {
      withoutQuotes++;
    }
  }
  
  console.log(`Total: ${allPoints.length}`);
  console.log(`With quotes: ${withQuotes} (${Math.round(withQuotes / allPoints.length * 100)}%)`);
  console.log(`Without quotes: ${withoutQuotes} (${Math.round(withoutQuotes / allPoints.length * 100)}%)`);
}

countQuotes().catch(console.error);
