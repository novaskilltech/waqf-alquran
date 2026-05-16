// fetch est natif dans Node 22


const CONFIG = {
    API_KEY: "a81267-6a3bfd-15ea5d-47baac-33c9c2",
    BASE_URL: "https://dev.shamela.ws/api/v1"
};

async function searchBooks(query) {
    console.log(`🔍 Recherche de : "${query}"...`);
    // Note: L'API Shamela nécessite souvent d'abord de lister ou d'utiliser le master
    // Mais essayons une recherche directe si possible ou via les catégories.
    
    // Selon le repo shamela-api, la recherche se fait sur le master.json téléchargé.
    // Pour aller vite, je vais tenter d'interroger directement les endpoints connus.
    
    try {
        const url = `${CONFIG.BASE_URL}/books?api_key=${CONFIG.API_KEY}&search=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        if (response.status === 200) {
            const data = await response.json();
            console.log("✅ Livres trouvés:", data);
        } else {
            console.log("❌ Erreur status:", response.status);
            const text = await response.text();
            console.log("📝 Réponse:", text);
        }
    } catch (e) {
        console.error("❌ Erreur:", e.message);
    }

}

searchBooks("منار الهدى");
