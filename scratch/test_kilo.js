const AI_URL = "https://api.kilo.ai/api/gateway/chat/completions";

const AI_KEY = process.env.AI_PROVIDER_API_KEY || "";

async function test() {
  console.log("Starting test...");
  try {
    const res = await fetch(AI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_KEY}`
      },
      body: JSON.stringify({
        model: "kilo-auto/free",
        messages: [{ role: "user", content: "hi" }]
      })
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data:", data.choices[0].message.content);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
