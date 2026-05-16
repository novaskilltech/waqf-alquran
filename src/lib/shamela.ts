/**
 * 🕌 Client API pour la المكتبة الشاملة (dev.shamela.ws)
 */

export const SHAMELA_CONFIG = {
  API_KEY: "a81267-6a3bfd-15ea5d-47baac-33c9c2",
  BASE_URL: "https://dev.shamela.ws/api/v1",
};

export interface ShamelaBook {
  id: number;
  name: string;
  author?: string;
  category?: string;
}

export interface ShamelaPage {
  id: number;
  part: string;
  page: number;
  content: string;
}

export class ShamelaService {
  /**
   * Récupère les métadonnées d'un livre
   */
  static async getBookMetadata(bookId: number) {
    const url = `${SHAMELA_CONFIG.BASE_URL}/books/${bookId}?api_key=${SHAMELA_CONFIG.API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur Shamela API: ${response.status}`);
    return response.json();
  }

  /**
   * Récupère le contenu d'un livre (nécessite le téléchargement du patch via le serveur)
   * Note: Sur le client, on passera par notre API proxy.
   */
  static async getBookContent(bookId: number, page?: number) {
    const query = page ? `?page=${page}` : '';
    const response = await fetch(`/api/shamela/book/${bookId}${query}`);
    if (!response.ok) throw new Error("Impossible de récupérer le contenu du livre");
    return response.json();
  }
}
