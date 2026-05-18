const fs = require('fs');

const SUPABASE_URL = 'https://tqbcmcddnohnqmcxvgut.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0';

const KILO_API_KEY = process.env.AI_PROVIDER_API_KEY || '';
const KILO_URL = 'https://api.kilo.ai/api/gateway/chat/completions';

async function testKiloBatch() {
  // Fetch 5 Ayahs and their Waqf points that do not have quotes
  const res = await fetch(`${SUPABASE_URL}/rest/v1/Ayah?surahNumber=eq.3&number=in.(21,22,23,24,25)&select=id,textOthmani,WaqfPoint(*)`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  const ayahs = await res.json();
  
  const batch = [];
  for (const ayah of ayahs) {
    for (const p of ayah.WaqfPoint) {
      if (p.methodology !== 'BOOKS') continue;
      const data = JSON.parse(p.data);
      const expl = data.explanation || '';
      if (!expl.includes('«')) {
        batch.push({
          id: p.id,
          ayahText: ayah.textOthmani,
          explanation: expl,
          ruling: data.ruling
        });
      }
    }
  }
  
  console.log(`Found ${batch.length} items for the test batch.`);
  if (batch.length === 0) return;
  
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

  console.log("Sending to Kilo AI...");
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
        { role: 'user', content: JSON.stringify(batch, null, 2) }
      ],
      temperature: 0.1
    })
  });
  
  const resText = await response.text();
  console.log("Raw Response Status:", response.status, response.statusText);
  console.log("Raw Response Text:\n", resText);
  
  try {
    const resData = JSON.parse(resText);
    const content = resData.choices[0].message.content;
    console.log("Response Content:\n", content);
    const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
    console.log("Successfully parsed JSON!", parsed);
  } catch (err) {
    console.error("Failed to parse JSON response:", err);
  }
}

testKiloBatch().catch(console.error);
