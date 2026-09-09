# Journal de développement — Galactic Wars

## Session du 2026-09-10 (suite) — PNJ (v0.3.0 → v0.4.0)

Dernière étape de la session : les 4 fiches prévues (classique → rapide → sith → PNJ) sont maintenant toutes livrées.

**Fait :**
- Actor `pnj` : **réutilise tel quel** `PersonnageRapideData` (module/data/actor-personnage-rapide.mjs) — même schéma exact que la fiche rapide (8 caractéristiques Force/Cap.Cmbt/Cap.Tir/Dextérité/Mentale/Perception/Stress/Aff.Force, Survie, métier, talent, équipement), pas de nouvelle classe de données. Seule la mécanique de jet change : `rollCaracteristiquePourcentage` (nouveau, 1d100 sous la valeur, mêmes seuils de critique que les autres jets en %) au lieu de `rollCaracteristiqueD20`.
- `PersonnageRapideSheet` (module/sheets/personnage-rapide-sheet.mjs) est aussi réutilisée telle quelle pour les deux types (`personnage-rapide` et `pnj`, deux `registerSheet` séparés avec des libellés différents) : elle regarde `this.actor.type` pour choisir la mécanique de jet au clic sur 🎲, et le template masque les avertissements de plafond de création de PJ (max 80 total, pas plus de deux caractéristiques à 16) pour un PNJ — un stat-block créé par le MJ n'a pas de raison de respecter ces règles de chargen joueur.
- Aucune duplication de code introduite : ce choix (un seul DataModel + une seule sheet partagés par deux Actor types, différenciés à l'exécution) évite d'avoir deux classes quasi identiques à maintenir en parallèle.

**Pas fait dans cette session :** contenu de compendium PNJ (aucun stat-block de monstre/garde/etc. pré-rempli — le matériel source n'a pas encore été passé en revue pour ça). Vaisseaux, économie, pregens sith, complétion à 100% des races/métiers/talents restent en attente (voir §10 de CAHIER_DES_CHARGES.md).

**Fichiers (en plus des sessions précédentes)** : `module/helpers/rolls.mjs` (`rollCaracteristiquePourcentage`), `module/sheets/personnage-rapide-sheet.mjs`, `templates/actor/personnage-rapide-sheet.hbs`, `module/galactic-wars.mjs` (type `pnj`), `system.json` (documentType `pnj`, v0.4.0), `lang/fr.json`.

---

## Résumé de la session du 2026-09-10 (toutes les entrées ci-dessus, pour référence rapide)

En une session : le système est passé de **rien** (uniquement du matériel source Excel/Word) à un système Foundry VTT v14 fonctionnel avec **4 types de fiche de personnage** (classique, rapide, sith, PNJ), chacun avec sa propre mécanique de résolution (% sous la valeur / d20 sous la valeur / d20+valeur vs DC du MJ / % sous la valeur), 6 compendiums (races, métiers, talents, armes, armures, écoles sith), déployé localement et poussé sur `https://github.com/SotarS21/jdr_gw.git`. Deux bugs trouvés et corrigés en cours de route (compendiums vides faute de champ `_key`, extraction de cellules Excel auto-fermantes) — voir les entrées correspondantes ci-dessus. Reste en attente : contenu complet des compendiums (au-delà de l'échantillon vérifié), pregens sith, PNJ types, vaisseaux, économie — voir §10 de `CAHIER_DES_CHARGES.md`.

---

## Session du 2026-09-10 (suite) — Fiche sith + fix d'un bug d'extraction (v0.2.0 → v0.3.0)

**Deuxième bug d'extraction trouvé et corrigé (méthodologie, pas de casse dans le système livré) :** en relisant `Fiche_de_personnage_short.xlsx` et `fiche perso sith prétirer.xlsx` pour préparer la Phase C, découvert que `dump_sheet.js` (script d'extraction ad hoc utilisé depuis la 1ère session) mappait mal certaines cellules : sa regex ne traitait pas les cellules Excel auto-fermantes (`<c r="X" s="19"/>`, vides) comme un cas à part, ce qui pouvait faire "sauter" la capture d'une cellule vide jusqu'au `</c>` d'une cellule non liée, plus loin dans le fichier, et lui attribuer son contenu par erreur. Corrigé (`dump_sheet2.js` : alternative "auto-fermante" testée en premier dans la regex). **Vérifié après coup que les données déjà livrées n'étaient pas corrompues** : ni les 6 races (re-parsées avec la regex corrigée, résultat identique — ces cellules de formules n'étaient jamais auto-fermantes), ni la structure de la fiche rapide (les champs qui comptaient pour le jeu — les 8 caractéristiques, la règle des deux max à 16, Équipement/Description — étaient déjà corrects ; seuls des libellés cosmétiques avaient été mal positionnés dans ma lecture). Retenir : pour toute lecture future d'un classeur Excel, utiliser un extracteur qui gère explicitement `<c .../>` avant le cas "avec contenu".

**Mécanique de jet de la fiche sith clarifiée avec l'utilisateur :** contrairement à la classique (%) et à la fiche rapide (d20 sous la valeur), la fiche sith se résout en **1d20 + valeur, comparé à un DC fixé par le MJ en cours de partie** (pas de seuil stocké sur la fiche, pas de détermination automatique de réussite/échec par le système). La règle source "interdit de mettre + de deux compétences à 6, 5" reste partiellement ambiguë (le second nombre "5" n'est pas expliqué) — implémenté comme un plafond de 6 (pas plus de deux caractéristiques à 6), à confirmer.

**Fait :**
- Actor `personnage-sith` : Physique/Agilité/Perception/Mental (modificateurs additifs) + 7 compétences de force fixes (Télékinésie, Poussée de force, Défense, Illusion, Persuasion, Combat armé, Furtivité), Corpulence (Maigrichon/Normal/Épais/Fort → PV max dérivé 11/13/15/17), Chance + Survie (chance+base, même mécanique additive), Force (points), École (référence + capacités auto-remplies), équipement, description. Race réutilisée en nom seul (comme sur la fiche rapide).
- Item `ecole` (École sith) : capacités nommées + équipement/vaisseau de départ. Compendium `ecoles` complet (8/8 : Assassin sith, Sorcière sith, Guerrier sith, Inquisiteur sith, Héraut sith, Magicien, Maître d'armes, Bulldozer) — repris verbatim d'`École de sith jouable.docx`.
- `rollD20Plus` (nouveau helper générique 1d20+modificateur, sans détermination de réussite) dans `module/helpers/rolls.mjs`.
- `applyEcole` (nouveau helper, même principe que `applyMetier`/`applyRace`).
- Sheet + template + CSS dédiés.

**Reste à faire pour la fiche sith :** transcrire les 6 pregens de `Prétirer sith/PJ/` (Seigneur Kris, Seigneur Mer Naga, Seigneur Quenor, Seigneur Samash, Seigneur Sinar, Seigneur Davos) en compendium Actor.

**Fichiers (en plus des sessions précédentes)** : `module/data/actor-personnage-sith.mjs`, `module/data/item-ecole.mjs`, `module/sheets/personnage-sith-sheet.mjs`, `module/helpers/ecole.mjs`, `templates/actor/personnage-sith-sheet.hbs`, `module/config.mjs` (ajout `GW.caracteristiquesSith`/`GW.competencesForceSith`/`GW.limitesCaracteristiquesSith`/`GW.corpulences`), `module/helpers/rolls.mjs` (`rollD20Plus`), `module/galactic-wars.mjs`, `system.json` (documentTypes `personnage-sith`/`ecole`, pack `ecoles`, v0.3.0), `lang/fr.json`, `styles/galactic-wars.css`, `templates/item/item-sheet.hbs` (édition des capacités d'école), `packs/_source/ecoles/**`.

---

## Session du 2026-09-10 — Fix compendiums vides + push GitHub + fiche rapide (v0.1.0 → v0.2.0)

**Fix critique (avant la fiche rapide) :** les compendiums déployés en fin de session précédente étaient vides malgré un `pack:build` "réussi". Cause : `@foundryvtt/foundryvtt-cli::compilePack` ignore silencieusement (`if (!doc._key) continue`) tout document source sans champ `_key` (`!items!<id>`) — les 29 JSON générés n'en avaient pas. Corrigé sur tous les fichiers `packs/_source/**`, recompilé (vérifié directement via `classic-level` : 6 clés dans le pack `races`, contre 0 avant), redéployé.

Dépôt poussé vers `https://github.com/SotarS21/jdr_gw.git` (branche `main`, fusionné avec le README initial du dépôt distant).

**Correction de mécanique reçue en cours de session :** la fiche rapide se résout en **1d20 sous la valeur** (pas en 1d100 comme la classique) — les 8 caractéristiques ne sont pas des %, ce qui explique leur total plafonné à 80 (moyenne ~10/stat) et la règle "pas plus de deux à 16". Confirmé par relecture précise de `Fiche_de_personnage_short.xlsx` (label "Max 80" sans "%", contre "Survie" qui elle reste marquée "%" — la Survie reste donc résolue en 1d100). Note reçue pour la suite : les PNJ (Phase D) réutiliseront ce même bloc de 8 caractéristiques mais résolu en **1d100**, pas en d20 — à traiter avec un helper de jet dédié, pas une réutilisation de `rollCaracteristiqueD20`.

**Fait :**
- Actor `personnage-rapide` : 8 caractéristiques (Force/Cap.Cmbt/Cap.Tir/Dextérité/Mentale/Perception/Stress/Aff.Force), Survie (%), talent générique + métier (description auto-remplie depuis le talent signature du métier), équipement en texte libre, biographie.
- `rollCaracteristiqueD20` (1d20, 1 nat = critique, 20 nat = échec critique) et `rollSurvie` (1d100) dans `module/helpers/rolls.mjs`, refactorisé pour partager la logique de résolution en % entre `rollCompetence` et `rollSurvie`.
- `applyRace`/`applyMetier` généralisés : ne touchent `system.competences`/`system.caracteristiques.*.racial` (structure propre à la fiche classique) que si l'Actor est de type `personnage` ; sur `personnage-rapide`, seuls le nom de race/métier et l'équipement de départ sont appliqués (traduire les bonus raciaux vers le référentiel d20 est un choix de design à faire, pas encore tranché).
- Sheet + template + CSS dédiés.

**Fichiers (en plus de la session précédente)** : `module/data/actor-personnage-rapide.mjs`, `module/sheets/personnage-rapide-sheet.mjs`, `templates/actor/personnage-rapide-sheet.hbs`, `module/config.mjs` (ajout `GW.caracteristiquesRapides`/`GW.limitesCaracteristiquesRapides`), `module/helpers/rolls.mjs`, `module/helpers/race.mjs`, `module/helpers/metier.mjs`, `module/galactic-wars.mjs`, `system.json` (documentType `personnage-rapide`, v0.2.0), `lang/fr.json`, `styles/galactic-wars.css`, `scripts/build-packs.mjs` (option `transformEntry` corrigée), `packs/_source/**` (ajout `_key`).

---

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
