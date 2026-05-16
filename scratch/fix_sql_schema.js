const fs = require('fs');

const inputFile = 'manar_waqf_71_114.sql';
const outputFile = 'manar_waqf_71_114_fixed.sql';

console.log(`🛠️ Starting robust SQL transformation for ${inputFile}...`);

const content = fs.readFileSync(inputFile, 'utf8');
const blocks = content.split('INSERT INTO "WaqfPoint"').filter(b => b.trim());

const newLines = [];

for (const block of blocks) {
  // block looks like: ("ayahId", "wordIndex", "ruling", "explanation", "type", "source") \n VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 71 AND "numberInSurah" = 1), 0, 'كاف', '', 'كاف', 'Manar al-Huda (Ashmuni)');
  const valuesPart = block.split('VALUES')[1];
  if (!valuesPart) continue;

  try {
    // Extract what's inside the outer parentheses of VALUES
    const inner = valuesPart.trim().substring(1, valuesPart.trim().length - 2);
    
    // Split by comma, but be careful with commas inside parentheses or quotes
    // For Ayah selection: (SELECT id FROM "Ayah" WHERE "surahNumber" = 71 AND "numberInSurah" = 1)
    const selectEndIdx = inner.indexOf('))') + 2;
    const selectAyah = inner.substring(0, selectEndIdx);
    const rest = inner.substring(selectEndIdx + 1).split(',');

    const wordIdx = rest[0].trim();
    const ruling = rest[1].trim().replace(/^'|'$/g, '');
    const explanation = rest[2].trim().replace(/^'|'$/g, '');
    const type = rest[3].trim().replace(/^'|'$/g, '');
    const source = rest[4].trim().replace(/^'|'$/g, '');

    const dataObj = {
      ruling: ruling,
      explanation: explanation,
      source: source,
      hukumIbtida: 'جائز',
      taalil: ''
    };

    const jsonStr = JSON.stringify(dataObj).replace(/'/g, "''");

    const newLine = `INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data") 
VALUES (${selectAyah}, ${wordIdx}, 'BOOKS', 'APPROVED', '${jsonStr}');`;
    
    newLines.push(newLine);
  } catch (e) {
    console.warn(`⚠️ Failed to parse block: ${block.substring(0, 100)}... Error: ${e.message}`);
  }
}

fs.writeFileSync(outputFile, newLines.join('\n'));
console.log(`✅ Transformation complete! Created ${outputFile} with ${newLines.length} lines.`);
