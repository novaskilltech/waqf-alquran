/**
 * Utilitaire de Morphologie Coranique (Sarf)
 * Inspiré des données de la Maktaba Shamela et du Quranic Arabic Corpus
 */

export interface WordMorphology {
  root: string;
  lemma: string;
  grammar: string;
}

// Dictionnaire de démonstration (à enrichir via API ou import JSON)
const rootsMap: Record<string, WordMorphology> = {
  "يَعْمَلُونَ": { root: "عمل", lemma: "عَمِلَ", grammar: "فعل مضارع" },
  "تَعْمَلُونَ": { root: "عمل", lemma: "عَمِلَ", grammar: "فعل مضارع" },
  "فِي": { root: "في", lemma: "فِي", grammar: "حرف جر" },
  "قُلُوبِهِم": { root: "قلب", lemma: "قَلْب", grammar: "اسم" },
  "مَرَضٌ": { root: "مرض", lemma: "مَرَض", grammar: "اسم" },
  "فَزَادَهُمُ": { root: "زيد", lemma: "زَادَ", grammar: "فعل ماض" },
  "اللَّهُ": { root: "أله", lemma: "الله", grammar: "اسم" },
  "مَرَضًا": { root: "مرض", lemma: "مَرَض", grammar: "اسم" },
  "وَلَهُمْ": { root: "له", lemma: "لَـ", grammar: "حرف جر" },
  "عَذَابٌ": { root: "عذب", lemma: "عَذَاب", grammar: "اسم" },
  "أَلِيمٌ": { root: "ألم", lemma: "أَلِيم", grammar: "اسم" },
  "بِمَا": { root: "بـ", lemma: "بِـ", grammar: "حرف جر" },
  "كَانُوا": { root: "كون", lemma: "كَانَ", grammar: "فعل ماض" },
  "يَكْذِبُونَ": { root: "كذب", lemma: "كَذَبَ", grammar: "فعل مضارع" },
  "الْحَمْدُ": { root: "حمد", lemma: "حَمْد", grammar: "اسم" },
  "الرَّحْمٰنِ": { root: "رحم", lemma: "رَحْمٰن", grammar: "اسم" },
  "الرَّحِيمِ": { root: "رحm", lemma: "رَحِيم", grammar: "اسم" },
  "نَعْبُدُ": { root: "عبد", lemma: "عَبَدَ", grammar: "فعل مضارع" },
  "نَسْتَعِينُ": { root: "عون", lemma: "اِسْتَعَانَ", grammar: "فعل مضارع" },
  "يُوقِنُونَ": { root: "يقن", lemma: "أَيْقَنَ", grammar: "فعل مضارع" },
  "اهْدِنَا": { root: "هدي", lemma: "هَدَى", grammar: "فعل أمر" },
  "الصِّرَاطَ": { root: "سرط", lemma: "صِرَاط", grammar: "اسم" },
  "الَّذِينَ": { root: "لذي", lemma: "الَّذِي", grammar: "اسم موصول" },
  "أَنْعَمْتَ": { root: "نعم", lemma: "أَنْعَمَ", grammar: "فعل ماض" },
  "الْمَغْضُوبِ": { root: "غضب", lemma: "مَغْضُوب", grammar: "اسم mفعول" },
  "الضَّالِّينَ": { root: "ضلل", lemma: "ضَالّ", grammar: "اسم فاعل" },
};

/**
 * Récupère la morphologie d'un mot coranique
 * Nettoie les caractères spéciaux et les signes de Waqf avant la recherche
 */
export function getWordMorphology(word: string): WordMorphology | null {
  if (!word) return null;
  
  // Supprimer les signes de Waqf et ponctuation coranique (U+0610 à U+061A, U+06D6 à U+06ED)
  const cleanedWord = word.trim()
    .replace(/[\u0610-\u061A\u06D6-\u06ED]/g, '')
    .replace(/[ۣۖۗۚۛۜ۟۠ۡۢۥۦۧۨ]/g, '');

  return rootsMap[cleanedWord] || null;
}

/**
 * Retourne la couleur associée à une catégorie grammaticale
 */
export function getGrammarColor(grammar: string): string {
  if (grammar.includes("فعل")) return "#e53e3e"; // Rouge pour les verbes
  if (grammar.includes("اسم")) return "#3182ce"; // Bleu pour les noms
  return "#718096"; // Gris pour le reste
}
