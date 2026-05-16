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
- [x] Extraction finale Manar al-Huda (Terminée à 95% - Sourates 71 à 114).
    *Note : Quelques sourates (94, 104, 108) ignorées suite timeouts IA.*
- [x] Module de classification sémantique par IA (Validé).
- [x] Interface de visualisation des commentaires académiques (Prête).

