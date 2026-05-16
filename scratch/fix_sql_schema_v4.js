const fs = require('fs');

const inputFile = 'manar_waqf_71_114.sql';
const outputFile = 'manar_waqf_71_114_fixed.sql';

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');
const result = [];

for (let line of lines) {
  line = line.trim();
  if (line.startsWith('INSERT INTO')) {
    result.push('INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")');
  } else if (line.startsWith('VALUES')) {
    // line: VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 71 AND "numberInSurah" = 1), 0, 'كاف', '', 'كاف', 'Manar al-Huda (Ashmuni)');
    const selectStart = line.indexOf('(');
    const selectEnd = line.indexOf('),', selectStart) + 1; // finds the ) after the SELECT
    const selectAyah = line.substring(selectStart, selectEnd);

    const restPart = line.substring(selectEnd + 1, line.lastIndexOf(')'));
    // restPart:  0, 'كاف', '', 'كاف', 'Manar al-Huda (Ashmuni)'
    
    // Split with quote awareness
    const parts = [];
    let cur = '';
    let inQ = false;
    for (let char of restPart) {
      if (char === "'") inQ = !inQ;
      if (char === ',' && !inQ) {
        parts.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    parts.push(cur.trim());

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
    result.push(`VALUES (${selectAyah}, ${wordIdx}, 'BOOKS', 'APPROVED', '${jsonStr}');`);
  }
}

fs.writeFileSync(outputFile, result.join('\n'));
console.log('Done.');
