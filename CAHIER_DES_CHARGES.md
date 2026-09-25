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
| OBJ-002 | Fiche rapide (short) | ✅ (v0.2.0) | Haute |
| OBJ-003 | Fiche sith (pregens École de sith) | ✅ (v0.5.0), 6/6 pregens PJ transcrits | Moyenne |
| OBJ-004 | PNJ (façon fiche rapide, résolution en d100) | ✅ (v0.4.0) | Moyenne |
| OBJ-005 | Vaisseaux | ✅ (v0.6.0), 1/1 vaisseau du matériel source transcrit | Basse |
| OBJ-006 | Économie | ✅ (v0.7.0), crédits + prix + catalogue échantillon | Basse |

---

## 3. Spécifications Techniques

- Aucun `template.json` : les types d'Actor/Item sont déclarés uniquement via `system.json.documentTypes` + les classes `TypeDataModel` sous `module/data/`.
- Sheets en `ApplicationV2` (`HandlebarsApplicationMixin(ActorSheetV2 | ItemSheetV2)`), pas de `FormApplication`, pas de jQuery.
- Aucun build JS (ESM natif servi directement par Foundry). Seule exception : un `package.json` de dev, utilisé uniquement pour compiler les compendiums (voir §7).

## 4. Architecture du Système

Voir l'arborescence commentée dans `README.md` (module/config, module/data, module/sheets, module/helpers, templates, styles, lang, packs).

## 5. Fonctionnalités

### 5.1 Implémentées (v0.1.0)
- Actor `personnage` : caractéristiques (Corps/Mental/Dextérité), ~37 compétences en %, PV, points de force, stress, race/métier appliqués depuis compendium avec bouton "Appliquer". Voir aussi §5.1octies (v0.9.0) pour la refonte ergonomique (onglets, réserves Lumière/Obscurité, notes) qui a depuis remplacé l'alignement d'origine.
- Item `race` (modificateurs caractéristiques/compétences, armure naturelle, capacité spéciale), `metier` (prérequis, compétences accordées, équipement de départ, talent signature), `talent` (traits génériques), `arme`, `armure`, `pouvoir` (pouvoir de force), `equipement`.
- Jet de compétence 1d100 : réussite si ≤ total % ; réussite critique de 1 à 5 et échec critique de 96 à 100, quelle que soit la cible (règle de l'auteur, 2026-09-24 — auparavant réussite critique ≤ 10 % de la cible).
- Application d'un métier : vérifie les prérequis (métier requis + niveau minimum), remplace proprement l'équipement de départ précédent (flag `startingGear`) et les compétences accordées.
- Compendiums : 6 races, 6 métiers, 8 talents, 6 armes, 3 armures (échantillon vérifié, pas encore les listes complètes du matériel source — voir §7.1 et §10).

### 5.1bis Ajoutées (v0.2.0)
- Actor `personnage-rapide` (fiche "partie rapide") : 8 caractéristiques directes (Force, Cap. Cmbt, Cap. Tir, Dextérité, Mentale, Perception, Stress, Aff.Force), résolues en **1d20 sous la valeur** (pas en %, contrairement à la fiche classique) — total plafonné à 80, avertissement si plus de deux caractéristiques à 16. Survie reste résolue en 1d100 comme sur la fiche classique. Un métier (équipement + description de son talent signature auto-remplie) et un Talent générique séparé (texte libre). Réutilise les mêmes compendiums race/métier que la fiche classique — `applyRace`/`applyMetier` ont été généralisés pour ne toucher `system.competences`/`system.caracteristiques.*.racial` que sur un Actor `personnage` (la fiche rapide n'a pas cette structure).
- **Attention pour la suite (PNJ, phase D)** : le PNJ réutilisera le même bloc de 8 caractéristiques que la fiche rapide, mais résolu en **1d100** (comme la fiche classique), pas en d20 — les deux Actor types partageant les mêmes champs auront donc des mécaniques de jet différentes. Prévoir un `rollCaracteristiquePourcentage` dédié plutôt que de réutiliser `rollCaracteristiqueD20`.

### 5.1ter Ajoutées (v0.3.0)
- Actor `personnage-sith` (fiche "sith prétirée") : 4 caractéristiques (Physique, Agilité, Perception, Mental) + 7 compétences de force fixes (Télékinésie, Poussée de force, Défense, Illusion, Persuasion, Combat armé, Furtivité), **résolues en 1d20 + valeur contre un DC fixé par le MJ** (troisième mécanique de jet du système, différente à la fois du % de la classique et du "d20 sous la valeur" de la fiche rapide — le système ne détermine pas lui-même la réussite ici, pas de DC stocké sur la fiche). Corpulence (Maigrichon/Normal/Épais/Fort) dérive le PV max (11/13/15/17). École sith (Assassin/Sorcière/Guerrier/Inquisiteur/Héraut/Magicien/Maître d'armes/Bulldozer) avec 2 capacités spéciales nommées chacune + équipement/vaisseau de départ, appliquée depuis un nouveau compendium `ecoles` (8/8, complet — c'est une liste fermée contrairement aux races/métiers). Race réutilisée (nom seul, comme sur la fiche rapide — les modificateurs raciaux restent spécifiques au référentiel classique).
- Item `ecole` (capacités nommées + équipement de départ).

### 5.1quinquies Ajoutées (v0.5.0)
- Compendium Actor `pregens-sith` (6/6) : les 6 seigneurs sith prétirés de `Prétirer sith/PJ/` (Kris, Mer Naga, Quenor, Samash, Davos, Sinar), prêts à jouer, école liée au compendium `ecoles`.
- Ajout d'une 8ᵉ compétence de force `eclairDeForce` au DataModel `personnage-sith` (absente du classeur vierge mais présente et non nulle sur les 6 pregens — voir `JOURNAL.md`).

### 5.1sexies Ajoutées (v0.6.0)
- Actor `vaisseau` : classe, taille, coque (PV), bouclier (points/réduction/actif), moteur (déplacement), armement et équipage (listes de taille variable, seul endroit du système avec ajout/retrait dynamique dans la sheet), soute, équipements embarqués. Pas de mécanique de jet/combat spatial automatisée — aucune règle de ce type dans le matériel source, géré narrativement par le MJ comme les armes de personnage.
- Compendium Actor `vaisseaux` (1/1) : le destroyer sith *Convergence* (`Vaiseau destroyer sith.docx`), seul vaisseau détaillé du matériel source, transcrit intégralement (équipage nommé, armement, bouclier, équipements embarqués).

### 5.1septies Ajoutées (v0.7.0)
- `credits` sur les 4 fiches de personnage, `prix` sur les Item achetables (arme/armure/équipement) et sur l'Actor `vaisseau`.
- Nouveau compendium Item `equipements` (11/11, échantillon) et +4 armes (échantillon), transcrits depuis `[GW] Science économique.xlsx`.
- Compendium `vaisseaux` complété à 13/13 (12 nouveaux vaisseaux/véhicules du même classeur, en plus de la Convergence) — bouclier/PV/salles manquants dans la source complétés par estimation calibrée quand absents, systématiquement signalés comme tels sur la fiche concernée.

### 5.1quater Ajoutées (v0.4.0)
- Actor `pnj` : **réutilise intégralement le DataModel `PersonnageRapideData`** de la fiche rapide (même schéma exact — 8 caractéristiques, Survie, métier, talent, équipement) plutôt que de dupliquer une classe quasi-identique. Seule différence : résolu en **1d100** (`rollCaracteristiquePourcentage`, nouveau helper) au lieu du 1d20-sous-la-valeur de la fiche rapide — la fiche/sheet détecte `actor.type === "pnj"` pour choisir la bonne mécanique de jet. Réutilise aussi la même sheet (`PersonnageRapideSheet`) et le même template, avec les avertissements de plafond de création de PJ (max 80, pas plus de deux à 16) masqués sur cette variante puisqu'ils n'ont pas de sens pour un stat-block de PNJ créé par le MJ.
- Aucun contenu de compendium PNJ pré-rempli pour l'instant (pas de stat-blocks de monstres/PNJ types extraits du matériel source dans cette session).

### 5.1octies Ajoutées (v0.9.0)
- Fiche classique (`personnage`) uniquement — refonte ergonomique issue de la maquette canvas de la session précédente (voir `JOURNAL.md`). Les 3 autres fiches (rapide/PNJ, sith, vaisseau) n'ont pas été touchées.
- Onglets (`Personnage` / `Équipements` / `Informations`) : Caractéristiques/Ressources/Compétences/Pouvoirs dans le premier, Armes/Armures/Équipement dans le second, notes façon journal dans le troisième. Onglet actif géré côté sheet (propriété privée d'instance, pas persisté sur l'Actor).
- `system.alignement` (curseur -100..100) remplacé par deux réserves indépendantes `system.lumiere`/`system.obscurite` (0 à 10 chacune, ajustées manuellement via +/-, pas de recharge automatique). Sur un jet de compétence, le joueur peut dépenser exactement 1 point (Lumière **ou** Obscurité, jamais les deux) pour +15% sur ce jet (`GW.bonusAlignement`) — choix fait via un groupe de radios éphémère (non persisté), consommé et remis à zéro après chaque jet avec dépense. La validation d'une difficulté exprimée en paliers par le point dépensé reste manuelle (MJ), pas automatisée dans cette itération.
- `system.sensibleForce` (booléen) : la section Pouvoirs de force n'affiche sa liste (et le bouton d'ajout) que si cette case est cochée — évite d'afficher une section vide à tous les personnages non sensibles à la Force.
- `system.biographie` (HTMLField unique) remplacé par `system.notes` (tableau de `{titre, contenu}`, ajout/retrait dynamique — même pattern que l'armement du vaisseau, voir §5.1sexies).
- Niveau de compétence (0-3) mis en valeur visuellement (input encadré/coloré) dans chaque ligne de la liste des ~37 compétences, à la demande de l'utilisateur (champ très utilisé en jeu).

### 5.1nonies Ajoutées (v0.10.0)
- **Bug critique corrigé (voir §10 item 13)** : les 5 templates de fiche (`personnage`, `personnage-rapide`, `personnage-sith`, `vaisseau`, item générique) commençaient chacun par leur propre balise `<form>`, imbriquée dans le `<form>` que `DocumentSheetV2` fournit déjà comme élément racine — tous les champs se retrouvaient donc portés par ce `<form>` interne plutôt que par le vrai, et `FormDataExtended(this.element)` ne voyait aucun champ (payload d'update réduit à `{type: "personnage"}`). Remplacé par un simple `<div>` (un seul élément racine reste requis par `PARTS`). Confirmé en direct : la sauvegarde automatique (`submitOnChange`) fonctionne désormais sur les 5 fiches.
- **Deuxième bug découvert en corrigeant le premier, corrigé aussi** : `system.competences` est un `ArrayField` — `Document#update()` remplace chaque élément entier plutôt que de fusionner ses champs un par un. Comme `cle`/`racial`/`metier`/`acquiseParMetier` n'avaient pas d'`<input>` dans le formulaire (seuls `niveau`/`ajustement` en avaient), *tout* changement sur la fiche classique réinitialisait ces 4 champs à leur valeur par défaut du schéma sur les 37 compétences (`cle: ""` notamment, ce qui casse `GW.competences[cle]` partout : labels, regroupement par caractéristique, malus). Corrigé en ajoutant des `<input type="hidden">` (avec `data-dtype` correct) pour ces 4 champs sur chaque ligne de compétence.
- Boutons "Appliquer" (race/métier/école) remplacés par "Choisir" : ils n'avaient en réalité aucun moyen de renseigner `system.race.uuid`/`system.metier.uuid`/`system.ecole.uuid` (seul un glisser-déposer depuis la sidebar l'aurait permis, jamais implémenté — confirmé par le fait que même le personnage de test avait un nom de race/métier renseigné mais un `uuid` vide). Nouveau helper `module/helpers/compendium-picker.mjs::choisirItemCompendium(packName)` : ouvre une liste (triée alphabétiquement) des entrées du compendium demandé via `DialogV2`, et applique directement le choix (`applyRace`/`applyMetier`/`applyEcole`, logique de gating des compétences par métier déjà existante et inchangée — un métier marque `acquiseParMetier: true` + bonus sur les compétences qu'il accorde, les autres restent au malus `-30%`/`-10%`).

### 5.1decies Ajoutées (v0.10.1)
- Les 43 items du compendium Races utilisent désormais leur portrait (`asset_visuel/Ethnie/`) comme `img` au lieu du placeholder `icons/svg/oak.svg`. Correspondance race → portrait reprise de celle du journal "Codex des espèces" (y compris les alias Devaronian, Tusken Raider et Robot → droïde de combat).

### 5.1undecies Ajoutées (v0.10.2 → publiées en v0.11.0)
- Un `personnage` fraîchement créé a immédiatement ses 37 compétences (`_preCreate` du DataModel) au lieu d'attendre le rechargement du monde par un MJ. Les compétences déjà fournies à la création (import de compendium, duplication) sont conservées, seules les clés manquantes sont ajoutées.
- Taux de compétence (fiche classique) : la valeur finale de la caractéristique liée est un **plancher**. Total = caractéristique + max(0, barème du niveau + racial + métier + ajustement + malus de non-acquisition). Avant, le malus -10 %/-30 % pouvait faire descendre le total sous la caractéristique (ex. Corps 20 → Canon lourd 0 %), ce qui donnait l'impression que Corps n'était pas pris en compte.

### 5.1duodecies Ajoutées (v0.11.0)
- **Mode édition** (fiche classique) : bouton « Édition » (cadenas) à côté du nom. Verrouillé, les caractéristiques de base et les niveaux de compétence s'affichent en lecture seule, les ajustements manuels sont masqués et les boutons « Choisir » race/métier aussi (niveau et ajustement restent soumis en champs cachés : `ArrayField`) ; déverrouillé, tout redevient modifiable. État d'affichage de la fiche (comme l'onglet actif), rien n'est écrit sur l'Actor. Ouvert d'office sur un personnage vierge (ni race, ni métier, caractéristiques à 0), verrouillé sinon.
- Largeur par défaut de la fiche classique portée de 720 à 940 px : les 3 colonnes de compétences ne tiennent sans défilement horizontal qu'à partir de ~920 px (libellés longs non sécables).

- **Compétences réservées** (règle issue de la mise en forme conditionnelle des fiches Excel classiques, validée par l'auteur le 2026-09-23) : Drain de force, Éclair de force, Contrôle par la force, Pickpocket, Sécurité, Médecine, Appel à la rage et Méditation de la force (`reservee: true` dans `GW.competences`) sont bloquées tant que le métier actuel ne les accorde pas : grisées, niveau compté 0 (le niveau enregistré est conservé), jet impossible, info-bulle joueur « Seul le MJ peut débloquer la compétence. ». Le MJ peut les débloquer / rebloquer pour un personnage par clic droit (champ `debloquee`, conservé si le métier change ; le malus de non-acquisition reste appliqué). Métiers autorisés = ceux du compendium qui accordent la compétence, complété pour suivre l'Excel : Drain et Éclair de force ajoutés à Guerrier sith et Jedi Noire, Sécurité ajoutée à Voleur, Appel à la rage réservée à Apprenti sith, Guerrier sith et Jedi Noire (ajoutée aux deux derniers — demande de l'auteur, hors Excel), Méditation de la force réservée à Jedi consulaire, Jedi Noire et Padawan (ajoutée aux trois — aucun métier ne l'accordait) (Médecin + Soldat médecin et Agent secret déjà présents). Les compétences accordées par le métier actuel sont désormais surlignées (équivalent du jaune des fiches Excel).

- **Point orange = compétence recommandée par le métier actuel** (selon les documents sources, champ `obligatoire` des compétences d'un métier), et non plus un type de compétence fixe (`metier: true` de `GW.competences`, qui ne suivait pas le changement de métier). Nouveau champ `recommandee` sur chaque compétence, renseigné par `applyMetier` et recalculé par la migration pour les personnages existants. Les accès ajoutés pour les compétences réservées (`obligatoire: false`) ne portent pas de point.

- **Validation des 120 points de caractéristique** (mode édition, non bloquante comme la case B4 de l'Excel) : somme des seules bases saisies (hors bonus raciaux) affichée `X / 120`, jaune en dessous, vert à l'égalité, rouge au-dessus (`GW.pointsCaracteristiques`). La saisie n'est jamais refusée.

- **Ressources dans l'en-tête** (fiche classique) : PV, Points de force, Stress et Crédits sont remontés de la section Ressources vers l'en-tête, visibles quel que soit l'onglet. La section Ressources ne garde que Lumière/Obscurité.
- **Plus aucun prérequis de métier** : `applyMetier` ne vérifie plus le métier requis ni le niveau minimum (ex. Jedi consulaire ← Padawan niveau 4) ; tout métier est accessible directement. Les prérequis restent renseignés sur les Items métier à titre informatif.

- **Compétences recommandées alignées sur `Metier.docx` (V2.6)** : 15 métiers sur 20 concordaient déjà ; corrigés (validé par l'auteur) : Jedi consulaire (+ Sagesse), Padawan (+ Sagesse, − Bagarre), Pilote (+ Blaster, Mécanique, Informatique/piratage, Bagarre, Perception), Chasseur de primes (+ Escroquerie/mensonge, Social, Sang froid, Mécanique, Pilotage ; − Perception, Furtivité), Voleur (+ Informatique/piratage, Sang froid, Sécurité recommandée ; − Escroquerie/mensonge). « Arme contondante (et blanche) », citée par 8 métiers : compétence `armeBlanche` ajoutée le 2026-09-24 (v0.13.0), accordée par ces 8 métiers.

- **Point violet = compétence liée à la Force**, désormais affiché sur chaque ligne (seule la légende le montrait, les lignes n'avaient qu'un libellé coloré). Liste fixée par l'auteur (`force: true`, 11 compétences) : Appel à la rage, Méditation de la force, Poussée de la force, Drain de force, Persuasion de la force, Contrôle par la force, Contrôle télékinétique, Éclair de force, Protection de la force, Sabre laser, Spiritisme (Sabre laser, Spiritisme et Appel à la rage n'étaient pas marquées jusqu'ici).

- **Compétences Jedi réservées** (demande de l'auteur) : Poussée de la force, Persuasion de la force, Contrôle télékinétique et Sabre laser rejoignent Méditation de la force parmi les compétences réservées — accessibles uniquement à Padawan, Jedi consulaire et Jedi Noire (accès ajoutés sans point jaune : Poussée pour Padawan et Jedi Noire, Persuasion pour Padawan), Sabre laser restant aussi accessible à Apprenti sith et Guerrier sith (recommandée par `Metier.docx`). Côté sith (demande suivante de l'auteur) : Poussée, Drain, Persuasion, Contrôle par la force, Éclair de force et Sabre laser accessibles à Apprenti sith, Guerrier sith et Jedi Noire (accès ajoutés sans point jaune) — les accès Jedi ci-dessus sont conservés. Total : 12 compétences réservées.

### 5.1terdecies Ajoutées (v0.11.1)
- **Barre de PV** dans la carte PV de l'en-tête : remplissage PV/PV max, vert > 50 %, orange 25–50 %, rouge < 25 %.
- **Stress retiré de la fiche classique** (en attendant un futur système d'états actifs) : carte supprimée de l'en-tête, `system.stress` conservé dans le schéma. Le Stress de la fiche rapide (caractéristique de jet) n'est pas concerné.
- **Points de force = ressource dépensable** : une seule valeur sur la fiche classique (plus de « / max »), comme les crédits. `pointsDeForce.max` reste dans le schéma (inutilisé) pour éviter une migration de données.

- **Retouches de la fiche classique (todo auteur, lot 1)** : compétences grisées masquées hors mode édition (masquage CSS, champs toujours soumis) ; case « Sensible à la Force » seulement en édition, section Pouvoirs masquée hors édition si non sensible ; PV, Points de force et Crédits colorés (corail / violet / or) ; titres de colonnes Niv. / Ajust. (édition) / Total ; total des caractéristiques en grand (base et bonus racial en petit) ; bouton dé supprimé, clic gauche sur le nom de la compétence = jet ; légende renommée « compétence liée à la Force » ; bouton Repos (lit) sur la carte PV qui remet les PV au maximum.

### 5.1quaterdecies Ajoutées (v0.12.0)
- **Onglet Informations = ethnie** (fiche classique) : portrait, description (compétences spéciales), modificateurs de caractéristiques et de compétences et armure naturelle de l'Item race lié, en lecture seule. Message d'aide si aucune ethnie ou ethnie non liée au compendium.
- **Description du personnage** en tête de l'onglet Informations : âge, taille, sexe, cheveux, peau, yeux (`system.infos`) + texte libre (`system.description`).
- **Nouvel onglet Notes**, 4 sous-onglets : **Résumés** (plusieurs, titre + description + date automatique à la création et à chaque modification, du plus récent au plus ancien, `system.resumes` ; l'ancien résumé unique `system.resume` est repris par la migration), **Infos** (titre, contenu riche, mots-clés — reprend `system.notes`, notes existantes conservées), **PNJ** (nom, sous-titre, image, description, statut allié / neutre / suspect / hostile en couleur, `system.pnjs`), **Missions** (titre, description, importance principale / secondaire, statut à faire / en cours / en manque d'info / terminée / ratée, `system.missions`). Listes affichées en cartes ; création et modification dans une fenêtre modale (`helpers/notes.mjs`), suppression avec confirmation. Les listes ne passent jamais par le formulaire de la fiche (remplacement du tableau complet uniquement).

### 5.1quindecies Ajoutées (v0.12.1 → v0.13.2, session du 2026-09-24)
- **Diffusion** : dépôt public, installation par le manifeste `https://github.com/SotarS21/jdr_gw/releases/latest/download/system.json`. Au premier chargement après une mise à jour, le MJ voit les **notes de version** (`helpers/release-notes.mjs`) puis une fenêtre de **mises à jour de contenu** à cocher (`helpers/pack-updates.mjs`, `apps/pack-update-picker.mjs`) : les compendiums du système suivent tout seuls, les correctifs visent les **copies** dans le monde (objets, personnages, tokens) par champs ciblés.
- **Fiche classique** : box Crédits (chiffres groupés, retour à la ligne, police réduite) ; jauge Lumière / Obscurité bleu ↔ rouge ; tableau **Traits** (talents portés) dans Informations, masqué sans trait hors édition ; images affichées entières ; **compétences favorites** (étoile, panneau Favoris) ; bouton **Gain d'XP** (+5 % sur une compétence, plafond) ; plafond des compétences à **90 %** (dépassable par le bonus d'ethnie) avec ajustement grisé au plafond.
- **Objets refondus** (v0.13.0) : fiches arme / armure-bouclier / équipement (porté / rangé, compétence liée et taux du porteur, Attaquer / Dégâts, tags dont **Caché**, notes MJ) ; boucliers = armures d'emplacement « bouclier » ; inventaire (badges, rangé grisé, réduction totale portée, attaque rapide, clic = carte de tchat, clic droit = menu, crayon en mode édition) ; cartes d'objet dans le tchat (objet caché en murmure) ; tout objet **rangé par défaut**.
- **Compétence « Arme contondante/blanche »** (`armeBlanche`, Corps, −10 % hors métier), accordée par les 8 métiers de `Metier.docx` ; libellé « Blaster/Lancer ». 38 compétences ; les fiches existantes sont complétées à chaque chargement MJ (acteurs, tokens non liés, compendiums du monde) et par la macro `game.galacticWars.completerCompetences()`.
- **Règle de jet en %** : 1-5 réussite critique, ≤ taux réussite, > taux échec, 96-100 échec critique, quel que soit le taux.
- **Datapad** : champ « Appareil » des équipements (datapad, comlink) ; onglet **Holonet** = navigateur sur les Infos du porteur (onglet Notes), synchronisé, avec création / modification / suppression.
- **Image unique par acteur** : portrait de la fiche = image de l'acteur = image du token (tokens posés compris).
- **Visuels des objets** : `asset_visuel/objets/` (repris de `asset_visuel/item/`) pour les armes, armures et équipements des compendiums, datapads et comlinks.
- **Données corrigées** : 4 armes du compendium au type invalide « armé » (Lance-roquette, Grenade, Grenade militaire, Trident sith) ; compétence liée choisie par l'auteur en v0.13.3 : Canon lourd, Artifice, Artifice, Arme contondante/blanche.

### 5.1sexdecies Ajoutées (v0.13.3, session du 2026-09-25)
- **Compétences liées** du Lance-roquette (Canon lourd), des Grenades (Artifice) et du Trident sith (Arme contondante/blanche) ; correctif MJ `0.13.3-competences-armes` pour les copies sans compétence.
- **Plafond de 90 %** : l'ajustement reste modifiable à la baisse (attribut `max` + hausse refusée dans `_processFormData` de la fiche classique).

### 5.1septdecies Ajoutées (v0.14.0, session du 2026-09-25)
- **Onglet Combat** (fiche classique) : armes portées (Attaquer / Dégâts), protection portée + armure naturelle de l'ethnie (`GalacticWarsActor#reductionDegats`), compétences de combat (`GW.competencesCombat`, non bloquées), compétences liées à la Force accessibles si sensible à la Force, bouton Initiative.
- **Initiative** : `CONFIG.Combat.initiative` = 1d20 (`GW.formuleInitiative`), toutes fiches.
- **Attaque → défense** (`helpers/combat.mjs`) : attaque réussie sur des tokens ciblés → carte « Défense » ; la cible (propriétaire ou MJ) tente Parade/esquive ou Protection de la Force (toujours les deux, la seconde grisée si non accessible) ; verdict : critique > simple, puis marge (taux − dé), égalité = défense. Mêlée / distance d'après la compétence de l'arme (`GW.competencesDistance` : blaster, canonLourd, artifice), affiché seulement.
- **Dégâts** : bouton MJ « Appliquer les dégâts » sur le jet de dégâts d'une arme → tokens sélectionnés, sinon cibles de l'attaquant ; dégâts − réduction, PV ≥ 0 (`GW.cheminPV` : fiche classique et sith ; PNJ rapide et vaisseau sans PV → avertissement).
- **v0.14.1** : équipement de départ des métiers typé (`helpers/objets-depart.mjs`, table de correspondances ligne → arme / armure du compendium, dés et bonus de la ligne prioritaires) ; correctifs MJ `0.14.1-armes-depart` (tokens non liés : objet hérité de la base mis à jour, pas dupliqué) et `0.14.1-visuels-par-nom` ; image cliquable sur la fiche d'objet générique.
- **v0.14.2** : catalogue « [GW] Science économique.xlsx » transcrit (70 armes / améliorations, 3 équipements ; véhicules et vaisseaux déjà présents dans le compendium Vaisseaux) ; chaque objet cite sa ligne du classeur en description ; améliorations = objets distincts « <arme> (amélioration N) » ; doublons du classeur (Lance-flamme l. 49-50, Hache électrique l. 40) transcrits une fois ; correctif MJ `0.14.2-prix-catalogue`.

### 5.1octodecies Ajoutées (v0.15.0, session du 2026-09-25)
- **Comlink** : `system.comlink` des équipements (`messagerie`, `canaux[]` : numéro unique, contact, actif, archivé, `messages[]` : auteur pj / mj, nom, texte, vu), onglet de la fiche d'objet (`templates/item/partiels/comlink.hbs`, logique `helpers/comlink.mjs`, tableau toujours réécrit en entier). Messagerie = « comlink ++ » (option on / off) ; historique complet, zone ≈ 10 messages défilante ; alertes chuchotées avec bouton d'ouverture ; correctif MJ `0.15.0-appareil-comlink`.
- **État Inconscient** : `GalacticWarsActor#synchroniserInconscient` (statut core `unconscious`, `GW.etatInconscient`) appelé après toute modification des PV (`_onUpdate`, client auteur) et par `encaisserDegats` ; actif à 0 PV, retiré dès 1 PV ; correctif MJ `0.15.0-etat-inconscient`.
- **PV des fiches rapide / PNJ** : `system.pv.value / max` (10 / 10 par défaut), `GW.cheminPV` étendu — dégâts et soins s'y appliquent.
- **v0.15.1** : Comlink — `montrerConversation` (bouton dans l'en-tête de la conversation) poste le fil du canal dans le tchat, visibilité comme « Montrer dans le tchat » d'un objet (tag Caché = chuchoté).
- **v0.15.2** : contacts de départ → PNJ des Notes (`estContactDeDepart` / `pnjDeDepart`, champ `pnjs[].origineMetier` : contact intact remplacé au changement de métier, contact édité par le joueur conservé) ; correctif MJ `0.15.2-contacts-en-pnj`.
- **v0.15.3** : clic / Entrée sur une ligne Datapad ou Comlink → onglet Holonet / Comlink (`PersonnageSheet#activerObjet`) ; onglet Comlink = retour à la liste ; niveau du personnage en lecture seule hors Édition ; « Gain de niveau » (Édition : +1 niveau sur `GW.competencesParNiveau` = 3 compétences distinctes, max `GW.niveauMaxCompetence` = 3, niveau du personnage +1 si `GW.gainNiveauPersonnage`) ; « Gain d'XP » affiché en Édition seulement.
- **v0.15.4** : gain de niveau = `GW.competencesParNiveau` niveaux à répartir (répétition permise jusqu'à `GW.niveauMaxCompetence`), aperçu `PersonnageSheet#tauxPourNiveau` (même règle que la préparation : caractéristique plancher, malus hors métier) ; ligne d'inventaire : Porté / Rangé à droite, plus d'attaque rapide ni de boutons Comlink / Holonet.
- **v0.15.5** : Lumière / Obscurité — règle de l'auteur : un point s'utilise **avant** l'action et devient un niveau virtuel sur la compétence le temps de l'action (le MJ l'applique ; pas de mécanique automatique). `GalacticWarsActor#utiliserReserve` (−1 point + message dans le tchat), boutons dans les onglets Personnage et Combat ; bonus automatique de +15 % (`pool` des jets, pastilles, radios) retiré de la fiche et des attaques.
- **v0.15.6** : taux d'une compétence = caractéristique + barème du niveau + max(0, racial + métier + ajustement + malus hors métier), plafonné (règle corrigée par l'auteur, 2026-09-26 : le niveau n'est plus absorbé par le malus).

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
| Races | `races` | Item | Races jouables | 43 / 43 | Complet (tout `Race galactique world.pdf`) |
| Métiers | `metiers` | Item | Métiers/carrières | 20 / 26 | 20/20 avec liste de compétences source ; 6 métiers restants (Artiste acrobate, Archéo-archiviste, Cuisinier, Journaliste, Marchand, Sénateur) n'ont qu'un talent+équipement dans le matériel source, pas de compétences — non transcrits |
| Talents | `talents` | Item | Traits de background | 8 / ? | Échantillon — **source introuvable dans le matériel du projet**, total réel inconnu, à demander à l'auteur |
| Armes | `armes` | Item | Armes | 10 | Échantillon |
| Armures | `armures` | Item | Armures | 3 | Échantillon |
| Écoles sith | `ecoles` | Item | Écoles de la voie sith | 8 / 8 | Complet (liste fermée) |
| Pregens sith | `pregens-sith` | Actor | Seigneurs sith prétirés (PJ) | 6 / 6 | Complet (liste fermée) |
| Vaisseaux | `vaisseaux` | Actor | Vaisseaux/véhicules nommés | 13 / 13 | Complet (tout le matériel source vaisseaux) |
| Équipements | `equipements` | Item | Outils/consommables du catalogue économique | 11 / ~15 | Échantillon, à compléter |

**Note (historique, session 1) :** la mise en garde initiale sur des "formules Excel imbriquées incohérentes" (`Template corriger.xlsx`) s'est révélée concerner surtout les **métiers**, pas les races. Les races viennent en réalité de `Race galactique world.pdf`, un texte en prose avec un bloc "Bonus :" explicite par race (aucune ambiguïté) — complété à 100% en session du 2026-09-10 sans repasse nécessaire avec l'auteur. Les métiers viennent de deux documents à croiser (`Metier v2.5.docx` pour prérequis/compétences/équipement, `archétype_metier_galactic_wars.docx` pour le talent signature) — complétés à 20/20 pour les métiers présents dans les deux sources ; 6 métiers restants n'ont qu'une des deux moitiés de données dans le matériel source (voir §7.1) et n'ont volontairement pas été inventés.

**Lacune de schéma découverte (session du 2026-09-10) :** `GW.competences` (37 clés, fiche classique) ne contient aucune compétence d'arme de mêlée/blanche, alors que plusieurs races/métiers du matériel source lui donnent un bonus. Les bonus concernés ont été mis en prose dans le champ `description` de la race/du métier concerné plutôt que perdus ou inventés sous une fausse clé — à trancher avec l'auteur (ajouter une clé de compétence dédiée, ou l'ignorer délibérément).

**Bug d'extraction corrigé en session 2026-09-10 :** les scripts Node ad hoc utilisés pour dézipper/lire les .xlsx sources avaient une regex bugguée qui laissait les cellules Excel auto-fermantes (`<c r="X"/>`, vides) faire "sauter" la capture jusqu'à un `</c>` distant appartenant à une autre cellule, mélangeant les libellés. Vérifié après coup : les données déjà livrées (6 races, fiche short) n'étaient PAS affectées (les cellules de formules/valeurs réellement utilisées n'étaient jamais auto-fermantes), mais toute nouvelle lecture d'un classeur source doit utiliser un extracteur qui traite `<c .../>` en premier (voir la leçon dans `JOURNAL.md`, session du 2026-09-10).

## 8. Intégration Foundry VTT

Déploiement : copier ce dossier vers `D:\AppDataFoundry$\FoundryVTT_Data\Data\systems\galactic-wars\` puis faire un hard refresh (`Ctrl+Shift+F5`) dans le client Foundry. Une commande dédiée sera ajoutée (voir `.claude/commands/` à la racine de `VTT_Foundry`, sur le modèle de `deploy.md` d'Antique).

## 9. Exigences Non Fonctionnelles

- Compatible Foundry v14 Stable Build 367 sans avertissement de dépréciation en console.
- Toutes les chaînes affichées passent par `lang/fr.json` (clés `GALACTICWARS.*`), jamais de texte en dur dans le code/templates.

## 10. Planification et Roadmap

1. **Phase A (fait, v0.1.0)** : scaffold + fiche classique.
2. **Phase B (fait, v0.2.0)** : fiche rapide (`personnage-rapide`) — Cap.Cmbt/Cap.Tir/Dextérité/Mentale/Perception/Stress/Aff.Force, résolution 1d20 sous la valeur.
3. **Phase C (fait, v0.3.0)** : fiche sith (`personnage-sith`) — Physique/Agilité/Perception/Mental + 7 compétences de force, résolution 1d20 + valeur (DC du MJ), École sith (8/8, capacités spéciales nommées). Reste à faire : transcrire les pregens `Prétirer sith/PJ/` en compendium Actor.
4. **Phase D (fait, v0.4.0)** : PNJ (`pnj`), même bloc de stats/DataModel que la fiche rapide, résolu en 1d100 via `rollCaracteristiquePourcentage`.
5. **Phase E (fait, v0.5.0)** : pregens sith (`pregens-sith`, 6/6, `Prétirer sith/PJ/`).
6. **Phase F (fait, v0.6.0 → complétée en v0.7.0)** : vaisseaux (Actor `vaisseau`, compendium `vaisseaux` 13/13 — la *Convergence* puis les 12 véhicules du classeur économique).
7. **Phase G (fait, v0.7.0)** : économie — `credits` (4 fiches de personnage), `prix` (armes/armures/équipements/vaisseaux), compendium `equipements` (11/11 échantillon).
8. **Phase H (fait, v0.8.0)** : compendiums `races` (43/43, complet) et `metiers` (20/26, complet pour les métiers ayant une source de compétences) complétés.
9. Reste : talents génériques (source à identifier avec l'auteur) ; 6 métiers sans compétences sourcées ; reste du catalogue économique (armes/armures/équipements, ~40 lignes) ; contenu PNJ type (monstres/gardes/etc.) ; ~~décision sur la compétence d'arme de mêlée manquante~~ (soldée v0.13.0 : `armeBlanche`, Corps, −10 % hors métier).
10. **Phase I (fait, v0.9.0)** : refonte ergonomique de la fiche classique uniquement (onglets, réserves
    Lumière/Obscurité, notes, visibilité conditionnelle des Pouvoirs) — voir §5.1octies. Les 3 autres
    fiches (rapide/PNJ, sith, vaisseau) n'ont pas encore reçu la même refonte ; la maquette canvas
    d'origine (https://claude.ai/code/artifact/9c1c44e9-177b-4fd5-bf38-f2e23d0852b7) couvrait aussi
    ces 3 fiches et reste utilisable comme référence si l'auteur veut les traiter plus tard.
11. **Bug corrigé (2026-09-14, commité `c17866a`)** : `_prepareContext` de `personnage-rapide-sheet.mjs`,
    `personnage-sith-sheet.mjs` et `vaisseau-sheet.mjs` ne posait jamais `context.actor` (même bug que
    `personnage-sheet.mjs`, corrigé en v0.9.0) — champ Nom vide corrigé sur les 4 fiches désormais.
12. **Fait (2026-09-14, v0.10.0)** : 3 colonnes de compétences Corps/Mental/Dextérité restaurées sur
    la fiche classique (mapping retrouvé dans `Template corriger.xlsx`), et bonus de caractéristique
    ajouté à la formule du taux de compétence (+ champ `ajustement` manuel pour les level-up).
13. **✅ Résolu (2026-09-15, v0.10.0)** : le bug de sauvegarde ouvert le 2026-09-14 (payload
    `{"type":"personnage"}` au lieu des champs modifiés) venait d'un `<form>` imbriqué dans chacun
    des 5 templates (voir §5.1nonies) — pas du `submitOnChange` lui-même, qui était la bonne piste
    mais pas la cause racine. En creusant le correctif, un deuxième bug lié (`ArrayField` réinitialisant
    `cle`/`racial`/`metier`/`acquiseParMetier` de `system.competences` à chaque sauvegarde) a aussi été
    trouvé et corrigé — voir §5.1nonies pour le détail des deux. Confirmé en direct (Playwright, monde
    `Galacit wars V final`) : sauvegarde automatique fonctionnelle sur les 5 fiches, `cle` préservé.
14. **Fait (v0.10.0)** : picker de compendium pour race/métier/école (§5.1nonies) — les boutons
    "Appliquer" ne servaient en réalité à rien tant qu'aucun glisser-déposer (jamais implémenté)
    n'avait renseigné l'UUID cible ; remplacés par "Choisir", qui ouvre une liste du compendium
    correspondant et applique le choix immédiatement.
15. **✅ Résolu (2026-09-23, v0.10.2)** : `PersonnageData._preCreate` remplit désormais les 37
    compétences à la création (helper `completerCompetences` partagé avec la migration, qui reste en
    place pour les compétences ajoutées plus tard à `GW.competences`). Historique du point : en diagnostiquant le bug ArrayField ci-dessus, un test live a
    déclenché la migration idempotente (`runMigrations`, voir `module/helpers/migration.mjs`) sur 3
    Actors (`Test_robin`, `test_fab`, `test_raton`) qui n'avaient encore jamais reçu leurs 37 clés de
    compétence — c'était leur toute première connexion GM depuis leur création, pas une perte de
    données (confirmé avec l'auteur). Cela reste un gap UX réel : un `personnage` fraîchement créé n'a
    aucune compétence tant qu'un client GM ne recharge pas le monde. À envisager : seeder
    `system.competences` à la création de l'Actor (`_preCreate`) plutôt que de compter sur la migration
    au chargement du monde.

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
