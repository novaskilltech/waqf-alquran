const fs = require('fs');
const path = require('path');
const { convertContentToMarkdown } = require('shamela/content');

const BOOK_PATH = path.join(process.cwd(), 'shamela_data', '38091.json');
const OUTPUT_MD = path.join(process.cwd(), 'manar_theory.md');

async function extractTheory() {
  const bookData = JSON.parse(fs.readFileSync(BOOK_PATH, 'utf8'));
  
  // Find where the actual Tafsir/Surahs start
  const fatihaTitle = bookData.titles.find(t => t.content.includes('الفاتحة'));
  const fatihaPage = fatihaTitle ? parseInt(fatihaTitle.page) : 30; // Usually starts around page 20-30

  console.log(`Extracting theoretical introduction (Pages 1 to ${fatihaPage - 1})...`);

  let markdownContent = `# منار الهدى في بيان الوقف والابتدا\n\n## المقدمة النظرية والأصول\n\n`;

  // Filter titles that belong to the introduction
  const introTitles = bookData.titles.filter(t => parseInt(t.page) < fatihaPage);

  for (let pid = 1; pid < fatihaPage; pid++) {
    const page = bookData.pages.find(p => p.id === pid);
    if (!page || !page.content) continue;

    // Convert Shamela HTML to Markdown using the SDK
    const md = convertContentToMarkdown(page.content);
    markdownContent += md + '\n\n';
  }

  fs.writeFileSync(OUTPUT_MD, markdownContent, 'utf8');
  console.log(`✅ Theoretical content extracted successfully to ${OUTPUT_MD} !`);
}

extractTheory().catch(console.error);
