# Galactic Wars — système Foundry VTT

Système de jeu de rôle Star Wars maison pour Foundry VTT v14. Voir `CAHIER_DES_CHARGES.md` pour le détail, `JOURNAL.md` pour l'historique de développement.

## Installation dans Foundry VTT

Dans Foundry : **Systèmes de jeu → Installer un système**, puis coller l'URL du manifeste en bas de la fenêtre :

```
https://github.com/SotarS21/jdr_gw/releases/latest/download/system.json
```

Le dépôt est public : aucun compte GitHub n'est nécessaire. Foundry propose ensuite les mises à jour
depuis le même manifeste. Au premier chargement d'un monde après une mise à jour, le MJ voit les notes de version.

## Structure

```
system.json                point d'entrée du système (documentTypes, packs, compat v14)
module/
  galactic-wars.mjs         hooks init/ready, enregistrement des sheets et DataModels
  config.mjs                GW.caracteristiques / GW.competences (clés i18n)
  documents/                sous-classes Actor/Item
  data/                     un TypeDataModel par type d'Actor/Item (defineSchema + prepareDerivedData)
  sheets/                   ApplicationV2 (HandlebarsApplicationMixin)
  helpers/                  rolls.mjs (jet %), race.mjs / metier.mjs (application), migration.mjs
templates/                  Handlebars des sheets
styles/galactic-wars.css    scoping racine .galactic-wars
lang/fr.json                clés GALACTICWARS.*
packs/_source/<pack>/*.json  contenu de compendium, lisible/éditable à la main
packs/<pack>/                compendiums compilés (LevelDB) — générés, ne pas éditer à la main
scripts/                     build-packs.mjs / unpack-packs.mjs
```

## Compendiums

```
npm install         # une fois
npm run pack:build   # packs/_source -> packs (LevelDB, ce que Foundry charge)
npm run pack:unpack  # packs -> packs/_source (après une modif faite depuis Foundry)
```

## Déploiement local (développement)

```powershell
powershell -ExecutionPolicy Bypass -File scriptsdeploy-local.ps1   # -NoRestart si aucun compendium modifié
node scripts/verify-local.mjs "<contrôle JS optionnel>"
```

Le dossier déployé est une copie miroir : ne pas y utiliser git. Toujours valider en local avant de pousser.

## Publication

Pousser un tag `vX.Y.Z` (identique à `version` dans `system.json`) déclenche `.github/workflows/release.yml` :
build des packs, remplissage de `manifest` / `download` dans le `system.json` publié, puis release GitHub
avec `system.json` et `system.zip`. Dans le dépôt, `manifest` et `download` restent vides volontairement.
Penser à ajouter la version dans `module/helpers/release-notes.mjs`, et, si une fonctionnalité change des
données déjà copiées dans les mondes (objets importés, personnages, tokens), une entrée dans
`module/helpers/pack-updates.mjs` : le MJ la verra dans la fenêtre « mises à jour de contenu ».
