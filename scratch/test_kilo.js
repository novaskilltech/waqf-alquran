const AI_URL = "https://api.kilo.ai/api/gateway/chat/completions";

const AI_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbnYiOiJwcm9kdWN0aW9uIiwia2lsb1VzZXJJZCI6ImQ0ZmEzY2FlLTQxNWMtNDQxMi05NzM4LTZlZDk1NjUwOWIyMSIsImFwaVRva2VuUGVwcGVyIjpudWxsLCJ2ZXJzaW9uIjozLCJpYXQiOjE3Nzg4NjIyNzksImV4cCI6MTkzNjU0MjI3OX0.ztj8qODSAhdbgG4G-b-ttchrBNr6ndMJE_5z7NIOvbo";

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
