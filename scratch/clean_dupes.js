const fs = require('fs');

async function removeDuplicates() {
  const SUPABASE_URL = 'https://tqbcmcddnohnqmcxvgut.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0';

  let offset = 0;
  const limit = 1000;
  let hasMore = true;
  let allPoints = [];

  while (hasMore) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint?methodology=eq.BOOKS&select=id,ayahId,data&limit=${limit}&offset=${offset}`, {
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
  
  const seen = new Set();
  const toDelete = [];
  
  for (const p of allPoints) {
    const key = p.ayahId + '|' + p.data;
    if (seen.has(key)) {
      toDelete.push(p.id);
    } else {
      seen.add(key);
    }
  }
  
  console.log('Found', toDelete.length, 'duplicates to delete out of', allPoints.length);
  
  for (let i = 0; i < toDelete.length; i += 100) {
    const batch = toDelete.slice(i, i + 100);
    const deleteRes = await fetch(SUPABASE_URL + '/rest/v1/WaqfPoint?id=in.(' + batch.join(',') + ')', {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });
    console.log('Deleted batch', i, 'status:', deleteRes.status);
  }
}

removeDuplicates().catch(console.error);
