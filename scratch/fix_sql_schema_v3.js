const fs = require('fs');

const inputFile = 'manar_waqf_71_114.sql';
const outputFile = 'manar_waqf_71_114_fixed.sql';

console.log(`🛠️ Starting accurate SQL transformation for ${inputFile}...`);

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');

const newLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trim();
  if (!line.startsWith('VALUES')) continue;

  try {
    // line is: VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 71 AND "numberInSurah" = 1), 0, 'كاف', '', 'كاف', 'Manar al-Huda (Ashmuni)');
    // 1. Extract the select part
    const selectStart = line.indexOf('((SELECT');
    const selectEnd = line.indexOf('))') + 2;
    const selectAyah = line.substring(selectStart + 1, selectEnd - 1);

    // 2. Extract the rest
    const afterSelect = line.substring(selectEnd).trim(); // should start with ", 0, 'كاف'..."
    const rest = afterSelect.substring(1, afterSelect.length - 2); // remove leading comma and trailing );
    
    // Split the rest by comma, but account for quotes
    // Since our values are always wordIndex (int), ruling (quoted), explanation (quoted), type (quoted), source (quoted)
    // and wordIndex is the first one.
    const parts = [];
    let currentPart = '';
    let inQuotes = false;
    for (let char of rest) {
      if (char === "'" && (currentPart.length === 0 || rest[rest.indexOf(char)-1] !== '\\')) {
        inQuotes = !inQuotes;
      }
      if (char === ',' && !inQuotes) {
        parts.push(currentPart.trim());
        currentPart = '';
      } else {
        currentPart += char;
      }
    }
    parts.push(currentPart.trim());

    const wordIdx = parts[0];
    const ruling = parts[1].replace(/^'|'$/g, '');
    const explanation = parts[2].replace(/^'|'$/g, '');
    const type = parts[3].replace(/^'|'$/g, '');
    const source = parts[4].replace(/^'|'$/g, '');

    const dataObj = {
      ruling: ruling,
      explanation: explanation,
      source: source,
      hukumIbtida: 'جائز',
      taalil: ''
    };

    const jsonStr = JSON.stringify(dataObj).replace(/'/g, "''");

    newLines.push(`INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")`);
    newLines.push(`VALUES (${selectAyah}, ${wordIdx}, 'BOOKS', 'APPROVED', '${jsonStr}');`);
    
  } catch (e) {
    console.warn(`⚠️ Failed to parse line ${i + 1}: ${line.substring(0, 50)}... Error: ${e.message}`);
  }
}

fs.writeFileSync(outputFile, newLines.join('\n'));
console.log(`✅ Transformation complete! Created ${outputFile} with ${newLines.length / 2} points.`);
