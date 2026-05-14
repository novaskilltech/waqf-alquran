import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const normalizeArabic = (text: string) => {
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

export async function GET() {
  console.log("Début de l'importation complète (114 sourates)...");
  let count = 0;

  for (let s = 1; s <= 114; s++) {
    try {
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
          count++;
        }
      }
    } catch (error: any) {
      console.error(`Erreur sourate ${s}:`, error.message);
    }
  }

  return NextResponse.json({ message: 'Importation terminée', totalAyahs: count });
}
