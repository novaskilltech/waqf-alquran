const fs = require('fs');

const outputFile = 'manar_waqf_71_114_fixed.sql';

const content = fs.readFileSync(outputFile, 'utf8');
const lines = content.split('\n');
const result = [];

console.log("🛠️ Correcting SQL syntax (parentheses and VALUES list)...");

for (let line of lines) {
  line = line.trim();
  if (line.startsWith('VALUES')) {
    // We want to transform whatever mess we have into:
    // VALUES ((SELECT ... WHERE ...), 0, 'BOOKS', 'APPROVED', '{...}');
    
    // 1. Extract the SELECT part
    const selectMatch = line.match(/SELECT id FROM "Ayah" WHERE "surahNumber" = \d+ AND "numberInSurah" = \d+/);
    if (!selectMatch) {
      result.push(line);
      continue;
    }
    const selectStr = selectMatch[0];
    
    // 2. Extract the data part (the JSON and indices)
    // It's usually after the first "), " or similar
    const dataPartMatch = line.match(/,\s*(\d+,\s*'BOOKS',\s*'APPROVED',\s*'.*')\);?$/);
    if (!dataPartMatch) {
      // Try alternative match if the above fails
      const parts = line.split("', '"); // risky
      result.push(line);
      continue;
    }
    const dataStr = dataPartMatch[1];
    
    result.push(`VALUES ((${selectStr}), ${dataStr});`);
  } else {
    result.push(line);
  }
}

fs.writeFileSync(outputFile, result.join('\n'));
console.log('✅ SQL syntax corrected.');
