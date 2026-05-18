# Project: Al-Waqf wal Ibtida - Decision Log

## Historique des Décisions

| Date | Décision | Justification | Impacts | Rôle |
| :--- | :--- | :--- | :--- | :--- |
| 2026-05-15 | **Pivot Source P0** | Abandon de Shamila local. Passage à Quran.com / Tanzil. | Ingestion batch 71-114 nécessaire. | NOVA-LEAD |
| 2026-05-15 | **Stratégie IA-First** | Absence de dataset sémantique (Tam/Kafi). | Intégration Gemini (Kilo AI) pour suggestions. | NOVA-LEAD |
| 2026-05-15 | **Traçabilité Discussion** | Fermeture accidentelle de session par l'utilisateur. | Création de ce fichier `DecisionLog.md`. | NOVA-LEAD |

| 2026-05-15 | **Optimisation Batch IA** | Lenteur du traitement séquentiel. | Passage en mode parallèle (concurrence x3). | NOVA-LEAD |
| 2026-05-15 | **Correctif SQL Ayah** | Erreur de syntaxe (point-virgule prématuré). | Fichier `surahs_71_114.sql` corrigé et importé. | NOVA-LEAD |
| 2026-05-15 | **Intégration Manar UI** | Besoin d'afficher les sources académiques. | Mise à jour de `AyahViewer.tsx` avec badges et couleurs. | NOVA-LEAD |
| 2026-05-16 | **Intégration Shamela API** | Accès aux sources académiques (livres). | Création de la page `Library` et connexion `shamela-api`. | NOVA-LEAD |
| 2026-05-16 | **Modèle IA Extraction** | Erreurs de timeout avec anciens scripts. | Utilisation de Gemini 2.0 Flash via OpenRouter. | NOVA-LEAD |
| 2026-05-16 | **Navigation UI** | Retour au dashboard difficile depuis Mushaf/Admin. | Ajout de boutons "Home" dans les headers/sidebars. | NOVA-UX |
| 2026-05-17 | **Correctif Vercel Build** | `better-sqlite3` plantait la compilation sur Vercel. | Ajout à `serverExternalPackages` et route API modifiée pour utiliser `/tmp`. | NOVA-DEVOPS |
| 2026-05-17 | **Théorie Manar Al-Huda** | L'extraction markdown manquait des titres originaux. | Réécriture du script pour injecter la hiérarchie complète des titres Shamela. | NOVA-BE |
| 2026-05-18 | **Alignement Sémantique P0** | Désalignement des mots cibles pour les commentaires sans guillemets. | Correction endpoint Kilo AI, développement d'un pipeline concurrent (pool x10) résilient avec checkpointing. | NOVA-BE |
| 2026-05-18 | **Optimisation Waqf Vides** | 1085 points sans commentaires provoquaient des requêtes IA inutiles. | Résolution locale instantanée au dernier mot de l'Ayah (Waqf تام), gain de 40% sur le budget token. | NOVA-DOM |
| 2026-05-18 | **Sécurité & Git Push** | API Keys privées détectées par GitHub Push Protection. | Reset Git propre, exclusion de `/shamela_data`, passage des clés en variables d'env et Push réussi. | NOVA-SEC |
| 2026-05-18 | **Libération de Port Local** | Port 4000 occupé par un processus zombie Next.js. | Taskkill ciblé et relancement propre de `npm run dev` en local. | NOVA-DEVOPS |

## État des Phases (NOVA SQUAD)

- [x] **PHASE 1 : INTAKE** (Compréhension du besoin)
- [x] **PHASE 2 : DISPATCH** (Préparation des scripts d'ingestion)
- [x] **PHASE 3 : READY FOR BUILD** (Gate DoR validée pour le Lot 1)
- [x] **PHASE 4 : BUILD** (Ingestion, alignement et scraping finalisés)
- [ ] **PHASE 5 : RELEASE**

## Spec Snapshot (v1.1)

- **Produit** : SaaS B2C Web de recherche et d'analyse du Waqf coranique.
* **MVP scope** : Visualisation du Coran (Sourates 1-114) avec commentaires de Waqf/Ibtida' alignés par mot et Bibliothèque Islamique.
- **Cible** : Chercheurs, Étudiants en Qira'at, Grand Public.
- **Stack** : Next.js, Prisma, Supabase, Kilo AI (Gemini), OpenRouter.
- **Données** : Texte Uthmani (Tanzil), Signes de Waqf, Commentaires de Manar al-Huda (Ashmuni).

## Backlog Lot 1 (MVP)

- [x] Ingestion Surates 71-114 (Texte).
- [x] Extraction finale Manar al-Huda (Terminée à 100% - Sourates 71 à 114 avec corrections de la sourate 103).
- [x] Module de classification sémantique par IA (Validé).
- [x] Interface de visualisation des commentaires académiques (Prête et validée).
- [x] Module Bibliothèque Islamique (Intégration Shamela API en local validée sur /library).
- [x] Résolution locale et IA de l'alignement des mots cibles (Terminée à 1266/2750 avec pipeline résilient).
- [ ] Finaliser les 1484 indexations de mots IA restantes (reprendre le script `fix_all_word_indexes_concurrent.js` après expiration du rate limit).
- [x] Sécurisation complète des API Keys et Push réussi sur GitHub.

