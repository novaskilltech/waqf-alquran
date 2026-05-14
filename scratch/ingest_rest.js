const SUPABASE_URL = "https://tqbcmcddnohnqmcxvgut.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYmNtY2Rkbm9obnFtY3h2Z3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAyOTMsImV4cCI6MjA5MzE0NjI5M30.fLQ1NIk1sTV_vj87MOMWXVvEIuDfNVgynIjK9DSYzW0";

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

async function ingest() {
  console.log("🚀 Démarrage de l'ingestion via REST API...");
  
  // On commence par 50 à 114
  for (let s = 50; s <= 114; s++) {
    try {
      console.log(`📡 Récupération Sourate ${s}...`);
      const quranRes = await fetch(`https://api.alquran.cloud/v1/surah/${s}/quran-uthmani`);
      const quranData = await quranRes.json();
      
      if (quranData.code === 200) {
        const ayahs = quranData.data.ayahs;
        const payload = ayahs.map(a => ({
          id: `s${s}a${a.numberInSurah}`,
          number: a.numberInSurah,
          surahNumber: s,
          textOthmani: a.text,
          textSimple: normalizeArabic(a.text)
        }));

        // Envoi par lots de 50 à Supabase
        const response = await fetch(`${SUPABASE_URL}/rest/v1/Ayah`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log(`✅ Sourate ${s} (${quranData.data.name}) : ${ayahs.length} versets injectés.`);
        } else {
          const err = await response.text();
          console.error(`❌ Erreur Supabase pour sourate ${s}:`, err);
        }
      }
    } catch (e) {
      console.error(`💥 Erreur fatale pour sourate ${s}:`, e.message);
    }
  }
  console.log("🏁 Ingestion terminée.");
}

ingest();
