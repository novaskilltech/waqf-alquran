const fs = require('fs');
const path = require('path');

const bookData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'shamela_data', '6496.json'), 'utf8'));

console.log("--- Structure d'une page ---");
console.log(bookData.pages[0]);
console.log("--- Titre Ikhlas ---");
const ikhlas = bookData.titles.find(t => t.content.includes("الإخلاص"));
console.log(ikhlas);

if (ikhlas) {
    // Dans Shamela, 'id' de la page correspond souvent à l'index ou au champ 'page'
    const pageOfIkhlas = bookData.pages.find(p => p.id === parseInt(ikhlas.page));

    console.log("--- Contenu Page Ikhlas ---");
    console.log(pageOfIkhlas ? pageOfIkhlas.content : "Non trouvée");
}
