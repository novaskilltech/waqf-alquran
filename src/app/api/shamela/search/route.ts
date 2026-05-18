import { NextResponse } from 'next/server';
import { configure, getMaster } from 'shamela';
import path from 'path';

// Initialiser le SDK avec les clés du projet
configure({
  apiKey: process.env.SHAMELA_API_KEY || "a81267-6a3bfd-15ea5d-47baac-33c9c2",
  booksEndpoint: process.env.SHAMELA_BOOKS_ENDPOINT || "https://dev.shamela.ws/api/v1/patches/book-updates",
  masterPatchEndpoint: process.env.SHAMELA_MASTER_ENDPOINT || "https://dev.shamela.ws/api/v1/patches/master",
  sqlJsWasmUrl: path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
});

// Cache en mémoire pour la base de données master
let cachedMaster: any = null;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Charger la master database si elle n'est pas en cache
    if (!cachedMaster) {
      console.log('Downloading/loading Shamela master database...');
      // getMaster télécharge le patch et parse la base SQLite en mémoire
      cachedMaster = await getMaster();
      console.log(`Loaded ${cachedMaster.books.length} books and ${cachedMaster.categories.length} categories.`);
    }

    let filteredBooks = cachedMaster.books;

    // Filtre par texte
    if (query) {
      filteredBooks = filteredBooks.filter((b: any) => 
        (b.name && b.name.toLowerCase().includes(query)) || 
        (b.authorName && b.authorName.toLowerCase().includes(query))
      );
    }

    // Filtre par catégorie
    if (category) {
      filteredBooks = filteredBooks.filter((b: any) => b.categoryId === parseInt(category));
    }

    const total = filteredBooks.length;
    const paginatedBooks = filteredBooks.slice(offset, offset + limit).map((b: any) => ({
      id: b.id,
      name: b.name,
      category_id: b.categoryId,
      author_id: b.authorId,
      author_name: b.authorName,
      info: b.betaka || b.metadata
    }));

    return NextResponse.json({
      success: true,
      data: paginatedBooks,
      total: total
    });
  } catch (error: any) {
    console.error('API Shamela Search Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
