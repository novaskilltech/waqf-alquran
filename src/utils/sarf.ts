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
  "عَمِلُوا": { root: "عمل", lemma: "عَمِلَ", grammar: "فعل ماض" },
  "آمَنُوا": { root: "أمن", lemma: "آمَنَ", grammar: "فعل ماض" },
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
 * Nettoie absolument tout sauf les lettres de base pour la recherche
 */
export function getWordMorphology(word: string): WordMorphology | null {
  if (!word) return null;
  
  // Fonction de normalisation radicale : ne garde que les lettres arabes de base
  // Supprime voyelles (tashkeel), signes de waqf, et caractères spéciaux de décoration
  const ultraNormalize = (txt: string) => {
    return txt
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A]/g, '') // Voyelles et signes
      .replace(/[ۣۖۗۚۛۜ۟۠ۡۢۥۦۧۨ]/g, '') // Signes de Waqf
      .replace(/\s+/g, '') // Espaces
      .trim();
  };

  const searchTarget = ultraNormalize(word);

  // 1. Essayer de trouver une correspondance dans le dictionnaire normalisé
  for (const [key, value] of Object.entries(rootsMap)) {
    if (ultraNormalize(key) === searchTarget) return value;
  }

  // 2. Gestion des préfixes (و، ف، ب، ل) sur le mot normalisé
  const prefixes = ['و', 'ف', 'ب', 'ل'];
  for (const pref of prefixes) {
    if (searchTarget.startsWith(pref) && searchTarget.length > 3) {
      const stripped = searchTarget.substring(1);
      for (const [key, value] of Object.entries(rootsMap)) {
        if (ultraNormalize(key) === stripped) return value;
      }
    }
  }

  // 3. Fallback spécial pour les racines communes si toujours rien
  if (searchTarget.includes('عمل')) return rootsMap["عَمِلُوا"];
  if (searchTarget.includes('امن')) return rootsMap["آمَنُوا"];

  return null;
}

/**
 * Retourne la couleur associée à une catégorie grammaticale
 */
export function getGrammarColor(grammar: string): string {
  const g = grammar.toLowerCase();
  if (g.includes("فعل")) return "#ef4444"; // Rouge moderne
  if (g.includes("اسم")) return "#3b82f6"; // Bleu moderne
  if (g.includes("حرف")) return "#10b981"; // Vert moderne
  return "#64748b"; // Slate pour le reste
}
