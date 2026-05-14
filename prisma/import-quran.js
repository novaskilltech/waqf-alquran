const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fonction de normalisation simplifiée pour le script d'import
const normalizeArabic = (text) => {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "") // Tashkeel
    .replace(/\u0640/g, "")                // Tatweel
    .replace(/[\u0622\u0623\u0625]/g, "\u0627") // Alifs
    .replace(/\u0624/g, "\u0648")
    .replace(/\u0626/g, "\u064A")
    .replace(/\u0629/g, "\u0647")
    .replace(/\u0649/g, "\u064A")
    .trim();
};

async function importSurahs() {
  console.log("Démarrage de l'importation (Sourates 50 à 114)...");

  for (let s = 50; s <= 114; s++) {
    try {
      console.log(`Récupération de la sourate ${s}...`);
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${s}/quran-uthmani`);
      const data = await response.json();

      if (data.code === 200) {
        const ayahs = data.data.ayahs;
        
        for (const ayah of ayahs) {
          await prisma.ayah.upsert({
            where: { id: `s${s}a${ayah.numberInSurah}` },
            update: {},
            create: {
              id: `s${s}a${ayah.numberInSurah}`,
              number: ayah.numberInSurah,
              surahNumber: s,
              textOthmani: ayah.text,
              textSimple: normalizeArabic(ayah.text)
            }
          });
        }
        console.log(`✅ Sourate ${s} (${data.data.name}) importée.`);
      }
    } catch (error) {
      console.error(`❌ Erreur sur la sourate ${s}:`, error.message);
    }
  }

  console.log("🏁 Importation terminée avec succès !");
}

importSurahs()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
