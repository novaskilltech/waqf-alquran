const fs = require('fs');
const path = require('path');

async function fetchSurah(surahNumber) {
  const url = `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNumber}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.verses;
}

async function fetchSimpleText(surahNumber) {
  const url = `https://api.quran.com/api/v4/quran/verses/indopak?chapter_number=${surahNumber}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.verses;
}

async function generateSQL() {
  console.log("🚀 Début de la génération SQL (Surates 71-114)...");
  let sql = 'INSERT INTO public."Ayah" (id, number, "surahNumber", "textOthmani", "textSimple") VALUES\n';
  const entries = [];

  for (let s = 71; s <= 114; s++) {
    console.log(`📖 Surate ${s}...`);
    const uthmani = await fetchSurah(s);
    const simple = await fetchSimpleText(s);

    for (let i = 0; i < uthmani.length; i++) {
      const v = uthmani[i];
      const s_v = simple[i];
      const id = `s${s}a${v.verse_key.split(':')[1]}`;
      const num = v.verse_key.split(':')[1];
      const textOthmani = v.text_uthmani.replace(/'/g, "''");
      const textSimple = (s_v.text_indopak || v.text_uthmani).replace(/'/g, "''");
      
      entries.push(`('${id}', ${num}, ${s}, '${textOthmani}', '${textSimple}')`);
    }
  }

  sql += entries.join(',\n') + ';\n';
  sql += 'ON CONFLICT (id) DO UPDATE SET "textOthmani" = EXCLUDED."textOthmani", "textSimple" = EXCLUDED."textSimple";\n';

  fs.writeFileSync(path.join(process.cwd(), 'surahs_71_114.sql'), sql);
  console.log("✅ Fichier surahs_71_114.sql généré avec succès.");
}

generateSQL().catch(console.error);
