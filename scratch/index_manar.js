const AdmZip = require('adm-zip');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  API_KEY: "a81267-6a3bfd-15ea5d-47baac-33c9c2",
  BASE_URL: "https://dev.shamela.ws/api/v1",
  DATA_DIR: path.join(process.cwd(), 'shamela_data'),
  BOOK_ID: 6496 // Manar al-Huda
};

if (!fs.existsSync(CONFIG.DATA_DIR)) fs.mkdirSync(CONFIG.DATA_DIR);

async function downloadAndIndex() {
  console.log(`📡 Téléchargement du livre ${CONFIG.BOOK_ID}...`);
  
  const patchRes = await fetch(`${CONFIG.BASE_URL}/patches/book-updates/${CONFIG.BOOK_ID}?api_key=${CONFIG.API_KEY}&major_release=0&minor_release=0`);
  const patchInfo = await patchRes.json();
  
  const zipRes = await fetch(patchInfo.major_release_url);
  const buffer = await zipRes.arrayBuffer();
  const zip = new AdmZip(Buffer.from(buffer));
  
  const entries = zip.getEntries();
  const results = { pages: [], titles: [] };

  for (const entry of entries) {
    console.log(`📦 Fichier trouvé dans ZIP: ${entry.entryName}`);
    if (entry.entryName.endsWith('.db') || entry.entryName.endsWith('.sqlite')) {
      const tempDbPath = path.join(CONFIG.DATA_DIR, `temp_${CONFIG.BOOK_ID}.db`);
      fs.writeFileSync(tempDbPath, entry.getData());
      
      const db = new Database(tempDbPath);
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      console.log(`📊 Tables trouvées dans ${entry.entryName}:`, tables.map(t => t.name).join(', '));
      
      // Essayer de mapper intelligemment
      if (tables.find(t => t.name === 'page')) {
        results.pages = db.prepare(`SELECT * FROM page`).all();
      } else if (tables.find(t => t.name === 'pages')) {
        results.pages = db.prepare(`SELECT * FROM pages`).all();
      }

      if (tables.find(t => t.name === 'title')) {
        results.titles = db.prepare(`SELECT * FROM title`).all();
      } else if (tables.find(t => t.name === 'titles')) {
        results.titles = db.prepare(`SELECT * FROM titles`).all();
      }

      db.close();
      fs.unlinkSync(tempDbPath);
    }

  }

  fs.writeFileSync(path.join(CONFIG.DATA_DIR, `${CONFIG.BOOK_ID}.json`), JSON.stringify(results));
  console.log(`✅ Livre ${CONFIG.BOOK_ID} indexé (${results.pages.length} pages, ${results.titles.length} titres).`);
  
  // Chercher les titres pour les surates 71+
  const surahTitles = results.titles.filter(t => t.content.includes("سورة"));
  console.log("📍 Aperçu des titres trouvés :");
  surahTitles.slice(-10).forEach(t => console.log(`- ${t.content} (Page: ${t.page})`));
}

downloadAndIndex().catch(console.error);
