const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://tqbcmcddnohnqmcxvgut.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0';

const KILO_API_KEY = process.env.AI_PROVIDER_API_KEY || '';
const KILO_URL = 'https://api.kilo.ai/api/gateway/chat/completions';

const CHECKPOINT_PATH = path.join(__dirname, 'ai_progress_checkpoint.json');

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

async function callKiloWithRetry(batch, attempt = 1) {
  const systemPrompt = `You are an Arabic grammar assistant.
Given a list of Quranic verses and a Waqf explanation (which describes why or where to stop), identify the exact word in the verse that the explanation is referring to.
Return a JSON array of objects, each containing:
- "id": the input item id
- "targetWord": the exact word from the verse

Example output format:
[
  { "id": "uuid", "targetWord": "معدودات" }
]

Do not include any extra text. ONLY return the JSON array.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

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
          { role: 'user', content: JSON.stringify(batch) }
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
    const content = resData.choices[0].message.content;
    const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
    return parsed;
  } catch (err) {
    clearTimeout(timeoutId);
    if (attempt < 3) {
      console.warn(`Attempt ${attempt} failed. Retrying in 5 seconds... Error: ${err.message}`);
      await new Promise(r => setTimeout(r, 5000));
      return callKiloWithRetry(batch, attempt + 1);
    }
    throw err;
  }
}

async function main() {
  const ayahsMap = await fetchAllAyahs();
  const allPoints = await fetchAllBooksPoints();
  const checkpoints = await loadCheckpoints();

  // Filter only items without quotes in explanation AND not already processed
  const toFix = [];
  for (const p of allPoints) {
    const textOthmani = ayahsMap[p.ayahId];
    if (!textOthmani) continue;

    const data = JSON.parse(p.data);
    const expl = data.explanation || '';
    
    // Check if it doesn't have quotes AND has not been processed by AI yet
    if (!expl.includes('«') && !checkpoints[p.id]) {
      toFix.push({
        id: p.id,
        ayahId: p.ayahId,
        ayahText: textOthmani,
        explanation: expl,
        ruling: data.ruling
      });
    }
  }

  console.log(`Found ${toFix.length} points to process with AI.`);
  if (toFix.length === 0) {
    console.log("No points need AI processing!");
    return;
  }

  // Chunk into batches of 10
  const batchSize = 10;
  const batches = [];
  for (let i = 0; i < toFix.length; i += batchSize) {
    batches.push(toFix.slice(i, i + batchSize));
  }

  console.log(`Created ${batches.length} batches of size ${batchSize}. Starting sequential pipeline...`);

  for (let bIndex = 0; bIndex < batches.length; bIndex++) {
    const batch = batches[bIndex];
    console.log(`\n--- Processing Batch ${bIndex + 1}/${batches.length} (${batch.length} items) ---`);
    
    try {
      // Map to prompt format (only send necessary fields to save tokens)
      const promptItems = batch.map(item => ({
        id: item.id,
        ayahText: item.ayahText,
        explanation: item.explanation
      }));

      const results = await callKiloWithRetry(promptItems);
      
      const dbUpdates = [];

      for (const res of results) {
        const originalItem = batch.find(item => item.id === res.id);
        if (!originalItem) continue;

        const textOthmani = originalItem.ayahText;
        const words = textOthmani.split(/\s+/).filter(w => w.trim());
        const wordsNormalized = words.map(normalizeArabic);

        const targetNormalized = normalizeArabic(res.targetWord);
        
        let targetIndex = words.length - 1; // Fallback to last word
        let matchFound = false;

        // Try exact normalized match
        const idx = wordsNormalized.findIndex(w => w === targetNormalized || w.includes(targetNormalized) || targetNormalized.includes(w));
        if (idx !== -1) {
          targetIndex = idx;
          matchFound = true;
        }

        dbUpdates.push({
          id: originalItem.id,
          ayahId: originalItem.ayahId,
          wordIndex: targetIndex,
          methodology: 'BOOKS',
          status: 'APPROVED',
          data: allPoints.find(p => p.id === originalItem.id).data
        });

        // Save progress locally
        checkpoints[originalItem.id] = {
          targetWord: res.targetWord,
          matchedWord: words[targetIndex],
          wordIndex: targetIndex,
          matchFound
        };
      }

      // Bulk update DB
      if (dbUpdates.length > 0) {
        const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/WaqfPoint`, {
          method: 'POST',
          headers: { 
            'apikey': SUPABASE_KEY, 
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(dbUpdates)
        });
        console.log(`Batch DB Update Status: ${updateRes.status}`);
      }

      saveCheckpoint(checkpoints);
      console.log(`Saved batch checkpoints. Progress saved.`);

      // Short delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));

    } catch (batchErr) {
      console.error(`Error processing batch ${bIndex + 1}:`, batchErr.message);
      // Wait 10 seconds before continuing to next batch
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  console.log("\nPipeline finished successfully!");
}

main().catch(console.error);
