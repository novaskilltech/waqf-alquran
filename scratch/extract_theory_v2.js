const fs = require('fs');
const path = require('path');
const { convertContentToMarkdown } = require('shamela/content');

const BOOK_PATH = path.join(process.cwd(), 'shamela_data', '38091.json');
const OUTPUT_MD = path.join(process.cwd(), 'manar_theory.md');

async function extractTheory() {
  const bookData = JSON.parse(fs.readFileSync(BOOK_PATH, 'utf8'));
  
  console.log(`Extracting theoretical introduction (IDs 1 to 65)...`);

  let markdownContent = `# منار الهدى في بيان الوقف والابتدا\n\n## المقدمة النظرية والأصول\n\n`;

  const lastIntroId = 65; 
  let currentPrintedPage = '';
  
  for (let pid = 1; pid <= lastIntroId; pid++) {
    const page = bookData.pages.find(p => p.id === pid);
    if (!page || !page.content) continue;

    // Check if there are titles for this page
    if (page.page !== currentPrintedPage) {
      currentPrintedPage = page.page;
      const titles = bookData.titles.filter(t => t.page === currentPrintedPage);
      for (const t of titles) {
        markdownContent += `\n### ${t.content.trim()}\n\n`;
      }
    }

    // Convert Shamela HTML to Markdown using the SDK
    let md = convertContentToMarkdown(page.content);
    // Remove consecutive newlines
    md = md.replace(/\n{3,}/g, '\n\n');
    markdownContent += md + '\n\n';
  }

  fs.writeFileSync(OUTPUT_MD, markdownContent, 'utf8');
  console.log(`✅ Theoretical content extracted successfully to ${OUTPUT_MD} !`);
}

extractTheory().catch(console.error);
