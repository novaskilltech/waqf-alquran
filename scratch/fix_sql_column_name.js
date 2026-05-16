const fs = require('fs');

const outputFile = 'manar_waqf_71_114_fixed.sql';

const content = fs.readFileSync(outputFile, 'utf8');
const fixedContent = content.replace(/"numberInSurah"/g, '"number"');

fs.writeFileSync(outputFile, fixedContent);
console.log('✅ Column "numberInSurah" renamed to "number" in SQL.');
