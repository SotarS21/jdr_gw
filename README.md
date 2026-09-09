# Galactic Wars — système Foundry VTT

Système de jeu de rôle Star Wars maison pour Foundry VTT v14. Voir `CAHIER_DES_CHARGES.md` pour le détail, `JOURNAL.md` pour l'historique de développement.

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

## Déploiement local

```powershell
Copy-Item -Path "C:\projet\VTT_Foundry\projet_galacitc_wars_system\galactic-wars\*" -Destination "D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\galactic-wars\" -Recurse -Force
```

Puis `Ctrl+Shift+F5` dans le client Foundry pour vider le cache.
