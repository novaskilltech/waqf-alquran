const { configure, getMaster } = require('shamela');
const path = require('path');

configure({
  apiKey: "a81267-6a3bfd-15ea5d-47baac-33c9c2",
  booksEndpoint: "https://dev.shamela.ws/api/v1/patches/book-updates",
  masterPatchEndpoint: "https://dev.shamela.ws/api/v1/patches/master",
  sqlJsWasmUrl: path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
});

async function main() {
  try {
    console.log("Fetching master database...");
    const master = await getMaster();
    console.log("Success! Books:", master.books.length);
  } catch (error) {
    console.error("Error fetching master:", error.message);
  }
}
main();
