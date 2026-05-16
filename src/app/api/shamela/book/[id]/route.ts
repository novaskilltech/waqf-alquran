import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const CONFIG = {
  API_KEY: "a81267-6a3bfd-15ea5d-47baac-33c9c2",
  BASE_URL: "https://dev.shamela.ws/api/v1",
  DATA_DIR: path.join(process.cwd(), 'shamela_data'),
};

// Assurer l'existence du dossier de données
if (!fs.existsSync(CONFIG.DATA_DIR)) {
  fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const bookId = params.id;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');

  const bookPath = path.join(CONFIG.DATA_DIR, `${bookId}.json`);

  try {
    let bookData: any;

    // 1. Vérifier le cache
    if (fs.existsSync(bookPath)) {
      bookData = JSON.parse(fs.readFileSync(bookPath, 'utf8'));
    } else {
      // 2. Récupérer le patch URL
      const patchRes = await fetch(`${CONFIG.BASE_URL}/patches/book-updates/${bookId}?api_key=${CONFIG.API_KEY}&major_release=0&minor_release=0`);
      
      if (patchRes.status === 204) {
        return NextResponse.json({ error: "Livre non disponible sur l'API Shamela" }, { status: 404 });
      }

      const patchInfo = await patchRes.json();
      if (!patchInfo.major_release_url) {
        throw new Error("URL de patch manquante");
      }

      // 3. Télécharger et extraire
      const zipRes = await fetch(patchInfo.major_release_url);
      const buffer = await zipRes.arrayBuffer();
      const zip = new AdmZip(Buffer.from(buffer));
      
      const results: any = { pages: [], titles: [] };
      const entries = zip.getEntries();

      for (const entry of entries) {
        if (entry.entryName.endsWith('.db')) {
          const tableName = entry.entryName.replace('.db', '');
          const dbBuffer = entry.getData();
          const tempDbPath = path.join(CONFIG.DATA_DIR, `temp_${bookId}_${Date.now()}.db`);

          fs.writeFileSync(tempDbPath, dbBuffer);
          const db = new Database(tempDbPath);
          const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
          db.close();
          fs.unlinkSync(tempDbPath);

          results[tableName === 'page' ? 'pages' : 'titles'] = rows;
        }
      }

      bookData = results;
      // 4. Sauvegarder dans le cache
      fs.writeFileSync(bookPath, JSON.stringify(bookData));
    }

    // 5. Filtrer par page si demandé
    if (page) {
      const pageNum = parseInt(page);
      const filteredPages = bookData.pages.filter((p: any) => p.page === pageNum);
      return NextResponse.json({ pages: filteredPages });
    }

    return NextResponse.json(bookData);

  } catch (error: any) {
    console.error("Shamela Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
