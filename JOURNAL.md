# Journal de développement — Galactic Wars

## Session du 2026-09-15 — Cause racine du bug de sauvegarde + picker race/métier/école (v0.9.0 → v0.10.0)

Reprise directe du bug de sauvegarde laissé ouvert la session précédente (voir entrée du 2026-09-14 (2)
ci-dessous). En route, l'utilisateur a signalé en direct (monde `Galacit wars V final` toujours ouvert
de la session précédente) : compétences disparues sur plusieurs fiches, et boutons "Appliquer"
race/métier ne faisant rien d'utile.

**Diagnostic en direct (Playwright, compte GM `claude`/`1234` sur `http://localhost:30000`, package
`playwright` récupéré depuis le cache `_npx` faute d'être une dépendance du projet — voir note
technique en fin d'entrée)** : monkey-patch de `ApplicationV2.prototype._onSubmitForm` et
`DocumentSheetV2.prototype._prepareSubmitData`/`_processSubmitData` pour tracer ce qui arrive
réellement à la sauvegarde d'un champ. Résultat : `FormDataExtended(this.element)` retournait **0
champs** sur les 90 attendus.

**Cause racine trouvée : `<form>` imbriqué.** Les 5 templates (`personnage`, `personnage-rapide`,
`personnage-sith`, `vaisseau`, item générique) commencent chacun par leur propre `<form class="...">`
— mais `DocumentSheetV2` rend déjà `this.element` lui-même comme un `<form>` (avec les classes de
`DEFAULT_OPTIONS.classes`, donc le `<form>` du template était de toute façon redondant). Résultat :
tous les inputs se retrouvaient dans l'arbre DOM comme descendants du `<form>` *interne* (celui du
template), dont le propriétaire de formulaire ("form owner", au sens de la spec HTML) est le plus
proche ancêtre `<form>` — pas le `<form>` racine que Foundry interroge. `FormDataExtended(racine)` ne
voyait donc aucun des champs, qui appartenaient tous au formulaire interne. `_prepareSubmitData`
appelle ensuite `document.validate({changes: {}, clean: {addTypes: true}})`, qui ajoute `type` à
l'objet vide — d'où le payload `{"type": "personnage"}` observé la session précédente. Corrigé en
remplaçant le `<form>` de tête de chaque template par un simple `<div>` (`PARTS` exige un seul élément
racine, donc suppression pure sans wrapper aurait cassé le rendu — testé, message d'erreur explicite
de Foundry : *"Template part 'body' must render a single HTML element"*).

**Deuxième bug trouvé en testant le premier fix, corrigé aussi : `ArrayField` et champs non exposés.**
Une fois la sauvegarde réellement fonctionnelle, le payload envoyé à `actor.update()` pour
`system.competences` réinitialisait `cle` à `""` sur les 37 entrées (`racial`/`metier`/
`acquiseParMetier` aussi). Cause : `system.competences` est un `ArrayField`, dont `Document#update()`
remplace chaque élément du tableau en entier plutôt que de fusionner ses champs un par un (comportement
déjà repéré une fois avec les updates directs par index, voir mémoire `feedback-foundry-arrayfield-
testing` — mais cette fois via le formulaire normal, pas un `actor.update()` manuel). Le template
n'avait des `<input>` que pour `niveau`/`ajustement` ; `cle`/`racial`/`metier`/`acquiseParMetier`
n'étaient jamais soumis, donc réinitialisés à leur défaut de schéma à chaque sauvegarde — cassant
`GW.competences[cle]` partout (labels, regroupement par caractéristique, calcul du malaus). Corrigé en
ajoutant des `<input type="hidden">` (avec `data-dtype="Number"`/`"Boolean"` pour un cast correct par
`FormDataExtended`) pour ces 4 champs sur chaque ligne de compétence.

**Dégât collatéral de mon propre test (avant le fix ci-dessus) réparé** : un premier essai de
sauvegarde (avant l'ajout des `<input hidden>`) a réellement déclenché le bug sur l'Actor de test
"Kael Dorn (test)", faisant passer son tableau `system.competences` de 37 à 74 entrées (37 anciennes
vidées + 37 nouvelles réinjectées par la migration idempotente au rechargement suivant). Réparé par un
script dédié : regroupement par `cle` en gardant l'entrée la plus "complète" de chaque doublon,
reconstruction d'un tableau propre de 37 entrées dans l'ordre de `GW.competences`, puis un seul
`actor.update({"system.competences": tableauComplet})` (jamais d'update par index isolé — voir mémoire
citée plus haut). Vérifié : `nbCompetences` repassé à 37 partout, aucun autre Actor touché.

**Fausse alerte clarifiée avec l'utilisateur** : le fait de me connecter (compte GM `claude`, en
lecture seule au départ) a déclenché `runMigrations()` (hook `ready`, une fois par session client GM),
qui a ajouté les 37 clés de compétence manquantes à 3 Actors (`Test_robin`, `test_fab`, `test_raton`).
Log affiché : *"Migration : 37 compétence(s) ajoutée(s) à ..."* — ça ressemblait à une perte de
données, mais c'était en réalité leur toute première connexion GM depuis leur création (pas de perte
réelle, confirmé par l'utilisateur : "pantins de test, pas grave"). Reste un vrai gap UX signalé au
§10 item 15 de `CAHIER_DES_CHARGES.md` : un `personnage` neuf n'a aucune compétence tant qu'un GM n'a
pas rechargé le monde une fois.

**Picker de compendium race/métier/école** (demande de l'utilisateur, découverte en testant : les
boutons "Appliquer" ne faisaient jamais rien d'utile en pratique, faute d'un moyen de renseigner
`system.race.uuid`/`system.metier.uuid`/`system.ecole.uuid` — seul un glisser-déposer depuis la
sidebar l'aurait permis, jamais implémenté ; confirmé par le personnage de test qui avait un nom de
race renseigné mais un `uuid` vide). Nouveau helper `module/helpers/compendium-picker.mjs` :
`choisirItemCompendium(packName, {title})` ouvre une `DialogV2` listant (triées alphabétiquement) les
entrées du compendium demandé, et retourne le document choisi. Boutons renommés "Appliquer" →
"Choisir" sur les 3 fiches concernées (`personnage`, `personnage-rapide`, `personnage-sith`) : un clic
ouvre la liste et applique directement le choix (`applyRace`/`applyMetier`/`applyEcole`, logique
existante et inchangée). Le "conditionnement des compétences selon le métier" demandé par l'utilisateur
était déjà entièrement implémenté côté `applyMetier` (`acquiseParMetier: true` + bonus sur les
compétences accordées par le métier, malus `-30%` sinon contre `-10%` pour une compétence non-métier)
— il manquait seulement un moyen de déclencher le tout. Testé en direct : sélection "Zabrak" (race) et
"Contrebandier" (métier) sur Kael Dorn (test) → `uuid` correctement renseigné, 6 compétences
correctement marquées `acquiseParMetier` (`blaster`, `escroquerieMensonge`, `mecanique`, `pilotage`,
`social`, `sangFroid`).

**Note technique (setup réutilisable)** : `playwright` n'est pas une dépendance du projet ; `npx
playwright --version` fonctionne mais installe dans le cache npx (`%LOCALAPPDATA%\npm-cache\_npx\
<hash>\node_modules\playwright`), pas requérable via `NODE_PATH` en ESM — contournement : `import()`
avec une URL `file:///` explicite pointant directement dans ce cache. Dossier de déploiement réel du
système (pas un symlink, une copie séparée avec son propre `.git`) : `D:\AppDataFoundry$\
FoundryVTT_Data\Data\systems\galactic-wars` — à resynchroniser manuellement (copie de fichiers) après
toute édition du dépôt source si on veut tester en direct avant de committer.

**Fichiers modifiés** : `templates/actor/{personnage,personnage-rapide,personnage-sith,vaisseau}-
sheet.hbs` + `templates/item/item-sheet.hbs` (suppression du `<form>` de tête, `<div>` à la place),
`templates/actor/personnage-sheet.hbs` (4 `<input hidden>` par ligne de compétence),
`module/helpers/compendium-picker.mjs` (nouveau), `module/sheets/{personnage,personnage-rapide,
personnage-sith}-sheet.mjs` (boutons race/métier/école → picker), `lang/fr.json` (`Sheet.Choisir`/
`Sheet.Annuler` ajoutés, `Sheet.Appliquer` et les 3 clés `Avertissement.Aucune*Selectionnee` retirés
— plus utilisés —, `Avertissement.CompendiumVide` ajouté), `system.json` (v0.10.0),
`CAHIER_DES_CHARGES.md` (§5.1nonies, §10 items 12-15).

---

## Session du 2026-09-14 (2) — 3 colonnes de compétences + bug de sauvegarde des fiches (v0.9.0 → v0.10.0, voir session suivante)

**⚠️ Session interrompue à la demande de l'utilisateur (changement de monde Foundry en cours) — tout
le code ci-dessous est écrit et déployé sur le serveur de test local, mais PAS commité (l'utilisateur
veut tester puis committer lui-même plus tard). Prochaine session : reprendre les tests en direct
là où c'est noté ci-dessous, notamment le `_prepareSubmitData` bizarre.**

**1. Fix `context.actor` manquant sur les 3 fiches restantes** (commité et pushé, `c17866a`) :
rapide/PNJ, sith, vaisseau avaient le même bug que la fiche classique (corrigé la session
précédente, `bdb3521`) — `_prepareContext` ne renseignait jamais `context.actor`, donc
`{{actor.name}}` restait vide. Vérifié en direct sur les 3 fiches (Playwright).

**2. Restauration des 3 colonnes de compétences Corps/Mental/Dextérité** (codé + déployé, PAS
commité) : demande de l'utilisateur, déjà identifiée comme dette du 2026-09-13 (voir plus bas dans
ce journal, "Les compétences ne sont PAS regroupées en 3 colonnes"). Retrouvé le mapping exact dans
la source `asset_fiche_perso/fiche_classique/Template corriger.xlsx` (onglet "fiche base", hors du
dossier système déployé) : colonnes A/D/G = Corps(12)/Mental(12)/Dextérité(13) = 37 cases. La colonne
Corps de la source contient "Arme contondante et blanche" (absente de `GW.competences`, cf. point
ouvert existant sur la compétence de mêlée manquante) à la place de `natation` (qui, dans la source,
n'apparaît que comme bonus racial isolé hors grille) — `natation` rattachée à Corps pour conserver le
compte de 12, un choix plausible mais pas garanti par la source, à confirmer si besoin.
`GW.competences` a maintenant un champ `caracteristique` par entrée (`module/config.mjs`). Le
regroupement se fait dans `PersonnageSheet#_prepareContext` (chaque caractéristique porte sa propre
sous-liste triée, avec l'index réel dans `system.competences` préservé pour les bindings de
formulaire) ; template et CSS (`.colonne-caracteristique`, grilles à 5 colonnes pour la ligne de
compétence) mis à jour en conséquence.

**3. Bug remonté par l'utilisateur : "le taux ne s'adapte pas quand on met un niveau"** — deux
causes distinctes trouvées, une corrigée avec certitude, l'autre repérée mais **pas résolue** :

- **Cause 1 (corrigée) : la formule elle-même ignorait la caractéristique.** `total` ne calculait
  que `base(niveau) + racial + metier + malus`, sans le bonus de la caractéristique liée. Formule
  validée avec l'utilisateur : `total = base(niveau) + caracteristique.total + racial + metier +
  ajustement + malus` (nouveau champ `ajustement`, réglable manuellement par le joueur pour les
  level-up, cf. demande explicite "il peut être modifié à la main"). Implémenté dans
  `actor-personnage.mjs::prepareDerivedData` + nouveau champ schema `ajustement` + input dédié dans
  le template (colonne compacte à côté du total, tooltip `AjustementManuelHint`).

- **Cause 2 (repérée, PAS corrigée) : découverte plus grave en testant la cause 1 en direct.**
  `ActorSheetV2`/`ItemSheetV2` ont `submitOnChange: false` par défaut sur cette version de Foundry,
  et **aucune des 5 fiches du système** (`personnage`, `personnage-rapide`, `personnage-sith`,
  `vaisseau`, l'item sheet générique) ne le mettait à `true`. Conséquence potentielle : tout champ
  simple lié uniquement par `name="system.xxx"` (nom, niveau, notes, caractéristiques, compétences,
  PV/Force/Stress, crédits...) ne se sauvegarderait JAMAIS tant qu'aucune action (bouton
  Lumière/Obscurité, applyRace/Metier, création d'objet...) ne force un `actor.update()` à côté.
  `form: { submitOnChange: true }` ajouté aux 5 fiches (codé + déployé). **Mais en testant après ce
  correctif, le comportement observé est toujours cassé** : le "change" event se déclenche bien et
  `actor.update()` est bien appelé, mais avec un payload quasi vide (`{"type":"personnage"}` observé
  au lieu de `{"system.niveau": "5", ...}`) — alors qu'un `new FormDataExtended(form)` construit
  manuellement au même instant retourne bien les ~90 champs attendus, `system.niveau` inclus. Le
  diagnostic s'est arrêté au monkey-patch de
  `foundry.applications.api.DocumentSheetV2.prototype._prepareSubmitData`/`_processSubmitData` pour
  voir ce qui leur est réellement passé (script non terminé, monde changé entre-temps) — **prochaine
  session : relancer ce monkey-patch pour voir si le formData qui leur arrive est déjà tronqué, ou
  si le tronquage a lieu dans leur propre logique (`_getSubmitData`/diff avec le document actuel)**.
  Tant que cette cause 2 n'est pas résolue, aucun champ simple des 5 fiches ne se sauvegarde
  réellement en jeu — bug potentiellement bien plus large que le seul "taux de compétence" remonté
  par l'utilisateur.

**Acteur de test corrompu puis réparé** : en testant la cause 2 avec des `actor.update()` directs
sur un seul index de `system.competences` (`system.competences.5.niveau`), le tableau de
compétences de "Kael Dorn (test)" s'est retrouvé tronqué à 6 entrées avec `cle` vides — signe que
les updates ArrayField partiels par index (hors formulaire complet) sont dangereux sur ce moteur.
Réparé en reconstruisant le tableau des 37 clés (`race`/`métier` n'avaient de toute façon jamais été
liés par UUID sur ce personnage de test, donc rien à réappliquer). Retenir : ne plus jamais tester
via `actor.update({"system.competences.N.champ": x})` — seulement via la vraie fiche (formulaire) ou
en remplaçant le tableau complet.

**Fichiers modifiés (non commités)** : `module/config.mjs` (`caracteristique` par compétence),
`module/data/actor-personnage.mjs` (champ `ajustement`, formule `total`), `module/sheets/
personnage-sheet.mjs` (`form: {submitOnChange:true}`, regroupement par caractéristique dans
`_prepareContext`), `module/sheets/{personnage-rapide,personnage-sith,vaisseau,item}-sheet.mjs`
(`form: {submitOnChange:true}`), `templates/actor/personnage-sheet.hbs` (3 colonnes), `styles/
galactic-wars.css` (grilles à 5 colonnes), `lang/fr.json` (`AjustementManuelHint`).

---

## Session du 2026-09-13 — Refonte ergonomique de la fiche classique (v0.8.1 → v0.9.0)

Reprise du point laissé en suspens la session précédente (voir entrée du 2026-09-10 ci-dessous) : le
barème des bonus Lumière/Obscurité manquait pour débloquer le chantier.

**Barème reçu de l'utilisateur** : 1 point dépensé (Lumière **ou** Obscurité, jamais les deux, 1 point
maximum par action) = +15% sur le jet de compétence concerné. Le point dépensé permet aussi au MJ de
"valider une difficulté" exprimée en paliers plutôt qu'en % — laissé manuel côté table pour cette
itération, pas automatisé. Réserves de 10 points chacune (Lumière/Obscurité), rechargées/ajustées
100% manuellement par le joueur (pas de mécanique de régénération automatique). Stress confirmé à
garder en valeur/max simple (pas de refonte en paliers à cocher, l'autre option ouverte la session
précédente).

**Maquette canvas mise à jour d'abord** (avant tout changement dans le système réel, comme prévu) :
le curseur alignement de l'artboard `Main` remplacé par deux jauges à pips (Lumière cyan/Obscurité
corail, 0-10) + légende du bonus — republié en version 3 sur le même lien
(https://claude.ai/code/artifact/9c1c44e9-177b-4fd5-bf38-f2e23d0852b7). Validé par l'utilisateur avant
d'attaquer le code réel.

**Puis, en cours de discussion, la demande s'est élargie** (uniquement pour la fiche classique
`personnage` — les 3 autres fiches ne sont pas concernées par cette session) :
- Découpage en 3 onglets : `Personnage` (Caractéristiques/Ressources/Compétences/Pouvoirs),
  `Équipements` (Armes/Armures/Équipement — déplacés hors de l'ancienne section unique "inventaire"),
  `Informations` (notes façon journal, en remplacement de la biographie).
- Niveau de compétence (0-3) mis en valeur visuellement (encadré, coloré, gras) dans la liste des
  ~37 compétences — signalé par l'utilisateur comme un champ très manipulé en jeu, donc à ne pas
  laisser se perdre dans la liste.
- Pouvoirs de force masqués par défaut : n'apparaissent (liste + bouton d'ajout) que si la nouvelle
  case à cocher `sensibleForce` est cochée à côté du titre de la section.
- Biographie (`HTMLField` unique) remplacée par `system.notes`, un tableau `{titre, contenu}` avec
  ajout/retrait dynamique — repris du pattern déjà utilisé pour l'armement du vaisseau (v0.6.0), seul
  autre endroit du système avec une liste de taille variable dans une sheet.

**Fait :**
- `module/data/actor-personnage.mjs` : `alignement` (NumberField -100..100) → `lumiere`/`obscurite`
  (NumberField 0..10 chacun) ; ajout `sensibleForce` (BooleanField) ; `biographie` (HTMLField) →
  `notes` (ArrayField de `{titre: StringField, contenu: HTMLField}`).
- `module/config.mjs` : `GW.alignements` simplifié (retrait de l'entrée `neutre`, devenue inutile) ;
  nouvelle constante `GW.bonusAlignement = 15`.
- `module/helpers/rolls.mjs` : `rollCompetence(actor, cle, { pool })` accepte maintenant une réserve
  optionnelle, ajoute le bonus (plafonné à 100%) et le mentionne dans le message de jet.
- `module/sheets/personnage-sheet.mjs` : nouvel état d'instance privé `#ongletActif` (pas persisté
  sur l'Actor — survit aux re-rendus car c'est l'instance de la sheet, pas le DOM, qui persiste) pour
  les 3 onglets ; actions `changerOnglet`, `ajusterLumiere`/`ajusterObscurite` (+/- bornés 0-10),
  `addNote`/`removeNote`. Le choix "quelle réserve dépenser" pour un jet se fait via un groupe de
  radios éphémère dans le DOM (jamais persisté), lu au moment du clic sur 🎲, consommé (réserve
  décrémentée) puis remis à "aucun" automatiquement par le re-rendu qui suit la mise à jour de l'Actor.
- `templates/actor/personnage-sheet.hbs` : réécrit en 3 blocs conditionnés par `ongletActif` (via le
  helper `eq` déjà enregistré) plutôt qu'un template par onglet — plus simple que d'ajouter un vrai
  système de `PARTS`/`TABS` d'ApplicationV2 pour 3 blocs qui ne se recouvrent jamais.
- `styles/galactic-wars.css` : nav d'onglets, style des 2 jauges Lumière/Obscurité, input de niveau
  de compétence mis en valeur, case à cocher "Sensible à la Force", bloc de note.
- `lang/fr.json` : nouvelles clés (`Alignement.Titre/Aucun/Hint/FlavorBonus`,
  `Sheet.OngletPersonnage/OngletEquipements/OngletInformations/SensibleForce/NoteTitrePlaceholder/
  AucuneNoteHint`), retrait de `Alignement.Neutre` (devenue inutile).
- `system.json` : v0.8.1 → v0.9.0 ; `documentTypes.Actor.personnage.htmlFields` vidé (référençait
  `biographie`, un champ qui n'existe plus).

**Pas fait / à noter pour la suite :**
- Les 3 autres fiches (rapide/PNJ, sith, vaisseau) gardent l'ancien alignement à 3 sections empilées
  sans onglets — la maquette canvas d'origine couvrait leurs 3 artboards aussi, réutilisable si
  l'auteur veut leur appliquer la même refonte plus tard.
- La "validation de difficulté par un point dépensé" côté MJ reste entièrement manuelle (pas de
  mécanique automatisée dans le système pour ça — choix explicite de l'utilisateur pour cette
  itération, voir ci-dessus).

**Déployé et testé en conditions réelles** (monde `Galacit wars V final`, Foundry v14 Build 367,
navigateur automatisé piloté via Playwright, connecté avec le compte `claude` — voir mémoire de
session pour les identifiants) : les 3 onglets, les jauges Lumière/Obscurité (+/-, bonus +15%
consommé puis réserve décrémentée, choix remis à "Aucun" après le jet — confirmé dans le message de
chat : *"Blaster (cible 35%) / Réussite. / Bonus de 15% (Lumière) dépensé"*), la case "Sensible à la
Force" (masque/affiche bien la liste de Pouvoirs), le niveau de compétence mis en valeur, et l'onglet
Informations (notes) fonctionnent tous comme prévu. Aucune erreur JS en console pendant le test.
Personnage de test **"Kael Dorn (test)"** créé dans ce monde (armes/armure/équipement/pouvoir
d'exemple) et conservé à la demande de l'utilisateur pour servir de base aux prochaines sessions.

**Session du 2026-09-14** (suite) : reskin visuel "datapad" appliqué au vrai CSS/template (cartes
sombres cyan/corail, scopées sous `.galactic-wars.personnage` pour ne pas affecter les 3 autres
fiches — vérifié intact sur `personnage-rapide` et `vaisseau`). En revérifiant le rendu dans Foundry,
**bug trouvé et corrigé** : `PersonnageSheet._prepareContext` ne mettait jamais `context.actor`, donc
`{{actor.name}}` dans le template (champ Nom en tête de fiche) restait toujours vide malgré
`value="{{actor.name}}"` — invisible à l'œil nu car le champ affichait juste son `placeholder`, il
fallait lire `input.value` en JS pour s'en apercevoir. Corrigé par l'ajout d'une ligne
(`context.actor = this.actor;`) dans `module/sheets/personnage-sheet.mjs`. **Ce même bug affecte
très probablement aussi les 3 autres fiches** (`personnage-rapide-sheet.mjs`,
`personnage-sith-sheet.mjs`, `vaisseau-sheet.mjs` ont le même pattern `_prepareContext` sans jamais
poser `context.actor`) — pas corrigé sur ces 3 fiches (hors scope de cette session, fiche classique
uniquement), à traiter une prochaine fois.

**Fichiers** : `module/data/actor-personnage.mjs`, `module/config.mjs`, `module/helpers/rolls.mjs`,
`module/sheets/personnage-sheet.mjs`, `templates/actor/personnage-sheet.hbs`,
`styles/galactic-wars.css`, `lang/fr.json`, `system.json` (v0.9.0), `CAHIER_DES_CHARGES.md` (§5.1,
§5.1octies, §10).

---

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
