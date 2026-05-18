const fs = require('fs');

async function search() {
  try {
    const res = await fetch("http://localhost:3001/api/books");
    if (!res.ok) {
      console.log("Local API not running?", res.status);
      return;
    }
    const data = await res.json();
    console.log(`Total books loaded: ${data.length}`);
    
    const waqfBooks = data.filter(b => b.name && b.name.includes("الوقف"));
    console.log("Waqf books found:", waqfBooks.map(b => `${b.id} - ${b.name}`));
    
    const muktafa = data.filter(b => b.name && b.name.includes("المكتفى"));
    console.log("Muktafa found:", muktafa.map(b => `${b.id} - ${b.name}`));
    
    const maqsid = data.filter(b => b.name && b.name.includes("المقصد"));
    console.log("Maqsid found:", maqsid.map(b => `${b.id} - ${b.name}`));

  } catch (e) {
    console.error("Error:", e.message);
  }
}

search();
