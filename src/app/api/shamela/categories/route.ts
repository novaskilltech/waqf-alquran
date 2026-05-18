import { NextResponse } from 'next/server';
import { configure, getMaster } from 'shamela';
import path from 'path';

configure({
  apiKey: process.env.SHAMELA_API_KEY || "a81267-6a3bfd-15ea5d-47baac-33c9c2",
  booksEndpoint: process.env.SHAMELA_BOOKS_ENDPOINT || "https://dev.shamela.ws/api/v1/patches/book-updates",
  masterPatchEndpoint: process.env.SHAMELA_MASTER_ENDPOINT || "https://dev.shamela.ws/api/v1/patches/master",
  sqlJsWasmUrl: path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
});

let cachedMaster: any = null;

export async function GET() {
  try {
    if (!cachedMaster) {
      cachedMaster = await getMaster();
    }

    return NextResponse.json({
      success: true,
      data: cachedMaster.categories || []
    });
  } catch (error: any) {
    console.error('API Shamela Categories Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
