const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const Database = require('better-sqlite3');

const CONFIG = {
  API_KEY: "a81267-6a3bfd-15ea5d-47baac-33c9c2",
  BASE_URL: "https://dev.shamela.ws/api/v1",
  DATA_DIR: path.join(__dirname, '..', 'shamela_data'),
};

const BOOKS_TO_DOWNLOAD = [
  { id: 12056, name: "Al-Muktafa (Dani)" },
  { id: 11520, name: "Idah al-Waqf (Ibn al-Anbari)" },
  { id: 11624, name: "Al-Maqsid (Zakariyya al-Ansari)" },
  { id: 6496, name: "Manar al-Huda (Ashmuni)" } // Test one that exists
];

if (!fs.existsSync(CONFIG.DATA_DIR)) {
  fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
}

async function fetchWithHeaders(url) {
  return fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://shamela.ws',
      'Referer': 'https://shamela.ws/'
    }
  });
}

async function downloadBook(book) {
  const bookPath = path.join(CONFIG.DATA_DIR, `${book.id}.json`);
  
  if (fs.existsSync(bookPath)) {
    console.log(`✅ [${book.id}] ${book.name} is already downloaded.`);
    return;
  }
  
  console.log(`📥 Downloading [${book.id}] ${book.name}...`);
  try {
    const patchRes = await fetchWithHeaders(`${CONFIG.BASE_URL}/patches/book-updates/${book.id}?api_key=${CONFIG.API_KEY}&major_release=0&minor_release=0`);
    
    if (patchRes.status !== 200) {
      const text = await patchRes.text();
      console.log(`❌ [${book.id}] ${book.name}: API returned ${patchRes.status}. Body:`, text.substring(0, 100));
      return;
    }

    const patchInfo = await patchRes.json();
    if (!patchInfo.major_release_url) {
      console.log(`❌ [${book.id}] ${book.name}: Missing download URL. Data:`, patchInfo);
      return;
    }

    console.log(`   Downloading zip from ${patchInfo.major_release_url}...`);
    const zipRes = await fetchWithHeaders(patchInfo.major_release_url);
    const buffer = await zipRes.arrayBuffer();
    const zip = new AdmZip(Buffer.from(buffer));
    
    const results = { pages: [], titles: [] };
    const entries = zip.getEntries();

    for (const entry of entries) {
      if (entry.entryName.endsWith('.db')) {
        const tableName = entry.entryName.replace('.db', '');
        const dbBuffer = entry.getData();
        const tempDbPath = path.join(CONFIG.DATA_DIR, `temp_${book.id}_${Date.now()}.db`);

        fs.writeFileSync(tempDbPath, dbBuffer);
        const db = new Database(tempDbPath);
        const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
        db.close();
        fs.unlinkSync(tempDbPath);

        if (tableName === 'page') results.pages = rows;
        if (tableName === 'title') results.titles = rows;
      }
    }

    fs.writeFileSync(bookPath, JSON.stringify(results));
    console.log(`✅ [${book.id}] ${book.name} downloaded and saved successfully (${results.pages.length} pages).`);
  } catch (error) {
    console.error(`❌ Error downloading [${book.id}] ${book.name}:`, error.message);
  }
}

async function main() {
  for (const book of BOOKS_TO_DOWNLOAD) {
    await downloadBook(book);
  }
}

main();
