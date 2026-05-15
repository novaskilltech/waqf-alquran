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
  "الْحَمْدُ": { root: "حمد", lemma: "حَمْد", grammar: "اسم" },
  "الرَّحْمٰنِ": { root: "رحم", lemma: "رَحْمٰن", grammar: "اسم" },
  "الرَّحِيمِ": { root: "رحm", lemma: "رَحِيم", grammar: "اسم" },
  "نَعْبُدُ": { root: "عبد", lemma: "عَبَدَ", grammar: "فعل مضارع" },
  "نَسْتَعِينُ": { root: "عون", lemma: "اِسْتَعَانَ", grammar: "فعل مضارع" },
  "اهْدِنَا": { root: "هدي", lemma: "هَدَى", grammar: "فعل أمر" },
  "الصِّرَاطَ": { root: "سرط", lemma: "صِرَاط", grammar: "اسم" },
  "الَّذِينَ": { root: "لذي", lemma: "الَّذِي", grammar: "اسم موصول" },
  "أَنْعَمْتَ": { root: "نعم", lemma: "أَنْعَمَ", grammar: "فعل ماض" },
  "الْمَغْضُوبِ": { root: "غضب", lemma: "مَغْضُوب", grammar: "اسم مفعول" },
  "الضَّالِّينَ": { root: "ضلل", lemma: "ضَالّ", grammar: "اسم فاعل" },
  "يُكَلِّفُ": { root: "كلف", lemma: "كَلَّفَ", grammar: "فعل مضارع" },
  "نَفْسًا": { root: "نفس", lemma: "نَفْس", grammar: "اسم" },
  "وُسْعَهَا": { root: "وسع", lemma: "وُسْع", grammar: "اسم" },
  "لَهَا": { root: "له", lemma: "لَـ", grammar: "حرف جر" },
  "كَسَبَتْ": { root: "كسب", lemma: "كَسَبَ", grammar: "فعل ماض" },
  "وَعَلَيْهَا": { root: "علي", lemma: "عَلَى", grammar: "حرف جر" },
  "اكْتَسَبَتْ": { root: "كسب", lemma: "اِكْتَسَبَ", grammar: "فعل ماض" },
};

/**
 * Récupère la morphologie d'un mot coranique
 * Nettoie les caractères spéciaux avant la recherche
 */
export function getWordMorphology(word: string): WordMorphology | null {
  // Nettoyage basique (suppression des voyelles pour la recherche si nécessaire)
  // Pour l'instant on cherche le mot exact avec tashkeel
  const cleanedWord = word.trim();
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
