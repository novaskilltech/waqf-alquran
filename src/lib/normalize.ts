/**
 * Normalisation du texte arabe pour la recherche scientifique
 * Supprime les harakats, normalise les Alifs, Hamzas et Yaa/Alef Maqsura.
 */
export const normalizeArabic = (text: string): string => {
  if (!text) return "";

  // 1. Supprimer les Harakats (Tashkeel)
  // Range: \u064B to \u065F + \u0670 (Alef Khanjariya)
  const tashkeelRegex = /[\u064B-\u065F\u0670]/g;
  let normalized = text.replace(tashkeelRegex, "");

  // 2. Supprimer le Tatweel (Kashida)
  normalized = normalized.replace(/\u0640/g, "");

  // 3. Normaliser les Alifs
  normalized = normalized.replace(/[\u0622\u0623\u0625]/g, "\u0627");

  // 4. Normaliser Hamza sur Waw et Ya
  normalized = normalized.replace(/\u0624/g, "\u0648");
  normalized = normalized.replace(/\u0626/g, "\u064A");

  // 5. Normaliser Teh Marbuta vers Heh
  normalized = normalized.replace(/\u0629/g, "\u0647");

  // 6. Normaliser Alef Maqsura vers Ya
  normalized = normalized.replace(/\u0649/g, "\u064A");

  return normalized.trim();
};

/**
 * Compare deux chaînes de caractères arabes après normalisation
 */
export const compareArabic = (a: string, b: string): boolean => {
  return normalizeArabic(a) === normalizeArabic(b);
};
