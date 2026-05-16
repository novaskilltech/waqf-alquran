const fs = require('fs');

const inputFile = 'manar_waqf_71_114.sql';
const outputFile = 'manar_waqf_71_114_fixed.sql';

// Note: We read the original malformed SQL (with 6 columns) or the one with triple parens?
// Actually, I will read 'manar_waqf_71_114.sql' which was the FIRST extraction (with 6 columns).
// If the user already replaced it with the 'fixed' one, I should check.
// The user said: "Active Document: .../manar_waqf_71_114_fixed.sql"
// I will work on the fixed one to correct the parentheses.

const content = fs.readFileSync(outputFile, 'utf8');
const lines = content.split('\n');
const result = [];

console.log("🛠️ Fixing parentheses in SQL...");

for (let line of lines) {
  line = line.trim();
  if (line.startsWith('INSERT INTO')) {
    result.push(line);
  } else if (line.startsWith('VALUES')) {
    // Current malformed: VALUES (((SELECT id FROM "Ayah" WHERE "surahNumber" = 71 AND "numberInSurah" = 1), 0, 'BOOKS', 'APPROVED', '{...}');
    // We want: VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 71 AND "numberInSurah" = 1), 0, 'BOOKS', 'APPROVED', '{...}');
    
    // Replace "VALUES (((" with "VALUES (("
    let fixedLine = line.replace('VALUES (((', 'VALUES ((');
    
    // Check if we need to adjust the end too?
    // malformed: ... taalil":""}');
    // It has one closing paren. But we have 2 open parens now ( ( (SELECT...) ). 
    // Wait, let's re-analyze line 2:
    // VALUES ( ( (SELECT ... ) , 0, ... ) ;
    // Parentheses count: 
    // 1: ( starts VALUES
    // 2: ( starts subquery? No, SELECT is usually (SELECT ...).
    // So ( (SELECT ...) ) is 2.
    // If it's (((SELECT ...), then it's 3.
    // And it ends with ) ;
    // So 3 open, 1 close. Error.
    
    // Let's just reconstruct it properly from the components if possible, 
    // or do a regex replace.
    
    // Actually, the easiest way is to fix the script that generates it.
    // But I'll fix the current file.
    
    // Regex to capture: VALUES \(\(\(SELECT .*?\), (.*)\);
    // And replace with: VALUES ((SELECT ...), $1);
    
    fixedLine = line.replace(/VALUES \(\(\((SELECT .*?\)), (.*)\);/, 'VALUES ($1, $2);');
    result.push(fixedLine);
  } else {
    result.push(line);
  }
}

fs.writeFileSync(outputFile, result.join('\n'));
console.log('✅ Parentheses fixed.');
