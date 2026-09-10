# Journal de développement — Galactic Wars

## Session du 2026-09-10 (suite) — Économie (v0.6.0 → v0.7.0)

**Portée décidée avec l'utilisateur (question posée)** : le classeur source (`[GW] Science
économique.xlsx`, un seul onglet "Quickplay") est un catalogue de prix en crédits — armes/armes de
mêlée-jet, outils, véhicules, consommables — sans aucune notion de crédits/prix existant encore dans
le système. Choix retenu : pactole de crédits sur les 4 fiches de personnage, champ `prix` sur les
objets achetables, catalogue échantillon en compendium (même convention que races/métiers : sample
vérifié, pas exhaustif). Le même classeur listait aussi ~12 véhicules/vaisseaux supplémentaires
(au-delà de la Convergence déjà transcrite) — ajoutés dans la foulée sur demande explicite, avec
consigne complémentaire de l'utilisateur : compléter les salles/bouclier/PV manquants par des
valeurs plausibles plutôt que de les laisser vides, en le signalant clairement comme estimation.

**Orchestration** : matériel volumineux (catalogue à colonnes multiples + 12 fiches de vaisseau à
rédiger avec calibration cohérente) traité via un **workflow multi-agents** (mot-clé "ultracode") —
6 agents de rédaction en parallèle (2 catalogue + 4 lots de 3 vaisseaux) puis 2 agents de vérification
JSON/schéma. **Défaut trouvé et corrigé après coup** : les prompts envoyés aux agents avaient été
tapés sans accents (erreur de saisie de ma part, pas des agents) ; certains agents ont fidèlement
reproduit ce français sans accents dans le contenu généré (armes, équipements, et environ la moitié
des nouveaux vaisseaux), d'autres l'ont corrigé spontanément. Repassé un correctif ciblé (dictionnaire
de substitutions sur les valeurs JSON uniquement, jamais sur les clés) sur tous les fichiers touchés
avant intégration — à retenir : toujours écrire les prompts de workflow en français correct quand le
contenu produit est du français destiné aux joueurs, la reproduction fidèle du style d'entrée est un
comportement normal des agents, pas un bug à leur charge.

**Fait :**
- `credits` (NumberField, entier ≥ 0) ajouté aux 4 DataModels de personnage (`personnage`,
  `personnage-rapide`/`pnj`, `personnage-sith`), affiché dans la section Ressources de chaque fiche.
- `prix` (StringField libre, ex. "1200c", "NA" = non achetable comme indiqué dans le classeur source)
  ajouté à `item-arme`, `item-armure`, `item-equipement` et à l'Actor `vaisseau`, édité depuis la
  sheet d'objet / la fiche de vaisseau. Rétro-rempli sur 2 des 6 armes déjà livrées quand une
  correspondance fiable existait dans le classeur (Blaster 250c, Blaster lourd 4500c) — laissé vide
  sur les 4 autres armes et les 3 armures faute de correspondance fiable (pas de devinette).
- Nouveau compendium Item `equipements` (11/11, échantillon) : Comlink, Pisto grappin, Filet
  électrique, Kolto, Kolto max, Matériel médical, Droïde médical, Repas commun, Boisson (non)
  alcoolisée, Rayon tracteur (amélioration de vaisseau).
- Pack `armes` complété (+4, échantillon) : Grenade, Grenade militaire, Lance-roquette, Trident sith
  (marqué "NA", non achetable — illustre le cas dans le catalogue).
- Pack `vaisseaux` complété (+12, désormais 13/13 de tout ce que couvre le classeur véhicules) :
  Moto speeder, Land speeder, Barloz class médium Freighter, Le Barmaid Betty, CEC XS-122 Freighter,
  Corellian Dawn, Dynamic 20 modular transport, Gunboat 1061-968, Lantallian GX-class Executive
  transport, La poubelle géante, Le Arcadia, Le Frelon. Trois d'entre eux (Barloz, poubelle géante,
  Arcadia) avaient déjà bouclier/PV/salles complets dans le classeur — transcrits fidèlement. Les
  neuf autres n'avaient que taille/équipage/prix — bouclier, PV de coque et salles complétés par
  estimation calibrée sur ces trois, avec note MJ explicite sur chaque fiche concernée précisant que
  la valeur est inventée. Aucun membre d'équipage nommé inventé nulle part (seul le nombre de
  personnes, quand donné) — contrairement à la Convergence dont l'équipage nommé vient du classeur.
- Outil `scripts/dump-xlsx.mjs` réutilisé tel quel (aucune nouvelle extraction ad hoc).

**Pas fait dans cette session :** complétion des compendiums races/métiers/talents/armes/armures à
100% du matériel source ; contenu PNJ type (monstres/gardes/etc.) ; le reste du catalogue économique
au-delà de l'échantillon (une quarantaine de lignes d'armes/améliorations non transcrites,
échantillon volontairement limité comme pour races/métiers).

**Fichiers (en plus des sessions précédentes)** : `module/data/actor-personnage.mjs`,
`module/data/actor-personnage-rapide.mjs`, `module/data/actor-personnage-sith.mjs` (`credits`),
`module/data/item-arme.mjs`, `module/data/item-armure.mjs`, `module/data/item-equipement.mjs`,
`module/data/actor-vaisseau.mjs` (`prix`), `templates/actor/personnage-sheet.hbs`,
`templates/actor/personnage-rapide-sheet.hbs`, `templates/actor/personnage-sith-sheet.hbs`,
`templates/actor/vaisseau-sheet.hbs`, `templates/item/item-sheet.hbs`, `lang/fr.json`, `system.json`
(pack `equipements`, v0.7.0), `packs/_source/armes/{grenade,grenade-militaire,lance-roquette,
trident-sith}.json`, `packs/_source/armes/{blaster,blaster-lourd}.json` (prix rétro-rempli),
`packs/_source/equipements/**` (nouveau pack), `packs/_source/vaisseaux/**` (+12).

---

## Session du 2026-09-10 (suite) — Vaisseaux (v0.5.0 → v0.6.0)

**Constat avant de commencer :** contrairement aux races/métiers (formules Excel) ou à l'école sith (liste fermée de 8), le matériel source ne contient **aucune règle générique de vaisseau/combat spatial** — un seul vaisseau nommé et détaillé (le destroyer sith *Convergence*, `Vaiseau destroyer sith.docx` : PV de coque, bouclier, armement, équipage narratif complet, équipements embarqués) et deux mentions sans stats (équipement de départ "vaisseau de classe frelon"/"vaisseau moyen" sur les écoles sith). Décision prise avec l'utilisateur (question posée) : construire un Actor `vaisseau` générique réutilisable plutôt que de transcrire la Convergence en simple note, mais **sans mécanique de jet automatisée** (aucune compétence "pilotage vaisseau" ni règle de combat spatial n'existe dans le matériel source — la fiche est un stat-block/suivi géré narrativement par le MJ, comme le sont déjà les armes de personnage : `system.degats` texte libre, pas de jet automatique).

**Fait :**
- Actor `vaisseau` (`module/data/actor-vaisseau.mjs`) : classe, taille, coque (PV actuels/max), bouclier (points, réduction, actif), moteur (cases de déplacement avant de tomber en rade), armement (liste `{nom, degats, quantite}`), équipage (liste `{role, nom, description}`), soute, équipements embarqués (texte libre), description.
- `VaisseauSheet` (ApplicationV2) + template dédiés. Première introduction dans le système d'un pattern **ajout/retrait dynamique** sur une liste (`addArmement`/`removeArmement`, `addEquipage`/`removeEquipage`) — les listes existantes jusqu'ici (compétences, capacités d'école) étaient toutes de taille fixe ; un vaisseau a un nombre variable d'armes/de membres d'équipage d'un vaisseau à l'autre, donc UI nécessaire ici contrairement au reste du système.
- Nouveau compendium Actor `vaisseaux` (1/1 pour l'instant) : la *Convergence* transcrite intégralement (équipage nommé complet, armement, bouclier, équipements embarqués). Une incohérence de PV dans le classeur source ("PV : 50 100" en tête vs "coque qui fait 300 pv" plus loin dans le même document) a été résolue en faveur de la valeur explicite (300), avec une note MJ sur la fiche expliquant le choix plutôt que de trancher silencieusement.
- Outil d'extraction `scripts/dump-docx.mjs` (librairie `mammoth`, devDependency) pour lire les fichiers `.docx` sources — même logique que `dump-xlsx.mjs` (session précédente) : une vraie librairie de parsing plutôt qu'un dézippage + regex maison.

**Pas fait dans cette session :** aucune autre entrée dans le compendium `vaisseaux` (les deux petits vaisseaux sans stats des écoles sith restent de simples mentions texte dans `ecole.equipementDepart`, pas des Actors). Reste au menu : économie, complétion des compendiums races/métiers/talents/armes/armures, contenu PNJ type.

**Fichiers (en plus des sessions précédentes)** : `module/data/actor-vaisseau.mjs`, `module/sheets/vaisseau-sheet.mjs`, `templates/actor/vaisseau-sheet.hbs`, `module/galactic-wars.mjs` (type `vaisseau`), `system.json` (documentType `vaisseau`, pack `vaisseaux`, v0.6.0), `lang/fr.json`, `styles/galactic-wars.css`, `packs/_source/vaisseaux/convergence.json`, `package.json`/`package-lock.json` (devDependency `mammoth`), `scripts/dump-docx.mjs`.

---

## Session du 2026-09-10 — Pregens sith (v0.4.0 → v0.5.0)

**Fait :**
- Nouveau compendium Actor `pregens-sith` (6/6) : transcription des 6 fiches prétirées de `Prétirer sith/PJ/*.xlsx` (Seigneur Kris - Magicien, Seigneure Mer Naga - Sorcière, Seigneur Quenor - Assassin, Seigneur Samash - Guerrier, Seigneur Davos - Héraut, Seigneur Sinar - Inquisiteur) en Actor `personnage-sith`, prêts à glisser sur une scène. École liée par `uuid` au compendium `ecoles` (capacités spéciales auto-remplies comme le ferait le bouton "Appliquer" en jeu) ; race en nom seul sauf Quenor (Humain, seule race des 6 présente dans l'échantillon `races`), conformément à la convention déjà en place sur cette fiche (pas de modificateurs raciaux sur le référentiel sith).
- **Écart trouvé entre le classeur vierge et les 6 pregens réels :** les 6 fiches ont toutes une 8ᵉ compétence de force, "Éclair de force", absente du classeur vierge (`fiche perso sith prétirer.xlsx`) et donc du DataModel livré en v0.3.0 (7 compétences seulement). Comme les 6 pregens ont des valeurs non nulles sur cette compétence (1 à 3), ajoutée au schéma plutôt qu'ignorée pour ne pas perdre de données de personnage — changement additif (défaut 0), sans script de migration nécessaire. Voir `module/data/actor-personnage-sith.mjs`, `module/config.mjs`, `lang/fr.json`.
- PV actuels : reproduits tels quels quand cohérents avec la corpulence (pleine santé par défaut), sauf deux pregens où le classeur source indiquait explicitement un personnage déjà blessé (Quenor 7/11 ; Sinar, dont la cellule PV était corrompue mais dont l'onglet Notes précisait "2 PV en moins, lien avec Quenor" → 11/13). Toute autre valeur de PV visiblement incohérente dans le classeur (ex. Davos "13/13" alors que sa corpulence "Fort" donne 17 max) a été normalisée à la pleine santé plutôt que recopiée à l'identique.
- Outil d'extraction : installé `xlsx` (SheetJS) en devDependency et écrit `scripts/dump-xlsx.mjs` pour lire les classeurs sources ligne par ligne — remplace l'approche ad hoc "dézipper + regex XML" des sessions précédentes (source du bug corrigé en v0.3.0) par une vraie librairie de parsing .xlsx.

**Pas fait dans cette session :** le reste du §10 de `CAHIER_DES_CHARGES.md` (vaisseaux, économie, complétion des compendiums races/métiers/talents/armes/armures, contenu PNJ type).

**Fichiers (en plus des sessions précédentes)** : `packs/_source/pregens-sith/**` (6 fichiers), `module/data/actor-personnage-sith.mjs` (`eclairDeForce`), `module/config.mjs` (`GW.competencesForceSith.eclairDeForce`), `lang/fr.json`, `system.json` (pack `pregens-sith`, v0.5.0), `package.json`/`package-lock.json` (devDependency `xlsx`), `scripts/dump-xlsx.mjs`.

---

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
