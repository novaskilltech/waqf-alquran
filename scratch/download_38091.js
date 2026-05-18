const { configure, getBookMetadata, downloadBook } = require('shamela');
const path = require('path');

configure({
  apiKey: "a81267-6a3bfd-15ea5d-47baac-33c9c2",
  booksEndpoint: "https://dev.shamela.ws/api/v1/patches/book-updates",
  masterPatchEndpoint: "https://dev.shamela.ws/api/v1/patches/master",
  sqlJsWasmUrl: path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
});

async function main() {
  const bookId = 38091;
  try {
    console.log(`Fetching metadata for book ${bookId}...`);
    const metadata = await getBookMetadata(bookId);
    console.log("Metadata:", metadata);
    
    console.log(`Downloading book ${bookId} to JSON...`);
    const outputPath = path.join(process.cwd(), 'shamela_data', `${bookId}.json`);
    await downloadBook(bookId, {
      bookMetadata: metadata,
      outputFile: { path: outputPath }
    });
    console.log(`Done! Downloaded to ${outputPath}`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
