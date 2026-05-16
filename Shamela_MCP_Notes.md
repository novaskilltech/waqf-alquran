# Note sur `alhoqbani/shamela-mcp`

**Repo :** [https://github.com/alhoqbani/shamela-mcp](https://github.com/alhoqbani/shamela-mcp)

Il s'agit d'un **serveur MCP (Model Context Protocol)** pour la base de données locale **المكتبة الشاملة 4**. 

## Utilité pour le projet "Al-Waqf wal Ibtida"
C'est un outil très puissant pour l'extraction IA avancée et le croisement de données :
- Permet une recherche sémantique locale dans toute la bibliothèque Shamela via Claude Desktop (ou tout client compatible MCP).
- Inclut des outils natifs pour chercher dans le **Coran** (`shamela_search_quran`, `shamela_get_aya`).
- Permet de lier directement des Tafsirs (`shamela_get_tafseer_of_aya`) pour enrichir les justifications de Waqf.
- Génère automatiquement des citations académiques (`shamela_get_citation`).

## Différence avec `dalailcentere/shamela-api`
- **`dalailcentere/shamela-api`** (que nous utilisons actuellement) : API REST classique, parfaite pour alimenter notre interface frontend web.
- **`alhoqbani/shamela-mcp`** : Protocole MCP, conçu pour être utilisé par une IA (comme agent de recherche locale), sans besoin d'appels réseau externes, mais nécessite l'installation complète du logiciel Shamela 4 sur la machine Windows.

## Conclusion et Plan d'action
Pour l'instant, notre approche avec l'extraction via OpenRouter et notre script JS suffit pour générer notre base de données initiale des règles de Waqf.
**Le serveur MCP reste une piste d'amélioration future** (Phase 2 ou 3) :
- Pour ajouter une fonctionnalité "Assistant de recherche IA" directement couplée à la Shamela locale du chercheur.
- À intégrer si/quand nous mettrons en place un processus de validation croisée avec d'autres livres de Tafsir et de Qira'at (à condition d'avoir l'espace disque de 160 Go pour héberger la Shamela 4 sur un serveur ou une machine locale).
