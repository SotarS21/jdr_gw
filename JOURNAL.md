# Journal de développement — Galactic Wars

## Session du 2026-09-09 — Scaffold initial + fiche classique (v0.0.0 → v0.1.0)

Premier scaffold complet du système, après revue de tout le matériel source (`asset_fiche_perso/`) et audit du code réel de deux systèmes Foundry déjà construits par l'auteur (`projet_antique_system`, `projet_sea_of_thieve`) pour en reprendre les conventions (ApplicationV2, `TypeDataModel`, pas de `template.json`, i18n par clés).

**Décisions prises :**
- Compendiums auteurisés en JSON lisible (`packs/_source/`) puis compilés en vraie LevelDB via `@foundryvtt/foundryvtt-cli` (`npm run pack:build`) — les deux systèmes de référence stockaient leurs packs en NeDB à plat, format que Foundry v11+ ne charge plus nativement ; on corrige ça dès le départ plutôt que d'hériter du même problème.
- Compétences dédupliquées : le classeur source distinguait parfois une variante "(force)" et une variante "(métier)" de la même compétence (bug de copier-coller probable) — une seule entrée par compétence dans `module/config.mjs`, avec des flags `force`/`metier`.
- Contenu de compendium volontairement limité à un échantillon vérifié (6 races, 6 métiers, 8 talents, 6 armes, 3 armures) plutôt qu'une transcription automatique des ~30 races/~20 métiers du classeur : les formules Excel de modificateurs raciaux contiennent des incohérences (auto-références, versions divergentes entre `Metier v2.5.docx`, `archétype_metier_galactic_wars.docx` et `Template corriger.xlsx`) qui demandent une revue avec l'auteur plutôt qu'une extraction automatique risquée.

**Fait :**
- `system.json`, `package.json` + scripts `pack:build`/`pack:unpack`.
- Actor `personnage` (caractéristiques, ~37 compétences en %, PV/points de force/stress/alignement, race/métier).
- Items `race`, `metier`, `talent`, `arme`, `armure`, `pouvoir`, `equipement`.
- Sheets ApplicationV2 + templates Handlebars + CSS.
- Helpers : jet de compétence 1d100, application race/métier (avec vérification des prérequis pour le métier), migration idempotente.
- `npm install` + `npm run pack:build` validés (5 packs compilés en LevelDB).
- `node --check` passé sur tous les modules (syntaxe valide — la validation runtime nécessite un vrai client Foundry v14).

**Pas encore fait / vérifié en conditions réelles :** chargement dans un vrai monde Foundry v14 build 367 (nécessite un déploiement + test manuel côté utilisateur, pas fait dans cette session). Fiche rapide (Phase B), fiche sith (Phase C), PNJ (Phase D), vaisseaux, économie.

**Fichiers** : `system.json`, `package.json`, `.gitignore`, `scripts/build-packs.mjs`, `scripts/unpack-packs.mjs`, `module/galactic-wars.mjs`, `module/config.mjs`, `module/documents/actor.mjs`, `module/documents/item.mjs`, `module/data/actor-personnage.mjs`, `module/data/item-race.mjs`, `module/data/item-metier.mjs`, `module/data/item-talent.mjs`, `module/data/item-arme.mjs`, `module/data/item-armure.mjs`, `module/data/item-pouvoir.mjs`, `module/data/item-equipement.mjs`, `module/sheets/personnage-sheet.mjs`, `module/sheets/item-sheet.mjs`, `module/helpers/rolls.mjs`, `module/helpers/race.mjs`, `module/helpers/metier.mjs`, `module/helpers/migration.mjs`, `templates/actor/personnage-sheet.hbs`, `templates/item/item-sheet.hbs`, `styles/galactic-wars.css`, `lang/fr.json`, `packs/_source/**`, `CAHIER_DES_CHARGES.md`.
