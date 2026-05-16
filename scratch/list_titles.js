const fs = require('fs');
const data = JSON.parse(fs.readFileSync('shamela_data/6496.json', 'utf8'));
data.titles.slice(-100).forEach(t => console.log(t.id, t.content));
