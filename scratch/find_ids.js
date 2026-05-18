const { getMaster } = require('../data/shamela/dist/index.js'); // Assuming it's built

async function main() {
  try {
    console.log("Fetching master database...");
    const master = await getMaster();
    console.log("Master DB loaded. Total books:", master.books.length);
    
    const waqfBooks = master.books.filter(b => b.name && b.name.includes("الوقف"));
    console.log("Waqf books:", waqfBooks.map(b => `${b.id} - ${b.name}`));

    const maqsid = master.books.filter(b => b.name && b.name.includes("المقصد"));
    console.log("Maqsid books:", maqsid.map(b => `${b.id} - ${b.name}`));
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
