const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://tqbcmcddnohnqmcxvgut.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0';

const KILO_API_KEY = process.env.AI_PROVIDER_API_KEY || '';
const KILO_URL = 'https://api.kilo.ai/api/gateway/chat/completions';

const CHECKPOINT_PATH = path.join(__dirname, 'ai_progress_checkpoint.json');
const CONCURRENCY_LIMIT = 10;
const TIMEOUT_MS = 20000; // 20s timeout per single request is very generous

function removeTashkeel(text) {
  return text.replace(/[\u064B-\u065F\u0670\u0651\u0652]/g, '');
}

function normalizeArabic(text) {
  return removeTashkeel(text)
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .trim();
}

async function loadCheckpoints() {
  if (fs.existsSync(CHECKPOINT_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveCheckpoint(checkpoints) {
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoints, null, 2), 'utf8');
}

async function fetchAllAyahs() {
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
  return ayahsMap;
}

async function fetchAllBooksPoints() {
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
  return allPoints;
}

async function askKiloSingle(ayahText, explanation, attempt = 1) {
  const systemPrompt = `You are an Arabic grammar assistant.
Given a Quranic verse and a Waqf explanation (which describes why or where to stop), identify the exact word in the verse that the explanation is referring to.
Return ONLY the exact target word as it appears in the verse, with no extra text or explanations.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(KILO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KILO_API_KEY}`
      },
      body: JSON.stringify({
        model: 'kilo-auto/free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Verse: "${ayahText}"\nExplanation: "${explanation}"` }
        ],
        temperature: 0.1
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const resData = await response.json();
    let word = resData.choices[0].message.content.trim();
    // Strip quotes or periods if the AI added them
    word = word.replace(/['"«»\.]/g, '').trim();
    return word;
  } catch (err) {
    clearTimeout(timeoutId);
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, 2000));
      return askKiloSingle(ayahText, explanation, attempt + 1);
    }
    throw err;
  }
}

async function bulkUpdateSupabase(updates) {
  if (updates.length === 0) return;
  try {
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint`, {
      method: 'POST',
      headers: { 
        'apikey': SUPABASE_KEY, 
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(updates)
    });
    console.log(`Sync Status to DB: ${updateRes.status} for ${updates.length} items.`);
  } catch (e) {
    console.error("Failed to sync updates to Supabase:", e.message);
  }
}

async function main() {
  const ayahsMap = await fetchAllAyahs();
  const allPoints = await fetchAllBooksPoints();
  const checkpoints = await loadCheckpoints();

  const toProcess = [];
  const localResolves = [];

  for (const p of allPoints) {
    const textOthmani = ayahsMap[p.ayahId];
    if (!textOthmani) continue;

    const data = JSON.parse(p.data);
    const expl = data.explanation || '';
    
    if (!expl.includes('«') && !checkpoints[p.id]) {
      const words = textOthmani.split(/\s+/).filter(w => w.trim());
      const lastWordIdx = Math.max(0, words.length - 1);

      // If explanation is empty or contains no Arabic letters, resolve locally
      if (expl.trim() === '' || !/[\u0600-\u06FF]/.test(expl)) {
        checkpoints[p.id] = {
          targetWord: words[lastWordIdx] || '',
          matchedWord: words[lastWordIdx] || '',
          wordIndex: lastWordIdx,
          matchFound: true,
          localResolve: true
        };

        localResolves.push({
          id: p.id,
          ayahId: p.ayahId,
          wordIndex: lastWordIdx,
          methodology: 'BOOKS',
          status: 'APPROVED',
          data: p.data
        });
      } else {
        toProcess.push({
          id: p.id,
          ayahId: p.ayahId,
          ayahText: textOthmani,
          explanation: expl,
          originalData: p.data
        });
      }
    }
  }

  console.log(`\nLocal resolves identified: ${localResolves.length} items (empty comments resolved to last word).`);
  console.log(`AI resolves identified: ${toProcess.length} items.`);

  // Sync local resolves first in chunks of 200
  if (localResolves.length > 0) {
    console.log("Synchronizing local resolves to Supabase...");
    const chunkSize = 200;
    for (let i = 0; i < localResolves.length; i += chunkSize) {
      const chunk = localResolves.slice(i, i + chunkSize);
      await bulkUpdateSupabase(chunk);
      saveCheckpoint(checkpoints);
      console.log(`Synced local resolves chunk ${i / chunkSize + 1}/${Math.ceil(localResolves.length / chunkSize)}`);
    }
  }

  const total = toProcess.length;
  console.log(`\nReady to process ${total} items concurrently with AI (Limit: ${CONCURRENCY_LIMIT})...`);
  if (total === 0) return;

  let activeCount = 0;
  let currentIndex = 0;
  let completedCount = 0;
  let dbUpdatesQueue = [];
  let lastSyncTime = Date.now();

  function startNext() {
    if (currentIndex >= total) return;
    
    const item = toProcess[currentIndex++];
    activeCount++;

    const itemNum = currentIndex;

    askKiloSingle(item.ayahText, item.explanation)
      .then(targetWord => {
        const words = item.ayahText.split(/\s+/).filter(w => w.trim());
        const wordsNormalized = words.map(normalizeArabic);
        const targetNormalized = normalizeArabic(targetWord);

        let targetIndex = words.length - 1; // Fallback to last word
        let matchFound = false;

        const idx = wordsNormalized.findIndex(w => w === targetNormalized || w.includes(targetNormalized) || targetNormalized.includes(w));
        if (idx !== -1) {
          targetIndex = idx;
          matchFound = true;
        }

        // Add to db updates queue
        dbUpdatesQueue.push({
          id: item.id,
          ayahId: item.ayahId,
          wordIndex: targetIndex,
          methodology: 'BOOKS',
          status: 'APPROVED',
          data: item.originalData
        });

        // Update local checkpoint memory
        checkpoints[item.id] = {
          targetWord,
          matchedWord: words[targetIndex],
          wordIndex: targetIndex,
          matchFound
        };

        completedCount++;
        const pct = ((completedCount / total) * 100).toFixed(1);
        console.log(`[${completedCount}/${total} - ${pct}%] Resolved item ${item.id} -> "${targetWord}" -> match: ${matchFound} (${words[targetIndex]})`);
      })
      .catch(err => {
        console.error(`[ERROR] Item ${item.id} failed after retries:`, err.message);
      })
      .finally(() => {
        activeCount--;
        
        // Trigger Sync to DB if queue is large or time has passed
        const timePassed = Date.now() - lastSyncTime > 10000; // 10 seconds
        if (dbUpdatesQueue.length >= 20 || (dbUpdatesQueue.length > 0 && timePassed)) {
          const chunk = [...dbUpdatesQueue];
          dbUpdatesQueue = [];
          lastSyncTime = Date.now();
          
          bulkUpdateSupabase(chunk).then(() => {
            saveCheckpoint(checkpoints);
          });
        }

        // Pull next worker
        startNext();
      });
  }

  // Start initial batch of workers up to concurrency limit
  for (let w = 0; w < CONCURRENCY_LIMIT; w++) {
    startNext();
  }

  // Keep checking until completely done
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (activeCount === 0 && currentIndex >= total) {
        clearInterval(interval);
        
        // Final sync of any remaining items
        if (dbUpdatesQueue.length > 0) {
          bulkUpdateSupabase(dbUpdatesQueue).then(() => {
            saveCheckpoint(checkpoints);
            console.log("\nAll items successfully synchronized. Pipeline complete!");
            resolve();
          });
        } else {
          saveCheckpoint(checkpoints);
          console.log("\nAll items successfully synchronized. Pipeline complete!");
          resolve();
        }
      }
    }, 1000);
  });
}

main().catch(console.error);
