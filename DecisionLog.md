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

## État des Phases (NOVA SQUAD)

- [x] **PHASE 1 : INTAKE** (Compréhension du besoin)
- [x] **PHASE 2 : DISPATCH** (Préparation des scripts d'ingestion)
- [x] **PHASE 3 : READY FOR BUILD** (Gate DoR validée pour le Lot 1)
- [ ] **PHASE 4 : BUILD** - *EN COURS* (Ingestion des données en live)
- [ ] **PHASE 5 : RELEASE**

## Spec Snapshot (v1.0)

- **Produit** : SaaS B2C Web de recherche et d'analyse du Waqf coranique.
- **Cible** : Chercheurs, Étudiants en Qira'at, Grand Public.
- **Stack** : Next.js, Prisma, Supabase, Kilo AI (Gemini).
- **Données** : Texte Uthmani (Tanzil), Signes de Waqf, Commentaires de Manar al-Huda (Ashmuni).

## Backlog Lot 1 (MVP)

- [x] Ingestion Surates 71-114 (Texte).
- [x] Extraction finale Manar al-Huda (Terminée à 100% - Sourates 71 à 114 avec corrections de la sourate 103).
- [x] Module de classification sémantique par IA (Validé).
- [x] Interface de visualisation des commentaires académiques (Prête).
- [x] Module Bibliothèque Islamique (Intégration Shamela API en local).
- [ ] Script d'extraction IA pour les sourates 1 à 70 (À exécuter localement).
- [ ] Téléchargement des autres livres Shamela via serveur `shamela-api` local.
