# Cahier des Charges - Système Galactic Wars pour Foundry VTT

**Référence :** GW-CDC-v0.1
**Version :** 0.1
**Date de création :** 2026-09-09
**Dernière mise à jour :** 2026-09-09
**État :** En cours de développement (Version système : 0.1.0)
**Responsables :** Mr Banane

> **📁 Dossier de livraison :** `D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\galactic-wars\`

---

## Table des Matières

1. [Présentation du Projet](#1-présentation-du-projet)
2. [Objectifs](#2-objectifs)
3. [Spécifications Techniques](#3-spécifications-techniques)
4. [Architecture du Système](#4-architecture-du-système)
5. [Fonctionnalités](#5-fonctionnalités)
6. [Modèles de Données](#6-modèles-de-données)
7. [Compendiums et Contenu](#7-compendiums-et-contenu)
8. [Intégration Foundry VTT](#8-intégration-foundry-vtt)
9. [Exigences Non Fonctionnelles](#9-exigences-non-fonctionnelles)
10. [Planification et Roadmap](#10-planification-et-roadmap)
11. [Gestion des Versions](#11-gestion-des-versions)
12. [Maintenance et Support](#12-maintenance-et-support)
13. [Annexes](#13-annexes)

---

## 1. Présentation du Projet

### 1.1 Contexte

**Galactic Wars** est un système de jeu de rôle développé pour **Foundry Virtual Tabletop**, pour un univers Star Wars maison : compétences en pourcentage, races, métiers, pouvoirs de force et alignement Lumière/Obscurité.

### 1.2 Portée

Le système permet de créer et gérer des personnages (fiche classique dans un premier temps), d'appliquer une race et un métier depuis des compendiums, de faire des jets de compétence en pourcentage, et de gérer inventaire/pouvoirs de force/biographie.

### 1.3 Public Cible

| Type d'Utilisateur | Description | Priorité |
|--------------------|-------------|----------|
| **Maîtres du Jeu (MJ)** | Créateurs de campagnes | Haute |
| **Joueurs** | Participants aux parties | Haute |

### 1.4 Environnement Technique

- **Plateforme :** Foundry Virtual Tabletop
- **Version cible :** v14 Stable — Build 367
- **Langages :** JavaScript (ES Modules natifs, aucun bundler), HTML/CSS, Handlebars
- **Framework :** API Foundry VTT (ApplicationV2, TypeDataModel)

### 1.5 Matériel source

Le matériel de règles (fiches Excel, règles de métiers/races en Word, PDF) vit à la racine de `projet_galacitc_wars_system/` (hors de ce dossier déployable) : `asset_fiche_perso/fiche_classique/` (fiche complète + races/métiers + pregens sith), `asset_fiche_perso/fiche_short/` (fiche rapide), `[GW] Science économique.xlsx` (économie, pas encore intégrée). Une synthèse de ces règles est conservée dans la mémoire Claude du projet (`project_galactic_wars_mechanics.md`).

---

## 2. Objectifs

| ID | Objectif | Statut | Priorité |
|----|----------|--------|----------|
| OBJ-001 | Scaffold système + fiche classique jouable | ✅ (v0.1.0) | Haute |
| OBJ-002 | Fiche rapide (short) | ⏳ | Haute |
| OBJ-003 | Fiche sith (pregens École de sith) | ⏳ | Moyenne |
| OBJ-004 | PNJ (façon fiche rapide) | ⏳ | Moyenne |
| OBJ-005 | Vaisseaux | ⏳ | Basse |
| OBJ-006 | Économie | ⏳ | Basse |

---

## 3. Spécifications Techniques

- Aucun `template.json` : les types d'Actor/Item sont déclarés uniquement via `system.json.documentTypes` + les classes `TypeDataModel` sous `module/data/`.
- Sheets en `ApplicationV2` (`HandlebarsApplicationMixin(ActorSheetV2 | ItemSheetV2)`), pas de `FormApplication`, pas de jQuery.
- Aucun build JS (ESM natif servi directement par Foundry). Seule exception : un `package.json` de dev, utilisé uniquement pour compiler les compendiums (voir §7).

## 4. Architecture du Système

Voir l'arborescence commentée dans `README.md` (module/config, module/data, module/sheets, module/helpers, templates, styles, lang, packs).

## 5. Fonctionnalités

### 5.1 Implémentées (v0.1.0)
- Actor `personnage` : caractéristiques (Corps/Mental/Dextérité), ~37 compétences en %, PV, points de force, stress, alignement (curseur Obscurité↔Lumière), race/métier appliqués depuis compendium avec bouton "Appliquer".
- Item `race` (modificateurs caractéristiques/compétences, armure naturelle, capacité spéciale), `metier` (prérequis, compétences accordées, équipement de départ, talent signature), `talent` (traits génériques), `arme`, `armure`, `pouvoir` (pouvoir de force), `equipement`.
- Jet de compétence 1d100 (réussite si ≤ total%), avec seuils de réussite/échec critique.
- Application d'un métier : vérifie les prérequis (métier requis + niveau minimum), remplace proprement l'équipement de départ précédent (flag `startingGear`) et les compétences accordées.
- Compendiums : 6 races, 6 métiers, 8 talents, 6 armes, 3 armures (échantillon vérifié, pas encore les listes complètes du matériel source — voir §7.1 et §10).

### 5.2 Roadmap
Voir §10.

## 6. Modèles de Données

Voir les fichiers sous `module/data/` — un fichier par type d'Actor/Item, schéma commenté en tête de chaque `defineSchema()`.

## 7. Compendiums et Contenu

### 7.0 Gestion des compendiums avec `@foundryvtt/foundryvtt-cli`

Le contenu est **auteurisé en JSON lisible** sous `packs/_source/<pack>/<nom>.json` (un fichier par document, versionné/diffable dans git), puis **compilé en LevelDB** (le format que Foundry v11+ charge réellement) sous `packs/<pack>/` :

```powershell
npm install          # une fois, installe @foundryvtt/foundryvtt-cli en devDependency
npm run pack:build    # packs/_source/*  ->  packs/*  (LevelDB)
npm run pack:unpack   # packs/*  ->  packs/_source/*  (pour ré-éditer après une modif faite dans Foundry)
```

❌ Ne jamais éditer les fichiers `packs/<pack>/*.ldb`/`CURRENT`/`LOCK` à la main — toujours passer par `packs/_source/`.

### 7.1 Liste des Compendiums

| Nom | ID | Type | Contenu | Entrées | Statut |
|-----|-----|------|---------|---------|--------|
| Races | `races` | Item | Races jouables | 6 / ~30 | Échantillon, à compléter |
| Métiers | `metiers` | Item | Métiers/carrières | 6 / ~20 | Échantillon, à compléter |
| Talents | `talents` | Item | Traits de background | 8 / ~25 | Échantillon, à compléter |
| Armes | `armes` | Item | Armes | 6 | Échantillon |
| Armures | `armures` | Item | Armures | 3 | Échantillon |

**Note :** le matériel source (`Template corriger.xlsx`) code les modificateurs raciaux/de métier sous forme de formules Excel imbriquées (`IF(A2="Race", valeur, IF(...)))`) parfois incohérentes d'une version à l'autre du classeur (copier-collers, cellules auto-référencées). Les 6 races et 6 métiers ci-dessus ont été vérifiés cellule par cellule (parsing programmatique des formules, pas de recopie à l'œil). Compléter le reste demandera une repasse avec l'auteur du classeur pour lever les ambiguïtés plutôt qu'une transcription automatique risquée.

## 8. Intégration Foundry VTT

Déploiement : copier ce dossier vers `D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\galactic-wars\` puis faire un hard refresh (`Ctrl+Shift+F5`) dans le client Foundry. Une commande dédiée sera ajoutée (voir `.claude/commands/` à la racine de `VTT_Foundry`, sur le modèle de `deploy.md` d'Antique).

## 9. Exigences Non Fonctionnelles

- Compatible Foundry v14 Stable Build 367 sans avertissement de dépréciation en console.
- Toutes les chaînes affichées passent par `lang/fr.json` (clés `GALACTICWARS.*`), jamais de texte en dur dans le code/templates.

## 10. Planification et Roadmap

1. **Phase A (fait, v0.1.0)** : scaffold + fiche classique.
2. **Phase B** : fiche rapide (`personnage-rapide`) — Cap.Cmbt/Cap.Tir/Dextérité/Mentale/Perception/Stress/Aff.Force.
3. **Phase C** : fiche sith (`personnage-sith`) — Physique/Agilité/Perception/Mental, École sith (capacités spéciales nommées), pregens `Prétirer sith/PJ/` en compendium Actor.
4. **Phase D** : PNJ (`pnj`), même bloc de stats que la fiche rapide.
5. Vaisseaux (Actor `vaisseau`), économie.
6. Complétion des compendiums races/métiers/talents/armes/armures à 100% du matériel source.

## 11. Gestion des Versions

Convention : à chaque changement livré, incrémenter `system.json` et ajouter une entrée dans `JOURNAL.md`.

## 12. Maintenance et Support

Le log de développement est tenu dans `JOURNAL.md` (une entrée par session, format `## Session du <date> — <titre> (vX→vY)`).

## 13. Annexes

### Glossaire
- **Métier** : carrière/profession du personnage (prérequis, compétences, équipement, talent signature).
- **Compétence de métier** : compétence marquée `metier: true` dans `module/config.mjs`, malus -30% si non acquise via le métier actuel (contre -10% pour une compétence normale).

### Standards de Codage
Voir README.md.
