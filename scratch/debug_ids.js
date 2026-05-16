const fs = require('fs');
const path = require('path');

const bookData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'shamela_data', '6496.json'), 'utf8'));

const ids = bookData.pages.map(p => p.id);
console.log("Min ID:", Math.min(...ids));
console.log("Max ID:", Math.max(...ids));
console.log("Count:", ids.length);

const ikhlas = bookData.titles.find(t => t.content.includes("الإخلاص"));
console.log("Ikhlas Title:", ikhlas);

const pageMatch = bookData.pages.find(p => p.id == ikhlas.page || p.page == ikhlas.page);
console.log("Found Page:", pageMatch ? "Yes (ID: " + pageMatch.id + ", Page: " + pageMatch.page + ")" : "No");
