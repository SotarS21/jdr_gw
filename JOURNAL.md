# Journal de développement — Galactic Wars

## Session du 2026-09-10 (suite, fin de session) — Proposition de refonte ergonomique des fiches (pas de changement livré)

**Demande** : retravailler l'ergonomie des 4 fiches de personnage (classique, rapide/PNJ, sith,
vaisseau), à partir d'un exemple de style "datapad" (cartes encadrées, thème sombre, liseré cyan)
fourni par l'utilisateur.

**Fait (exploration seulement, rien livré dans le système) :**
- Analyse de l'exemple fourni : le style visuel (cartes encadrées) est une vraie amélioration : on
  utilisait jusqu'ici de simples `<section>` empilées avec un trait de séparation. Le classement des
  compétences en 3 colonnes Corps/Mental/Dextérité proposé dans l'exemple correspond en fait
  exactement à la mise en page du classeur Excel source d'origine (`Template corriger.xlsx`, onglet
  "fiche base"), aplatie en liste unique lors du scaffold initial (session du 2026-09-09) — donc pas
  qu'une préférence esthétique, une vraie fidélité retrouvée.
- Repéré deux éléments de l'exemple qui changent la **mécanique** (pas juste le style) : alignement
  en deux réserves de points (Lumière/Obscur séparées) au lieu du curseur unique actuel, stress en
  3 paliers à cocher au lieu de valeur/max. Question posée avant de les adopter sans validation.
- Maquette statique publiée en canvas de design (4 artboards : `Main`=classique, `Rapide`, `Sith`,
  `Vaisseau`), données d'exemple réalistes (Seigneur Kris et Le Arcadia = vraies fiches du
  compendium). Relu par un passage de contrôle après coup (agent dédié) : a trouvé un emoji utilisé
  comme icône (règle du format à respecter, corrigé en SVG), un `<select>` Corpulence avec une seule
  option factice (corrigé, les 4 options réelles ajoutées), et des incohérences de taille/couleur
  entre fichiers sur le composant "carte de ressource" (unifié). Corrections republiées.
- Lien du canvas (a survivre au delà de cette session, republiable directement) :
  https://claude.ai/code/artifact/9c1c44e9-177b-4fd5-bf38-f2e23d0852b7

**Information mécanique reçue en fin de session, PAS ENCORE intégrée à la maquette ni au système :**
l'alignement Lumière/Obscurité de la fiche classique n'est pas qu'un curseur cosmétique — ce sont
**deux réserves de points réellement dépensables par le joueur** pour booster temporairement une
compétence lors d'un jet (1, 2 ou 3 points misés sur une compétence, débloquant un bonus de %). Le
barème exact des bonus (valeur du bonus pour 1/2/3 points) reste à préciser ("on verra ça plus
tard"). **Implique un changement de mécanique réel** (pas juste un restyle) : la fiche classique
devra permettre de miser des points de Lumière/Obscur sur une compétence au moment du jet, avec un
retour visuel du nombre de points engagés et du bonus obtenu — à concevoir avec le barème une fois
connu.

**Reste à faire pour cette phase (reprise prévue une prochaine session) :**
1. Obtenir le barème des bonus de compétence par points de Lumière/Obscur dépensés (1/2/3 points).
2. Mettre à jour la maquette (canvas ci-dessus) pour représenter cette mécanique de mise (remplace le
   curseur/les deux stat-cards actuels de la fiche classique).
3. Trancher stress (checkboxes à paliers vs valeur/max actuelle) avec l'utilisateur.
4. Une fois la maquette validée, implémenter réellement dans les 5 templates/CSS/DataModels — inclut
   potentiellement un changement de schéma sur `PersonnageData.alignement` (actuellement un entier
   signé -100..100 ; la mécanique de mise par points nécessite probablement deux compteurs distincts
   `lumiere`/`obscurite`, à voir selon le barème).

**Fichiers** : aucun fichier du système galactic-wars modifié (travail entièrement dans le canvas de
design externe, working files sous le répertoire scratchpad de la session, non versionnés dans ce
dépôt).

---

## Session du 2026-09-10 (suite) — Fix : fiches non scrollables (v0.8.0 → v0.8.1)

**Bug signalé par l'utilisateur :** impossible de scroller dans les fiches de personnage.

**Cause :** aucune des 5 fiches (`personnage`, `personnage-rapide`/`pnj`, `personnage-sith`,
`vaisseau`, Item) n'avait de conteneur borné en hauteur avec `overflow-y: auto` — le `<form>` racine
grandissait simplement avec son contenu au lieu d'être contraint à la hauteur de la fenêtre Foundry,
donc rien ne débordait jamais visiblement pour déclencher une barre de défilement. `scrollable: [""]`
dans `PARTS.body` (suivi de position de scroll de Foundry) pointait sur la racine du `<form>`, qui
n'était de toute façon pas l'élément voué à défiler. Repéré en comparant avec le système de référence
`projet_antique_system` (pattern `.sheet { display:flex; flex-direction:column; height:100% }` +
`.sheet-body { flex:1; min-height:0; overflow-y:auto }` — le `min-height: 0` est ce qui manquait
concrètement, sans lui un enfant flex ne peut jamais rétrécir en dessous de la taille de son contenu).

**Fait :**
- `<div class="sheet-body">` ajouté dans les 5 templates (tout ce qui suit le `<header>`).
- CSS : `.galactic-wars.sheet` passe en flex-column pleine hauteur ; `.galactic-wars .sheet-body`
  reçoit `flex:1; min-height:0; overflow-y:auto`.
- `PARTS.body.scrollable` mis à jour de `[""]` vers `[".sheet-body"]` dans les 5 sheets `.mjs`, pour
  que Foundry restaure la bonne position de scroll après un re-render (et non plus celle, inerte, de
  la racine du formulaire).

**Fichiers** : `templates/actor/{personnage,personnage-rapide,personnage-sith,vaisseau}-sheet.hbs`,
`templates/item/item-sheet.hbs`, `module/sheets/*.mjs` (5 fichiers, `scrollable`), `styles/galactic-wars.css`, `system.json` (v0.8.1).

---

## Session du 2026-09-10 (suite) — Complétion races + métiers (v0.7.0 → v0.8.0)

**Recherche de sources avant de commencer** : contrairement à la mise en garde du §7.1 du cahier des
charges ("formules Excel imbriquées incohérentes"), qui s'avère concerner surtout les **métiers**
pas les races, deux sources propres et non ambiguës ont été trouvées :
- `Race galactique world.pdf` (55 pages, ~43 races) : texte en prose avec un bloc "Bonus :" par race
  donnant des % explicites — aucune formule à interpréter. Extraction via un nouvel outil
  `scripts/dump-pdf.mjs` (librairie `pdf-parse`, même logique que `dump-xlsx.mjs`/`dump-docx.mjs`).
  Recoupé avec les 6 races déjà livrées (Chiss vérifié mot pour mot) : confirme que c'est bien la
  source déjà utilisée en session 1.
- Métiers : deux documents à croiser, ni l'un ni l'autre suffisant seul — `Metier v2.5.docx`
  (prérequis + liste de compétences + équipement, 20 métiers) et `archétype_metier_galactic_wars.docx`
  (talent signature + équipement, 20 métiers, recoupement partiel avec le premier). 6 métiers
  (Artiste acrobate, Archéo-archiviste, Cuisinier, Journaliste, Marchand, Sénateur) n'existent que
  dans le second document (talent + équipement mais aucune compétence associée) — **volontairement
  pas transcrits cette session**, faute de liste de compétences fiable ; les inventer aurait été une
  transcription à risque exactement du type que le cahier des charges demande d'éviter.
- **Talents génériques** (compendium `talents`, Brutale/Charismatique/etc.) : aucune source retrouvée
  dans le matériel du projet (ni Excel, ni docx, ni PDF) malgré une recherche large — **compendium
  non complété cette session**, à clarifier avec l'auteur (d'où vient la liste complète ?).
- **Lacune de schéma découverte** : le référentiel `GW.competences` (37 clés, fiche classique) ne
  contient aucune compétence d'arme de mêlée ("Arme contondante et blanche"/"Arme blanche"), alors
  que plusieurs races/métiers du matériel source leur donnent un bonus. Non corrigé cette session
  (changement de schéma plus large, pas une simple transcription de contenu) — les bonus concernés
  sont décrits en prose dans le champ `description` de chaque race/métier concerné plutôt
  qu'inventés comme une fausse clé de compétence. À trancher avec l'auteur.

**Orchestration** : ~51 documents à rédiger (37 races + 14 métiers), chacun nécessitant de mapper des
noms de compétences en langage naturel vers les clés exactes de `GW.competences` — fait via un
**workflow multi-agents** (6 agents races + 3 agents métiers en parallèle, chacun lisant directement
les dépouillements de `dump-pdf.mjs`/`dump-docx.mjs` déjà sauvegardés), avec une légende de
correspondance nom-source → clé précise fournie à chaque agent pour éviter toute clé inventée, puis
2 agents de vérification (JSON valide, clés de compétences toutes dans la liste autorisée, pas de
régression d'accents — la leçon de la session économie a été appliquée : prompts écrits en français
correct cette fois). Vérifié indépendamment après coup (script Node : JSON valide + clés de
compétences dans la liste autorisée sur les 63 documents du dossier) : aucun problème trouvé.

**Fait :**
- Compendium `races` complété à 43/43 (37 nouvelles : Aqualish, Arcona, Barabel, Bith, Mon Calamari,
  Cathar, Cerean, Chagrian, Devaronian, Dug, Duros, Falleen, Geonosian, Gotal, Gran, Gungan,
  Ithorian, Jawa, Kaleesh, Kel Dor, Kiffar, Kubaz, Miraluka, Mirialans, Nautolans, Quarren, Noghri,
  Rattataki, Snivvian, Sullustan, Sith, Togrutas, Toydarien, Tusken Raider, Trandoshan, Verpine,
  Zabrak).
- Compendium `metiers` complété à 20/20 (14 nouveaux : Apprenti sith, Jedi Noire, Guerrier sith,
  Soldat médecin, Soldat d'élite, Assassin, Pirate, Contrebandier, Mandalorien soldat, Médecin,
  Mécanicien, Agent secret, Robot/droïde, Robot quadrupède/droïde), talent signature rempli quand
  disponible dans `archétype_metier_galactic_wars.docx` (sinon laissé vide, comme "Jedi consulaire"
  déjà livré en session 1 — précédent confirmé, pas une omission).
- Outil `scripts/dump-pdf.mjs` (librairie `pdf-parse`, devDependency).

**Pas fait dans cette session :** talents génériques (source introuvable) ; 6 métiers sans liste de
compétences source ; le reste du catalogue économique (armes/armures/équipements, ~40 lignes) ;
contenu PNJ type.

**Fichiers (en plus des sessions précédentes)** : `packs/_source/races/**` (+37),
`packs/_source/metiers/**` (+14), `scripts/dump-pdf.mjs`, `package.json`/`package-lock.json`
(devDependency `pdf-parse`), `system.json` (v0.8.0).

---

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
