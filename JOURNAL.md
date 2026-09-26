# Journal de développement — Galactic Wars

## À faire à la reprise (état au 2026-09-26, fin de session — « on reprendra la suite plus tard »)

- **État** : tout est poussé ; **v0.16.1 = dernière release** (4 nouveaux vaisseaux, images du Frelon, de la
  Convergence et du Gunboat), après la v0.16.0 (refonte de la fiche de vaisseau, mode Édition, armement en objets
  « arme », équipage par glisser-déposer, aménagements décrits). Foundry local tourne en 0.16.1. Seuls fichiers non
  suivis (voulu) : `asset_visuel/{Personnage,item,lieux,vaiseau}`.
- **Monde de test** : deux correctifs MJ en attente, à laisser accepter par l'auteur à sa connexion —
  `0.16.0-armement-en-objets` (le Barloz, 2 armes à l'ancien format) et `0.16.1-images-vaisseaux` (copies de même nom).
- **Todo restante** :
  - Images des vaisseaux : restent sans image Barloz, Barmaid Betty, Lantallian, Dynamic 20 et Land speeder (rien
    d'adapté dans `asset_visuel/vaiseau/` ; attendre des images de l'auteur).
  - **Fiche de personnage WOLF** (tableur de l'auteur, https://docs.google.com/spreadsheets/d/1w5r84L8HT_6WWQ2diVqvG5HM5YRCGroU24iRukmWinI/) :
    robot « I.A.F PTR-85j / WOLF », niveau 7, caractéristiques, compétences, passifs / actifs, équipement, 8 714 c,
    notes sur ses PNJ. **Choix de l'auteur : juste noter** pour l'instant (rien à faire).
  - **Suivi de l'auteur** (tableur https://docs.google.com/spreadsheets/d/1znh5uDSFQPvQjuDRWs7nIHRQDTmR3EqXHkBvLAfjPyQ/, 25 points,
    tous « Pas commencé », à traiter ensuite) :
    1. ~~[Bug] Métier « Guerrier jedi »~~ : fait et validé (v0.18.2).
    2. [Bug] Les objets d'équipement ne sont pas mis à jour.
    3. [Bug] Comlink : les canaux ne se mettent pas à jour pour tout le monde ; le bouton Ouvrir n'est pas synchronisé
       avec celui de la fiche.
    4. [Bug] Ajouter le Datapad au compendium.
    5. [Bug] Synchronisation de l'image de token.
    6. [Fonctionnalité] Informations : champ « Signe distinctif ».
    7. [Bug] Agrandir la taille de la description.
    8. [Bug] Notes : synchronisation entre ce que voit le PJ et le MJ.
    9. [Fonctionnalité] Glisser-déposer des acteurs dans les PNJ des PJ.
    10. [Fonctionnalité] Afficher une note dans le tchat, et pouvoir la glisser du tchat vers ses propres notes.
    11. [Fonctionnalité] Succès en vert, échecs en rouge, plus visibles.
    12. [Fonctionnalité] Compendium d'aménagements payants pour les vaisseaux.
    13. [Fonctionnalité] Nombre de modules d'aménagement par vaisseau.
    14. [Fonctionnalité] Ajouter de l'équipement directement dans le vaisseau.
    15. [Bug] Postes du vaisseau : glisser-déposer des PJ d'un poste à l'autre, à volonté.
    16. [Fonctionnalité] Bouton de jet par poste (le PJ du poste lance sa propre compétence) : Pilote → Pilotage,
        Navigateur → Informatique / piratage, Communicateur → Social, Manutention et entretien → Mécanique, Canonnier →
        Canon lourd, Médecin de bord → Médecine, Capitaine → Commander / guider.
    17. [Fonctionnalité] Dossier de musiques (depuis le dossier « music star wars » de l'auteur).
    18. [Fonctionnalité] Animations via P2A (armes, déplacement des vaisseaux).
    19. [Fonctionnalité] Création de personnage en Édition : validateur de niveaux déjà répartis (12 / 12 au niveau 1,
        +3 par niveau).
    20. [Bug] Médecine mal synchronisée avec les niveaux (55 en Dextérité, niveau 0 en Médecine → 75).
    21. [Bug] Onglet Combat : compétences pas dans l'ordre alphabétique.
    22. [Fonctionnalité] État « Endommagé » sur armes et armures, qui empêche de les porter.
    23. [Bug] Libellé : « Une compétence dépasserait le niveau 3 : choisissez-en une autre. »
    24. [Bug] Synchronisation entre la fiche du token et la fiche de l'acteur.
    25. [Bug] Les PJ doivent pouvoir glisser-déposer les acteurs dont ils sont observateurs ou propriétaires.
- **Faits dans cette session** : lien vers le vaisseau, grille 2 × 2 et corbeille de l'onglet Équipements (v0.15.8) ;
  fiche de vaisseau d'après le mockup et tous les ajouts de l'auteur (v0.16.0) ; nouveaux vaisseaux et images (v0.16.1).
- **Rappels techniques** : scripts de patch écrits avec l'outil Write (ou heredoc `<<'EOF'`, en doublant les
  antislashs à vérifier) — jamais de backticks dans un `node -e` en bash ; `git checkout` remet les fichiers en CRLF
  (normaliser avant de chercher du texte) ; `prose-mirror` doit rester en `display: flex`.

## Session du 2026-09-26 (suite 13) — Bugs du suivi (v0.18.1→v0.18.2)

- Foundry redémarré (accord de l'auteur) : 12 vaisseaux sur 17 avec image, tous servis. **Consigne de l'auteur** :
  commencer le suivi par les bugs ; **mettre à jour le tableur Drive** au fil du traitement → impossible ici (aucun
  connecteur Google, le tableur n'est lisible que par son lien public) : états à recopier fournis à l'auteur.
- **n° 5 et 24 — token / acteur désynchronisés** : aucun token de personnage n'était lié (prototypes et 5 tokens posés
  `actorLink: false`) → chaque token avait sa propre fiche (delta). Les joueurs avaient rempli leurs personnages **sur
  les tokens** (Neili : 1 450 245 c sur le token, 0 sur l'acteur ; Test_robin presque entièrement ; Alek 24 PV sur le
  token, 30 sur l'acteur). Correctifs : `GW.typesTokenLie` → token lié à la création ; correctif MJ
  `0.18.2-tokens-lies` : sauvegarde de l'acteur (dossier « Sauvegardes avant liaison des tokens »), recopie de la
  fiche du premier token modifié (`token.actor.toObject()` : système, objets, image), liaison du prototype et des
  tokens, bilan chuchoté au MJ. Testé sur des données temporaires (acteur 0 c / token 1 450 c + objet → acteur 1 450 c,
  niveau et objet repris, sauvegarde à 0 c, token lié qui affiche l'acteur) ; **non appliqué au monde de l'auteur**
  (proposé à sa prochaine connexion MJ). Les n° 3 (Comlink) et 8 (Notes) viennent probablement de la même cause (MJ
  sur l'acteur, joueur sur le token) : à revérifier après le correctif.
- **n° 25 — glisser des acteurs** : Foundry réserve le glisser depuis l'onglet Acteurs au droit « Créer des tokens »
  → `GalacticWarsActorDirectory` (`CONFIG.ui.actors`) : autorisé pour les acteurs observés / possédés. Non testé avec un
  compte joueur.
- **n° 1 — Guerrier jedi** : absent des sources de métiers ; fiche de Neili (« Guerrier jedi ») → brouillon calqué sur
  le Guerrier sith : prérequis Padawan niv. 4 ; Sabre laser, Parade / esquive, Protection de la force, Poussée de la
  force, Contrôle télékinétique, Pilotage, Sang-froid (+ Méditation, Sagesse, Escalade / saut) ; Robe traditionnelle de
  jedi, Sabre laser 2D8, ComLink, Kolto. **Validé par l'auteur** (« je valide le guerrier jedi »).
- **n° 4** Datapad au compendium (200c estimé, appareil « datapad ») ; **n° 7** description du personnage 180 px en
  lecture / 440 px en édition ; **n° 21** compétences de l'onglet Combat triées ; **n° 23** libellé « choisissez-en une
  autre ».
- **n° 20 — Médecine** : reproduit — le métier Médecin donne +20 à Médecine (bonus de métier) : 55 + 20 = 75 au niveau 0,
  conforme à la règle actuelle → **question posée à l'auteur**. **n° 2** (« objets d'équipement pas mis à jour ») : trop
  vague, **question posée**.

## Session du 2026-09-26 (suite 12) — Images de vaisseaux, nouveau suivi (v0.18.0→v0.18.1)

- v0.18.0 confirmée chez les joueurs par l'auteur, poussée et publiée.
- **Images des vaisseaux** : `front_speeder.jpg` est en réalité un **WebP** (en-tête `RIFF…WEBP`) montrant une moto
  speeder. Associations proposées et **validées par l'auteur** : Moto speeder ← `front_speeder`, Le Arcadia ←
  `vaiseau_chasseur_moyen`, Corellian Dawn ← `front_vaiseau_moyen_corvette`, CEC XS-122 ←
  `front_vaiseau_jaune_exploreur`, La poubelle géante ← `adb30907…` (freighter usé vu de dessus). Conversion dans
  le navigateur (Playwright, image passée en `data:` — un `file://` « souille » le canvas et bloque `toDataURL`).
  Correctif `0.18.1-images-vaisseaux`. Restent sans image : Barloz, Barmaid Betty, Lantallian, Dynamic 20, Land speeder.
- **Deux tableurs de l'auteur** ajoutés à la todo : la fiche de WOLF (juste noter) et un **suivi de 25 points**
  (recopié dans « À faire à la reprise »).
- Déployé sans redémarrage (2 utilisateurs connectés) : images visibles au prochain redémarrage.

## Session du 2026-09-26 (suite 11) — Générique (v0.17.0→v0.18.0)

- v0.17.0 poussée et publiée (accord de l'auteur).
- **Générique** : « code le générique comme la maquette ». Nouveau type de page de journal **Générique** (données :
  épisode, titre, phrase d'ouverture, texte — un paragraphe par ligne vide —, vitesse lente / normale / rapide,
  musique et image de fond facultatives). En lecture : encart (logo, épisode, titre, texte) et boutons **Diffuser le
  générique** (MJ) et **Aperçu (vous seul)**.
- `apps/generique.mjs` : écran plein écran par-dessus Foundry (z-index 10000), repris de la maquette — étoiles en
  canvas (scintillement, redimensionnement), ouverture bleue 5 s, logo 8,5 s, défilement à 10,2 s ; fin = fondu et
  fermeture. Diffusion : `game.socket` sur `system.galactic-wars` (`lancer` avec les données, `passer`,
  `arreter`) ; le MJ a « Passer au texte » et « Arrêter pour tous », chacun « Fermer » / Échap chez lui ; musique
  jouée chez chaque client (`AudioHelper.play`), arrêtée à la fermeture. Mouvements réduits : texte fixe.
- Réglage de la vitesse : en plein écran, la vitesse relative à la hauteur du texte était trop lente (titre visible au
  bout de 14 s, la perspective écrasant le mouvement) → vitesse en pixels proportionnelle à la taille de la police
  (1,6 × taille / s × vitesse), départ à 80 % : titre à 524 px à 4 s, 271 px à 10 s (écran de 950 px), 41 s pour trois
  paragraphes en vitesse normale.
- Testé sans redémarrage (2 utilisateurs connectés) en appelant `jouerGenerique` : ouverture visible, boutons du MJ,
  « Passer », défilement lisible, Échap.
- **Après redémarrage** (accord de l'auteur), test à **deux navigateurs** : page « Générique » créée (type
  `generique`, 2 paragraphes, vitesse rapide = 1,6), encart et boutons en lecture ; « Diffuser » → le second client
  affiche le générique avec les commandes ; « Passer » (client A) → défilement chez B ; « Arrêter pour tous » → fermé
  chez A et B ; édition : 7 champs, titre enregistré ; journaux de test supprimés ; aucune erreur. **Effet de bord** :
  la diffusion de test est aussi arrivée chez les deux autres personnes connectées (Gamemaster, Latios) pendant
  ~10 s avant l'arrêt — signalé à l'auteur. Musique non testée (pas de fichier audio de test).

- **Bug remonté par l'auteur** : « le générique s'affiche pour moi avec l'animation mais pas pour mes joueurs, ils ont un
  freeze ». Pistes : (1) **mouvements réduits** — si Windows a les effets d'animation désactivés, le navigateur annonce
  `prefers-reduced-motion: reduce` et le code affichait le texte **fixe**, sans défilement ni fermeture automatique
  (écran qui paraît figé) ; (2) **performances** sans accélération matérielle (plateau PIXI rendu dessous, étoiles
  redessinées à chaque image en plein écran à 2× la résolution, `mask-image` sur un calque 3D). Mesure sans GPU non
  concluante (Foundry seul y tourne déjà à 4 images / s). Correctifs : en mouvements réduits, ouverture en fondu puis
  **défilement quand même** (sans zoom du logo ni scintillement), fermeture automatique ; plateau de Foundry **mis en
  pause** pendant le générique (`canvas.app.ticker`, repris à la fermeture) ; étoiles à résolution 1:1 redessinées
  10 fois / s (carrés au lieu d'arcs) ; `mask-image` remplacé par un dégradé noir posé au-dessus ; `will-change`.
  Vérifié (appels directs, aucune diffusion : d'autres utilisateurs connectés) : mouvements réduits → texte qui défile,
  plateau en pause puis repris, fermeture ; mode normal inchangé. **Confirmé par l'auteur : « ça marche chez les
  joueurs »** ; v0.18.0 poussée et publiée.
- **Demande de l'auteur** : barre de défilement dans la fenêtre d'édition de la page Générique → `.window-content` en
  `overflow-y: auto` (vérifié à 500 px de haut : 797 px de contenu, défile jusqu'au bouton Sauvegarder).

## Session du 2026-09-26 (suite 10) — Maquette du générique, acteur Équipage (v0.16.3→v0.17.0)

- **Générique** : l'auteur a demandé la maquette de la proposition A. Page publiée (artifact) : champ d'étoiles en
  canvas, phrase d'ouverture bleue, logo « GALACTIC WARS » qui recule, texte jaune en perspective (`rotateX`,
  masque de fondu), commandes Lancer / Passer / Arrêter / vitesse / plein écran, formulaire épisode / titre / phrase /
  texte appliqué au prochain lancement, encadré « ce que ça donnerait dans Foundry ». Mouvements réduits respectés.
- **Acteur Équipage** (todo, modèle : acteur « Groupe » de PF2e) :
  - `EquipageData` : membres (UUID, ordre d'affichage), vaisseau, caisse commune, portrait, notes.
  - `EquipageSheet` : en-tête (portrait, nom, résumé, caisse, carte du vaisseau), onglets **Membres** (cartes :
    portrait rond, type · race · métier · niveau, barre de PV colorée, crédits — PV et crédits seulement avec le droit
    Observateur —, bouton « Crédits » = fenêtre Verser / Prendre, retrait avec confirmation, membre supprimé signalé),
    **Réserve** (armes / armures / équipement, clic = carte dans le tchat, « Donner à » + « Donner », crayon, corbeille),
    **Notes** (éditeur repliable).
  - Dépôts : personnage / PNJ → membre (acteur de compendium refusé, doublon signalé) ; vaisseau → vaisseau de
    l'équipage ; objet d'un acteur → **déplacé** dans la réserve ; objet de compendium / du monde → copié.
  - `dropActorSheetData` : un objet glissé de la réserve vers une fiche est déplacé (Foundry le dupliquerait).
  - Fiche classique : lignes d'inventaire `draggable` ; panneau Vaisseau = vaisseau de l'équipage quand le
    personnage n'en a pas (« Vaisseau de l'équipage … », pas de bouton de retrait).
  - `GalacticWarsActor#_preCreate` : un nouvel équipage prend l'image de groupe de Foundry et le droit Propriétaire
    par défaut (réserve et caisse partagées par les joueurs) — choix par défaut, à confirmer par l'auteur.
- **Vérifié après redémarrage** (accord de l'auteur) — v0.16.2 : 10 bannières servies ; v0.16.3 : 6 nouveaux objets
  (type, prix, réduction, visuel), descriptions en place, tenues de départ → Robe de jedi / Tenue d'apprenti jedi /
  Robe noire (lien compendium), correctif `0.16.3-visuels-descriptions-objets` déjà appliqué dans le monde de test
  (objets de Kael décrits, « ComLink » par correspondance de nom) ; v0.17.0 sur un équipage temporaire (supprimé, ainsi
  que ses 2 messages) : image de groupe + Propriétaire par défaut, Kael et Alek membres (doublon refusé), Barloz
  vaisseau d'équipage et affiché chez Kael (« Vaisseau de l'équipage … »), Kit de réparation Kael → réserve (retiré
  de Kael), réserve → Alek par le hook (`false`, déplacé), Alek → réserve → Kael par « Donner » (jamais dupliqué),
  crédits 850 → 750 / caisse 100 puis retour, prise de 500 refusée ; Kael restauré (850 c, 9 objets). Aucune erreur.

## Session du 2026-09-26 (suite 9) — Visuels et descriptions des objets (v0.16.2→v0.16.3)

- **Todo** : « Synchroniser les images sur les objets, anciens et nouveaux (ex. des vêtements), avec une description
  sommaire pour les nouveaux. S'en inspirer pour ajouter des descriptions supplémentaires aux objets existants. »
- **Descriptions** : 68 armes sur 80 n'avaient que la référence au classeur (« ligne 15 »), les 3 armures rien,
  9 équipements une demi-ligne. Une description d'ambiance par famille (40 familles d'armes ; les « (amélioration
  N) » en héritent + « Version améliorée : plus puissante que le modèle de base »), placée **avant** le texte existant,
  conservé tel quel (règles, références au classeur). 94 objets enrichis.
- **Nouveaux objets** (images `asset_visuel/item/vetement_*`, réduites dans `asset_visuel/objets/`) : Robe de jedi
  (150c), Tenue d'apprenti jedi (80c), Robe noire (150c), Tenue de contrebandier (120c) — équipements, **prix
  estimés** ; Armure de guerrier sith (réduction 4) et Plastron blindé (réduction 2) — **réductions estimées**,
  signalées dans la description. `vetement_armure_lourde` non utilisée (même visuel que l'Armure lourde existante).
- **Visuels** ajoutés : Accessoire silencieux, Cartouche de carbonite. Restent sans visuel dédié : Canon à gaz (×2),
  Chouchou étrangleur, Kit de réparation, Rayon tracteur (rien dans `asset_visuel/item/`).
- **Tenues de départ** : « Robe traditionnelle de jedi » (Jedi consulaire) → Robe de jedi, « Robe traditionnelle »
  (Padawan) → Tenue d'apprenti jedi, « Robe noire » (Guerrier sith) → Robe noire (`CORRESPONDANCES`).
- **Correctif MJ** `0.16.3-visuels-descriptions-objets` : objets du monde / des personnages rattachés à un modèle
  (lien compendium, même type + même nom, ou tenue de départ) ; image remplacée seulement si générique, description
  seulement si vide ou contenue dans la nouvelle (= ancien texte du compendium) — jamais un texte personnalisé.
- Déployé sans redémarrage (utilisateurs connectés ; l'auteur : « on redémarrera plus tard ») → compendiums et
  correctif à vérifier au prochain redémarrage.

## Session du 2026-09-26 (suite 8) — Bannières des compendiums (v0.16.1→v0.16.2)

- **Todo** : « Retravailler l'image de chaque compendium (bannière affichée sur la façade du compendium) ». Foundry
  affiche `packs[].banner` en `object-fit: cover` (barre latérale ~300 × 84-100 px) → bannières de 600 × 168 px.
- Chaque bannière = mosaïque de 3 à 6 bandes verticales recadrées, filet sombre entre les bandes, voile haut / bas
  pour le titre posé par Foundry. **Seuls des visuels déjà publiés** : ethnies (Races, Codex des espèces, Talents),
  objets (Armes, Armures, Équipements, Métiers : outils de métier), armes sith (Écoles, Pregens sith avec 2 portraits
  d'ethnie), vaisseaux. Les dossiers non suivis `Personnage/` et `lieux/` (images de campagne) ne sont pas utilisés.
- Piège : une bonne partie de `asset_visuel/Ethnie/*.jpg` est du **WebP** (System.Drawing : « Mémoire insuffisante »)
  → bannières dessinées dans la page Foundry (canvas, Playwright via `verify-local.mjs`) et rapatriées en JPEG 85 %.
- Déployé sans redémarrage (2 utilisateurs connectés) : `system.json` n'est relu qu'au redémarrage.

## Session du 2026-09-26 (suite 7) — Nouveaux vaisseaux (v0.16.0→v0.16.1)

- v0.16.0 validée par l'auteur (« je valide la première version de la fiche vaisseau »), Foundry redémarré avec son
  accord, 13 vaisseaux du compendium vérifiés, poussée et publiée.
- **Réponse de l'auteur** : les images nommées de `asset_visuel/vaiseau/` sont de nouveaux vaisseaux ; **choix de
  l'auteur** : caractéristiques estimées. Quatre vaisseaux ajoutés au compendium : **Pourparler** (grande frégate
  armée, 80 m, coque 120, bouclier 150, 4 canons lourds + 6 tourelles, 20 000 000c), **Lance d'argent** (frégate
  armée, 60 m, 80 / 100, 9 000 000c — même illustration que le Pourparler, sur fond noir), **La Brique** (transport
  moyen blindé, 40 m, 45 / 25, 350 000c), **Lumière de l'aube** (grande frégate de dignitaires, 90 m, 110 / 180,
  25 000 000c). Calibrage : Arcadia (40 / 60, 200 000c), Gunboat (60 / 70), Barmaid Betty (100 / 120,
  17 500 000c). Armes en objets (Canon lourd, emplacements), postes à plusieurs places, aménagements décrits,
  mention « Caractéristiques estimées » dans chaque description.
- Images réduites (PowerShell / System.Drawing) dans `asset_visuel/objets/vaisseaux-*` (dossier embarqué par la
  release) : PNG transparent gardé pour le Pourparler et La Brique (bons tokens vus de dessus), JPEG 85 % pour les
  deux autres ; même image pour l'acteur, le portrait de la fiche et le token.
- **Images validées par l'auteur** (« je valide ») : Le Frelon ← `front_vaiseau_petit_chasseur`, Convergence ←
  `front_vaiseau_croiseau_tres_grand`, Gunboat 1061-968 ← `front_vaiseau_croiseur_très_grand_nom_gun` (réduites dans
  `asset_visuel/objets/vaisseaux-*`). Correctif MJ `0.16.1-images-vaisseaux` : copies du monde de même nom encore à
  l'image par défaut (acteur, portrait, prototype ou texture du token non lié).
- Foundry redémarré (accord de l'auteur) ; vérifié : 17 vaisseaux au compendium, 7 avec image (fichier servi,
  token et portrait identiques à l'image), armes et aménagements des 4 nouveaux ; aucune erreur de page. Validé par
  l'auteur, publié.

## Session du 2026-09-26 (suite 6) — Refonte de la fiche de vaisseau (v0.15.8→v0.16.0)

- **Todo** : fiche de vaisseau d'après le mockup `asset_fiche_perso/mokcup_exemple_fiche_vaiseau.jfif`. Nouveau
  template + `styles/vaisseau.css` (scopé `.galactic-wars.vaisseau`, palette acier / cyan, titres de panneau à onglet) :
  - haut : grande image sur quadrillage « plan » (portrait, sinon image de l'acteur ; clic = changer), Nom / Classe /
    Taille / Prix (pièces) ; **Ressources** : jauges SVG en arc de 270° — coque (vert → orange → rouge selon le %),
    bouclier (bleu), réduction —, saisie dans le cadran, interrupteur « Bouclier actif » (jauges éteintes s'il est
    coupé), Déplacement ;
  - **Armement** : lignes (icône, nom, dégâts, quantité, emplacement sur plusieurs lignes), survol ambre, crayon =
    fenêtre d'édition, corbeille avec confirmation, « Ajouter une arme » ;
  - **Équipage** : tableau Poste | Nom — poste (« Pilote (2 positions) »), description, un champ de nom par place ;
    crayon = fenêtre (poste, nombre de places, description) ;
  - **Aménagements** : soute, équipements embarqués (texte libre) + pastilles avec une icône devinée du libellé
    (sanitaire, navette, pods, quartiers, cuisine, infirmerie…) ; **Description** (éditeur repliable, `toggled`).
- **Données** (`VaisseauData`) : `armement[].emplacement`, `equipage[].places` / `noms[]` (ancien `nom` conservé,
  repris par `migrateData`), `bouclier.max` (repris des points actuels). Armement et postes ne passent plus par le
  formulaire (tableau complet réécrit) ; les noms d'équipage oui — `_processFormData` les fusionne dans le tableau
  complet (sinon rôle et description seraient perdus : un ArrayField est toujours remplacé en entier).
- Corrigé au passage : titre de fenêtre « TYPES.Actor.vaisseau » (clé de traduction manquante) → « Vaisseau ».
- Piège retrouvé : `prose-mirror` en `display: block` écrase l'éditeur à 0 px (déjà noté pour les Notes) → flex.
- Vérifié (copie temporaire de « La poubelle géante », supprimée ensuite) : saisie d'un nom (rôle / description
  intacts), ajout / modification / suppression d'arme (Non garde, Supprimer retire), places 2 → 3 (3 champs), bouclier
  coupé, pastilles d'aménagements, description ; migration sur la Convergence du compendium (bouclier max 500, noms
  repris) ; aucune erreur de page. Notes de version 0.15.8 (oubliées à la release) et 0.16.0 ajoutées.

- **Ajouts de l'auteur pendant le lot** (intégrés à la v0.16.0, pas encore publiée) :
  - **Mode Édition** (bouton « Édition » à côté du nom, état de l'instance comme la fiche de personnage ; ouvert
    d'office sur un vaisseau vierge). Hors Édition : identité, maximums (coque, bouclier), réduction, soute et
    description en lecture ; pas de boutons d'ajout / modification / suppression. Restent utilisables en jeu : coque,
    points de bouclier, interrupteur, déplacement, armes (clic = carte), noms et dépôts d'équipage.
  - **Aménagements** : nouveau champ `amenagements[] { nom, description }` (ajout / modification / suppression par
    fenêtre en Édition), cartes avec icône devinée du nom (table `ICONES_AMENAGEMENT` étoffée : pilotage, machines,
    sas, entrepôt, séjour…). L'ancien texte `equipementsEmbarques` est découpé par `migrateData` (découpage brut) ;
    les 13 vaisseaux du compendium ont des listes **rédigées à la main** (nom court + description, mention « Inventé,
    non précisé dans le matériel source » reprise là où la source le disait).
  - **Équipage** : glisser-déposer d'un acteur (hors vaisseau) sur un poste, même hors Édition — sur la place visée,
    sinon la première libre (poste complet = message). `equipage[].uuids[]` en parallèle de `noms[]` ; la place
    montre le portrait et le nom (clic = fiche), croix = libérer. Surbrillance du poste pendant le dépôt.
  - **Armement en objets « arme »** (`helpers/armement-vaisseau.mjs`) : `_onDropItem` n'accepte que les armes
    (portées d'office) ; « Nouvelle arme » crée une arme vierge (Canon lourd, visuel de tourelle) et ouvre sa fiche ;
    emplacement = drapeau `galactic-wars.emplacement` (saisi sur la ligne en Édition). Clic sur la ligne = carte de
    tchat (Attaquer / Dégâts). `Item#estArmeDeVaisseau` : `attaquer()` prend le **token sélectionné** (sinon le
    personnage de l'utilisateur) comme tireur, sans exiger « porté » ; titre « arme — vaisseau » ; la carte indique
    « <compétence> (taux du token sélectionné) ». Seul le propriétaire du vaisseau (ou le MJ) a les boutons de la carte.
  - **Conversion de l'ancien armement texte** : bouton « Convertir » sur la fiche (bandeau d'avertissement) et
    correctif MJ `0.16.0-armement-en-objets` (vaisseaux du monde et tokens non liés ; compétence Canon lourd) ; les
    13 vaisseaux du compendium sont convertis dans les sources (objets intégrés ; emplacements et places du mockup
    pour La poubelle géante : 2 pilotes, 3 autres places). Monde de test : le Barloz (token lié) a encore 2 armes à
    l'ancien format → correctif laissé à l'auteur.
  - **migrateData** : jamais sur une mise à jour partielle (`options.partial`) — sinon `{ bouclier: { points } }`
    seul remettait le maximum aux points. Ne s'applique pas non plus à un `Actor.create` (seulement aux données
    chargées) : sans conséquence, les anciens champs n'existent que dans les données enregistrées.
  - Vérifié sur un vaisseau temporaire (supprimé) : conversion (2 armes, Canon lourd, portées), dépôt d'une arme du
    compendium (+1) et refus d'un équipement, 0 bouton en lecture / 8 en Édition, emplacement enregistré, aménagement
    ajouté avec description, Kael déposé sur la 2ᵉ place du poste Pilote (portrait + lien), tir refusé sans token puis
    « Tourelle lourde — Test armement (temp) » au taux Canon lourd de Kael (20 %), message au nom de Kael.
  - **Retours de l'auteur** : jauge « Bouclier (réduction) » supprimée de la fiche (jugée inutile ; le champ
    `bouclier.reduction` reste dans les données, plus affiché) ; **déplacement agrandi** (champ 5 rem, chiffre en
    1,8 rem ambre, icône plus grande) dans la colonne libérée.
  - Piège : un heredoc bash entre apostrophes réduit `\\s` en `\s` dans un script généré → antislashs doublés à
    reprendre à l'outil d'édition.

## Session du 2026-09-26 (suite 5) — Lien vers le vaisseau, grille, corbeille (v0.15.7→v0.15.8)

- **Récapitulatif** : lien vers le vaisseau dans l'onglet Équipements ; grille 2 × 2 (Armes | Armures et boucliers,
  Équipement | Vaisseau) ; corbeille en mode Édition avec confirmation. Validé par l'auteur, poussé et publié
  (release v0.15.8).

- **Todo** : « Onglet Équipements : un lien vers le vaisseau, pour que les joueurs aient accès au vaisseau sur lequel ils
  volent. » Panneau « Vaisseau » en tête de l'onglet (pleine largeur). On y **dépose un acteur vaisseau** depuis l'onglet
  Acteurs (`PersonnageSheet#_onDropActor`, sans passer par le mode Édition) ; un vaisseau de compendium est refusé avec
  un message (il ne serait pas partagé entre joueurs). La carte (image, nom, classe, coque, bouclier) ouvre la fiche du vaisseau.
- **Droits** : le joueur doit avoir au moins le droit Observateur sur le vaisseau ; sinon la carte ne montre que le nom
  et l'image (« Accès à demander au MJ ») et le clic l'explique. Vaisseau supprimé : message avec le nom mémorisé.
- **Choix par défaut** : lien individuel par personnage ; l'acteur « Équipage » (à venir) pourra porter le vaisseau
  commun. Onglet Équipements de la fiche classique seulement (les fiches rapide / sith n'en ont pas).
- Déployé sans redémarrage (1 utilisateur connecté, aucun compendium modifié). Vérifié sur Kael avec « Convergence
  (test) » : dépôt → onglet Équipements, carte, fiche du vaisseau ouverte, dépôt depuis le compendium refusé, lien
  retiré (Kael restauré), aucune erreur de page.
- **Retour de l'auteur** : onglet Équipements en grille 2 × 2 — Armes | Armures et boucliers, puis Équipement |
  Vaisseau (les armes ne prennent plus toute la largeur). Vérifié à l'écran (positions des 4 panneaux).
- **Todo (ajout de l'auteur)** : bouton de suppression d'objet dans l'onglet Équipements en mode Édition, avec
  confirmation. Corbeille rouge à droite du crayon sur chaque ligne (onglet Équipements seulement : le partiel
  `gwLigneObjet` sert aussi à l'onglet Combat). Elle appelle `#supprimerObjet`, déjà utilisé par le « Supprimer » du
  menu contextuel ; la fenêtre de confirmation a maintenant un titre, un bouton « Supprimer » et « Non » par défaut.
  Vérifié : 0 bouton hors Édition et dans Combat, « Non » garde l'objet, « Supprimer » le retire (objets de test
  supprimés, Kael inchangé).

## Session du 2026-09-26 (suite 4) — Kit de réparation (v0.15.6→v0.15.7)

- **Todo** : « Kit de réparation » (mécanique) avec description, prix fixé par l'auteur à 200c. Description (outils,
  soudeur, pièces ; droïdes, véhicules, vaisseaux, armes, équipements ; compétence Mécanique) sans effet de jeu.
  Aucun visuel dans `asset_visuel` : icône Foundry `wrench-mechanical-heal-blue`.
- Correctif `0.15.7-kit-de-reparation` : complète prix / description / visuel (s'ils sont vides ou génériques) des
  équipements nommés « Kit de réparation » (accents ignorés) — validé par l'auteur à sa reconnexion (kit de Kael).

## Session du 2026-09-26 (suite 3) — Taux : le niveau s'ajoute toujours (v0.15.5→v0.15.6)

- **Bug confirmé par l'auteur** : avec `carac + max(0, niveau + racial + métier + ajustement + malus)`, le malus hors
  métier (−10 / −30) absorbait les premiers niveaux (Artifice 20 % aux niveaux 0, 1 et 2). **Choix de l'auteur** :
  « niveau toujours ajouté » → `carac + barème(niveau) + max(0, racial + métier + ajustement + malus)`, plafond
  inchangé. Modifié dans `PersonnageData#prepareDerivedData` et l'aperçu `PersonnageSheet#tauxPourNiveau`.
- **Précision de l'auteur** (dans la foulée) : « les malus raciaux s'appliquent tout le temps et le malus hors métier ne
  s'applique que si le niveau est à 0 » → formule finale `carac + racial + barème(niveau) + max(0, métier + ajustement +
  (niveau 0 ? malus : 0))`, bornée à [0, plafond]. Vérifié : Artifice 20 / 25 / 30 / 40 % ; racial −10 → 10 % au
  niveau 0 (sous la caractéristique), 20 % au niveau 2. Par rapport à la v0.15.5 : 18 taux changent sur les acteurs du
  monde (ex. Alek : Sagesse racial −5 25 → 20 %, Commander/guider racial +10 25 → 35 %).
- Première version (remplacée) : Artifice (Kael) 20 → 25 → 30 → 40 %. Taux dérivé : aucune donnée à migrer. Impact mesuré dans le monde de
  test : 28 taux relevés de +5 à +20 points (Alek, Gueran Cell, « classique »), ex. Artifice niv. 3 de Gueran Cell
  20 → 40 %.

## Session du 2026-09-26 (suite 2) — Lumière / Obscurité : « Utiliser un point » (v0.15.4→v0.15.5)

- **Todo (ajout de l'auteur)** : rendre les réserves plus ergonomiques. Proposition faite (dépense avant / après le jet,
  don par le MJ, widget d'en-tête…). **Réponse de l'auteur** : dépense **avant** l'action, car le MJ fixe une difficulté
  en niveaux ; un point dépensé devient un niveau virtuel sur la compétence le temps de l'action. Pas de mécanique :
  « simplement un bouton pour utiliser ses points avec un message dans le tchat ».
- `GalacticWarsActor#utiliserReserve(cle)` : −1 point, message « <nom> a utilisé un point de Lumière / d'Obscurité »
  (clés distinctes pour l'élision). Boutons « Utiliser un point de … » avec le compteur, grisés à 0, dans les onglets
  Personnage (sous la jauge, à la place des radios) et Combat (à la place des pastilles).
- **Retiré** : le bonus automatique de +15 % (radios `bonusAlignement`, `reserveChoisie`, `pool` des jets de
  compétence et des attaques) — contraire à la règle. `GW.bonusAlignement` et le paramètre `pool` de `rollCompetence`
  restent dans le code mais ne sont plus utilisés par la fiche. Les −/+ de la jauge sont inchangés (don / retrait).
- Vérifié sur Kael (2 / 1 → 1 / 0, deux messages, bouton grisé à 0, un jet ne consomme plus rien), restauré.
- **Confirmé par l'auteur** : le gain de niveau fait aussi monter le niveau du personnage de 1 (`GW.gainNiveauPersonnage`).
- **Confirmé par l'auteur** : bouton Porté / Rangé à droite sur toutes les lignes (onglets Équipements et Combat).

## Session du 2026-09-26 (suite) — Gain de niveau répétable, lignes d'inventaire (v0.15.3→v0.15.4)

- **Todo (ajouts de l'auteur)** :
  - Gain de niveau : même compétence choisissable plusieurs fois jusqu'au niveau 3, taux mis à jour. Fenêtre à 3
    listes, aperçu en direct (`render` de DialogV2) « niveau a → b, taux x % → y % » calculé par
    `#tauxPourNiveau` (copie de la règle de `prepareDerivedData`), dépassement du niveau 3 signalé et refusé ;
    message du tchat avec les taux réels après application. **Constat signalé à l'auteur** : avec la caractéristique
    en plancher et le malus hors métier (−10 / −30), les premiers niveaux d'une compétence non acquise ne changent
    pas le taux (Artifice 0 → 2 : 20 % → 20 %) ; règle gardée telle quelle en attendant sa réponse.
  - Boutons antenne (Comlink) et globe (Holonet) retirés des lignes (le clic sur la ligne les ouvre).
  - Bouton Attaquer retiré des lignes d'armes ; Porté / Rangé déplacé à droite de **toutes** les lignes (partiel
    `gwLigneObjet` partagé avec l'onglet Combat — choix par défaut, question posée à l'auteur).
- Piège : le découpage automatique du code a emporté `#onDegatsObjet` / `#onLancerInitiative` (placés entre les
  méthodes supprimées) — vu au `node --check`, restaurés.
- Vérifié sur Kael (restauré) : Artifice ×2 + Bagarre → 0 → 2 (20 → 20 %) et 0 → 1 (30 → 35 %), niveau 3 → 4,
  dépassement signalé ; ligne = image, nom, valeur, Porté / Rangé, crayon ; bascule sans message dans le tchat.

## Session du 2026-09-26 — Petits points de la todo (v0.15.2→v0.15.3)

- La todo s'est remplie de 10 points (voir le fichier de l'auteur) ; traités ici les 4 petits (7 à 10) :
  - **Clic sur Datapad / Comlink** dans l'inventaire (bug) : `PersonnageSheet#activerObjet` ouvre l'onglet Holonet /
    Comlink (clic et Entrée) ; les autres objets vont toujours dans le tchat. Vérifié : 0 message pour les deux
    appareils, 1 pour une arme.
  - **Onglet Comlink** : `#onChangerOnglet` remet `#comlink.canal` à null → retour à la liste (vérifié).
  - **Niveaux** : niveau du personnage en lecture seule hors Édition (`.niveau-perso-lecture` — attention, la classe
    `.niveau-lecture` existe déjà sur les niveaux des lignes de compétence) ; bouton **Gain de niveau** (Édition) :
    fenêtre à 3 listes, compétences distinctes non bloquées < niveau 3, +1 niveau chacune, tableau complet réécrit,
    message dans le tchat. **Choix par défaut non confirmé** : le niveau du personnage gagne aussi 1
    (`GW.gainNiveauPersonnage`). Vérifié : 3 → 4, trois compétences 0 → 1, Kael restauré.
  - **Gain d'XP** visible en mode Édition seulement.
- Restent dans la todo : kit de réparation (prix / effet à préciser), lien vers le vaisseau, refonte de la fiche de
  vaisseau (mockup), images des vaisseaux, bannières des compendiums, acteur « Équipage ».

## Session du 2026-09-25 (suite 6) — Contacts de départ en PNJ (v0.15.1→v0.15.2)

- **Bug remonté par l'auteur** : le Contrebandier recevait « Connaissance dans la pègre » comme objet d'inventaire ;
  ce doit être un PNJ de l'onglet Notes. Même cas : Assassin, Chasseur de primes, Mandalorien soldat, Pirate,
  Voleur (« … pègre locale ») et, par extension (même nature), « Contact sur quasiment chaque planète » (Agent secret).
- `objets-depart.mjs` : `estContactDeDepart`, `pnjDeDepart` (PNJ allié, sous-titre « Contact de départ — <métier> »,
  `origineMetier`). `applyMetier` : sur la fiche classique (qui a des Notes) ces lignes deviennent des PNJ ; les
  contacts de départ encore intacts de l'ancien métier sont remplacés. La fenêtre d'édition des Notes réécrit l'entrée
  sans `origineMetier` : un contact complété par le joueur lui appartient et survit au changement de métier (vérifié).
  Autres fiches (rapide / PNJ, sans Notes) : la ligne reste un équipement.
- Correctif `0.15.2-contacts-en-pnj` appliqué au monde de test (Kael, son token, token Gueran Cell : objet retiré,
  PNJ ajouté ; tokens non liés sans doublon).
- **Ajout de l'auteur à la todo** : « Kit de réparation » (mécanique) avec description dans le compendium Équipements.

## Session du 2026-09-25 (suite 5) — Reprise, conversation du comlink dans le tchat (v0.15.0→v0.15.1)

- Foundry redémarré sur la v0.15.0 (accord de l'auteur) : « Comlink » du compendium reconnu (appareil comlink),
  correctif « Inconscient » validé par l'auteur à sa reconnexion (token « classique », 0 PV → inconscient), plus
  aucun correctif en attente.
- **Todo (ajout de l'auteur)** : montrer la conversation dans le tchat depuis la conversation. Bouton bulle dans
  l'en-tête de la conversation → `helpers/comlink.mjs#montrerConversation` : carte de tchat (canal, contact, porteur,
  bulles contact à gauche / personnage à droite, « vu »). Visibilité comme « Montrer dans le tchat » d'un objet :
  publique, chuchotée au MJ et à soi si le comlink est tagué « Caché » (choix par défaut, non demandé).
  Vérifié sur Kael (conversation de test, carte publique, 3 bulles dans le bon sens), comlink remis à vide et
  message supprimé.

## Session du 2026-09-25 (suite 4) — Comlink : canaux et messagerie (v0.14.2→v0.15.0)

- Dernier point de la todo. **Choix de l'auteur** : historique complet dans une zone ≈ 10 messages de haut (rien
  n'est supprimé) ; alerte chuchotée au destinataire (MJ, ou propriétaires du porteur) ; « comlink ++ » = option
  Messagerie on / off du comlink (pas un objet à part).
- Données `system.comlink` (EquipementData) ; `helpers/comlink.mjs` : `ajouterCanal` (numéro = max + 1, archives
  comprises), `modifierCanal` (DialogV2 : numéro, contact, actif ; numéro pris ou invalide refusé),
  `archiverCanal`, `configurerComlink`, `envoyerMessage` (MJ au nom du contact, PJ au nom du porteur), `basculerVu`
  (MJ, messages du PJ), alerte + bouton « Ouvrir » (`ouvrirComlink(numero)` de la fiche).
- Fiche d'objet : onglet Comlink (ouvert par défaut pour un comlink porté par un personnage, comme l'Holonet), liste
  des canaux / conversation, brouillon conservé entre deux rendus, Entrée = envoyer, défilement en bas. Bouton antenne
  sur la ligne d'inventaire.
- Trouvé en testant : le « Comlink » du compendium et celui de Kael n'avaient pas d'appareil → compendium corrigé +
  correctif `0.15.0-appareil-comlink` (appliqué au monde de test : 2 objets).
- Vérifié (Kael, remis à vide ensuite) : numéros 1-2-3 puis 4 après archivage du 3, numéro pris refusé, archives
  masquées, bulles gauche / droite, « vu », saisie présente. Non testé en réel : l'alerte côté joueur (pas de compte
  joueur de test propriétaire de Kael).
- **Ajout de l'auteur à la todo** (en cours de session) : état « Inconscient » à 0 PV. **Choix de l'auteur** : PV ajoutés
  aux fiches PNJ / partie rapide (`system.pv.value / max`, qui n'existaient pas — les dégâts depuis le tchat
  s'appliquent donc aussi aux PNJ) ; retrait automatique dès 1 PV. `synchroniserInconscient` (statut core
  `unconscious` via `toggleStatusEffect`) : appelé par `_onUpdate` quand les PV changent (client auteur seulement) et
  par `encaisserDegats` même sans variation (acteur déjà à 0 — cas trouvé en test sur le token « classique »).
  Vérifié : Kael (lié), token non lié, PNJ rapide → 0 PV = inconscient, soin 3 = réveil, PV et état restaurés.
  Correctif `0.15.0-etat-inconscient` laissé en attente pour l'auteur (1 token déjà à 0 PV).

## Session du 2026-09-25 (suite 3) — Catalogue économique : prix et armes (v0.14.1→v0.14.2)

- Classeur `[GW]  Science économique.xlsx` lu sans Python (xlsx dézippé, sharedStrings + sheet1 parsés en Node).
  Colonnes : Arme (B/F/H), Lancer + Corps à corps (L/P/R), Outils (V/Z/AB), Véhicule (AF/AL), Commun (AQ/AW).
- **Choix de l'auteur** : Blaster lourd = classeur (2d6+3, 400c ; l'ancien 4500c venait d'une ligne « Amélioration
  2d6 4500 » d'une autre colonne) ; Fusil de précision 1200c (Fusil sniper) ; Arme contondante 522c (Lame militaire) ;
  sabres laser NA ; **tout ajouter**.
- 70 armes créées (générateur hors dépôt, IDs aléatoires, description = ligne source) : améliorations en objets
  distincts « (amélioration N) » ; compétences : blaster (pistolets, fusils, arbalète), canonLourd (canons, tourelle,
  lance-flamme, carbonite, lance-roquette), artifice (grenades), bagarre (extension griffe / crocs), armeBlanche
  (bâtons, tridents, haches, lames, vibrolames, tasers), sabreLaser (sabres). Grenades flash / fumigène sans dégâts
  (le classeur n'en donne pas). 3 équipements (Gant magnétique, Accessoire silencieux, Cartouche de carbonite).
  Véhicules / vaisseaux : déjà dans le compendium Vaisseaux avec leurs prix ; non repris : « transporteur de base
  80 000c 6 places » (cellule du Lantallian) et le prix alternatif 50 000c du Frelon (col. AP).
- 20 visuels copiés de `asset_visuel/item/` vers `asset_visuel/objets/` (`arme_fusil_blaster_lourd.pgn` est un JPEG) ;
  sans visuel : Canon à gaz (×2), Chouchou étrangleur, Accessoire silencieux, Cartouche de carbonite. Armures : aucun
  prix dans le classeur.
- Correctif `0.14.2-prix-catalogue` (copies sans prix ou à l'ancienne valeur) : appliqué par l'auteur au
  redémarrage (Arme blanche au choix ×2 → 522c). Le « Blaster lourd » de Kael, créé à la main (3d6, 4500c), n'est pas
  une copie : non touché.
- `objets-depart.mjs` : Couteau → Lame (1d4, 25c), Sabre d'entraînement → Sabre d'entraînement jedi.
- Onglet Combat (demande de l'auteur) : plus de bouton d'attaque sur les lignes d'armes (l'attaque passe par la carte
  de tchat au clic sur l'arme), libellé « Dégâts » devant la valeur (`libelleValeur` du partiel `gwLigneObjet`).
- Réserves Lumière / Obscurité (demande de l'auteur) : choix retiré de l'onglet Équipements (boutons peu visibles),
  remplacé dans l'onglet Combat par des pastilles colorées rappelant les points restants. `reserveChoisie()` devient
  publique : une attaque lancée depuis la carte de tchat (pool non précisé) prend le bonus choisi sur la fiche ouverte.
  Vérifié : Lumière 2 → attaque à 14 + 15 = 29 %, Lumière 1 ensuite (Kael restauré, message supprimé).
- Carte de tchat d'une arme (clic pour attaquer) : prix retiré (demande de l'auteur) ; il reste sur les cartes
  d'armure et d'équipement et dans la fiche de l'arme.
- Fiches d'objet (arme, armure, équipement) : onglets réordonnés, Description puis Détails en deuxième, puis
  Holonet (datapad) et Notes MJ ; onglet ouvert par défaut inchangé (Détails, ou Holonet pour un datapad porté).
- **Objets de soin** (demande de l'auteur) : champ `soin` des équipements (nombre, formule ou « max »), bouton
  « Utiliser : regagne N PV » sur la carte de tchat → `GalacticWarsActor#soigner` (plafond PV max) + bilan. Kolto 4,
  Kolto max 6, Matériel médical max (le classeur disait 1d4 / 1d6 pour les Kolto : valeurs de l'auteur retenues).
  Le porteur se soigne lui-même ; l'objet n'est pas consommé. Équipement de départ au nom identique à un équipement
  du compendium → copie de celui-ci (soin, prix, visuel). Correctif MJ `0.14.2-objets-de-soin`. Vérifié sur Kael (PV 10 →
  14 / 16 / 30), restauré.
- « Bage taser » (ligne 63, 5000c) renommé « Taser » à la demande de l'auteur, qui garde deux Taser (25c et 5000c) ;
  fichier `armes/taser-5000c.json` ; correctif MJ `0.14.2-renommer-bage-taser` (copie de Gueran Cell renommée).

## Session du 2026-09-25 (suite 2) — Armes de départ sans dégâts ni compétence (v0.14.0→v0.14.1)

- **Bug remonté par l'auteur** : les armes des personnages posés sur les scènes n'avaient ni dégâts ni compétence.
  Cause : `applyMetier` créait tout l'équipement de départ en type `equipement` (« Sabre laser double ou double lame
  2d8 », « Arme blanche au choix », « Armure intermédiaire +2 »…) — ce n'étaient pas des armes. Les objets de type
  `arme` et les compendiums, eux, étaient intacts (vérifié).
- `helpers/objets-depart.mjs` : 13 correspondances ligne → modèle du compendium (19 lignes d'armes / armures des
  métiers couvertes), nom de la ligne conservé, dés (`2D8`, `1D4 +2`) et bonus (`+2`) de la ligne prioritaires.
  Choix par défaut à valider par l'auteur : Couteau et « Arme blanche au choix » = modèle Arme contondante (1d6) ;
  « Arme lourde (…) » = Blaster lourd en Canon lourd ; « Sabre d'entraînement 1d6 » = Sabre laser à 1d6 ;
  « Blindage supplémentaire +4 » = armure +4 ; Griffe, Bras explosif, Scalpel laser restent des équipements.
- Correctifs MJ `0.14.1-armes-depart` (6 objets convertis dans le monde de test : Alek, Kael, token Gueran Cell,
  token Alek) et `0.14.1-visuels-par-nom` (Blaster lourd de Kael). **Piège** : un token non lié hérite des objets de
  son acteur de base ; convertir l'objet sur la base puis sur le token en créait deux (token Alek, réparé). Les objets
  hérités sont désormais triés avant toute conversion et seulement mis à jour sur le token. Rejoué sur un acteur +
  token jetables : aucun doublon, état « porté » du token conservé.
- Fiche d'objet générique (race, métier, talent, pouvoir, école) : `data-edit="img"` (inopérant en ApplicationV2)
  remplacé par l'action `editImage` (FilePicker). Les fiches arme / armure / équipement l'avaient déjà.

## Session du 2026-09-25 (suite) — Onglet Combat, attaque / défense, dégâts appliqués (v0.13.3→v0.14.0)

- **Choix de l'auteur** : onglet Combat = armes portées, protection, compétences de combat, compétences liées à la
  Force accessibles (si sensible) ; initiative 1d20 ; dégâts réduits automatiquement par les armures, appliqués par le
  MJ seul, aux tokens sélectionnés. Demande complémentaire : l'attaque d'une cible déclenche sa défense (Parade/esquive
  ou Protection de la Force, toujours les deux), meilleure marge l'emporte ; mêlée / distance d'après la compétence.
- Onglet : `PersonnageSheet#preparerCombat`, réutilise les lignes d'inventaire (partiel `gwLigneObjet` sorti du bloc
  Équipements, bouton Dégâts `degatsRapide`) et les cartes de favoris pour les compétences.
- `helpers/combat.mjs` (carte « Défense », verdict `attaqueLEmporte`), `GalacticWarsActor#reductionDegats` /
  `#encaisserDegats`, bouton « Appliquer les dégâts » dans `helpers/chat-objet.mjs` (flag `degats` du jet).
  `rollCompetence` renvoie aussi `cible` (taux effectif).
- Vérifié (Playwright, Kael Dorn restauré) : onglet (1 arme / 1 armure portées, réduction 2, 7 compétences — Sabre
  laser absent car réservé — Force : Protection de la force + Spiritisme une fois sensible), verdicts (5 cas),
  carte Défense (Protection grisée pour une cible non sensible) et verdict « touche », bouton Appliquer présent,
  encaissement (réduction 2, PV plancher 0, dégâts ≤ réduction = 0).
- `scripts/verify-local.mjs` : option `GW_SCREENSHOT=<fichier.png>` (capture après le contrôle).
- **Limite** : les PNJ (fiche rapide) n'ont pas de PV dans leur modèle → dégâts non applicables (avertissement) et
  défense à résoudre par le MJ.

## Session du 2026-09-25 — Reprise : compétences des armes, plafond de 90 % (v0.13.2→v0.13.3)

- Foundry local redémarré sur la v0.13.2 : visuels des compendiums chargés (armes 10/10, armures 3/3) ; tous les
  correctifs MJ en attente étaient appliqués (Kael Dorn : « Arme contondante/blanche » acquise par métier, 2 datapads,
  image d'Alek unifiée).
- **Choix de l'auteur** : Lance-roquette → Canon lourd ; Grenade, Grenade militaire → Artifice ; Trident sith →
  Arme contondante/blanche (`packs/_source/armes`) + correctif MJ `0.13.3-competences-armes` (copies encore sans
  compétence seulement).
- **Plafond de 90 %** (choix de l'auteur) : l'ajustement n'est plus verrouillé mais seulement limité à la baisse —
  champ grisé avec `max` = valeur actuelle, et `PersonnageSheet#_processFormData` ramène toute hausse saisie au
  clavier à la valeur actuelle.

## Session du 2026-09-24 — Récapitulatif : v0.12.1 → v0.13.2 (7 versions)

Vue d'ensemble ; le détail de chaque changement est dans les entrées « 2026-09-24 (suite …) » ci-dessous.

| Version | Contenu principal |
|---|---|
| v0.12.1 | Box Crédits (chiffres groupés, retour à la ligne, police réduite) ; notes de version au MJ après mise à jour ; README : installation par manifeste (dépôt public) |
| v0.12.2 | Lumière / Obscurité en jauge bleu ↔ rouge ; fenêtre MJ des mises à jour de contenu (modèle antique, adapté : les correctifs visent les copies du monde) |
| v0.12.3 | Tableau Traits (onglet Informations) ; images affichées entières (portrait, ethnie, PNJ) |
| v0.12.4 | Compétences favorites ; tag « Caché » ; fiche d'objet réparée (`context.item` manquant : elle n'avait jamais fonctionné) |
| v0.13.0 | Refonte des objets (orchestration multi-agents : fiches, inventaire, cartes de tchat, revue croisée) ; boucliers ; tout rangé par défaut ; bouton crayon en édition ; compétence « Arme contondante/blanche » (8 métiers) ; libellé « Blaster/Lancer » ; 4 armes au type invalide corrigées |
| v0.13.1 | Gain d'XP (+5 %) et plafond des compétences à 90 % |
| v0.13.2 | Datapad + onglet Holonet (Infos du PJ, synchronisé, défilement) ; critiques 1-5 / 96-100 ; compétences manquantes complétées partout (tokens, compendiums du monde, macro) ; portrait = image acteur = image token ; visuels des objets (`asset_visuel/objets/`) |

**Choix de l'auteur pris en compte** : boucliers = emplacement d'armure ; objets rangés par défaut (existants compris) ;
« Arme contondante/blanche » à −10 % hors métier, bonus 0 dans les métiers ; critiques fixes 1-5 / 96-100.

**Pièges retenus** : une nouvelle feuille de style déclarée dans system.json ne se charge qu'après **redémarrage** de
Foundry (comme les packs) ; `foundry.applications.instances` est une Map ; `#chat-log` n'existe plus en v14 ; un test
Playwright qui modifie des données doit restaurer dans un `finally` (un plantage a laissé des Infos de test sur Kael
Dorn — l'original a été retrouvé dans le journal LevelDB `data/actors/*.log` du monde).

**À faire à la reprise** :
- Foundry local à **redémarrer** pour voir les visuels des compendiums (les packs de la v0.13.2 ne sont pas encore chargés ;
  le code et les images, eux, sont déployés).
- Au prochain chargement MJ du monde de test : correctifs à valider dans la fenêtre (acquisition « Arme contondante/blanche »
  de Kael Dorn, arme contondante copiée, 2 datapads, image d'Alek, 4 visuels d'objets).
- Compétence liée à choisir pour Lance-roquette, Grenade, Grenade militaire, Trident sith (vides).
- Point à valider : ajustement verrouillé au plafond de 90 % (impossible de le baisser sans le MJ) — garder ou autoriser la baisse ?
- Todo restante : **onglet Combat** (contenu à préciser par l'auteur), **Comlink** (canaux + messagerie ; le champ « Appareil »
  comlink est déjà prêt).

## Session du 2026-09-24 (suite 6) — Datapad / Holonet, critiques, images, visuels d'objets (v0.13.1→v0.13.2)

- **Appareils** : champ `appareil` sur les équipements (`GW.appareils` : datapad, comlink — ce dernier réservé au futur
  Comlink de la todo) ; `helpers/appareils.mjs::appareilSelonNom` reconnaît « Datapad », « ComLink »… — utilisé par
  `applyMetier` (équipement de départ) et par le correctif MJ `0.13.1-appareil-datapad` (2 datapads dans le monde de test).
- **Holonet (demande de l'auteur)** : onglet de la fiche d'un datapad (ouvert par défaut quand il est porté par un
  personnage ; bouton globe sur sa ligne d'inventaire). Navigateur sur `system.notes` du porteur — les Infos de
  l'onglet Notes, donc synchronisées par construction : barre précédent / suivant / accueil, adresse
  `holonet://<perso>/infos/<titre>`, recherche filtrée dans le DOM (focus conservé), mots-clés cliquables, résultats
  façon moteur de recherche, page d'info. Création / modification / suppression par les fenêtres de `helpers/notes.mjs`
  (les mêmes que l'onglet Notes). Rafraîchi par un hook `updateActor` (retiré à la fermeture). Hors ligne si le
  datapad n'est porté par personne.
- **Incident de test** : un premier test a planté avant sa restauration et laissé des Infos de test sur Kael Dorn ;
  l'Info d'origine (« Premier contact ») a été retrouvée dans le journal LevelDB du monde (`actors/000092.log`) et
  restaurée à l'identique. Les tests Playwright restaurent désormais dans un `finally`.
- **Règle de jet (demande de l'auteur)** : 1d100 ≤ 5 = réussite critique, ≤ taux = réussite, > taux = échec,
  ≥ 96 = échec critique, quel que soit le taux (`GW.seuilReussiteCritique` / `GW.seuilEchecCritique`, dans
  `resoudrePourcentage`, donc aussi pour les jets de PNJ en %). Auparavant : réussite critique ≤ 10 % du taux.
  Vérifié avec dé forcé (taux 14) : 1, 5 → RC ; 6, 14 → R ; 15, 95 → É ; 96, 100 → ÉC.
- **Compétences manquantes sur des fiches existantes (bug remonté par l'auteur)** : la migration du `ready` ne
  parcourait que `game.actors`. `completerToutesLesFiches()` (helpers/migration.mjs) couvre aussi les tokens non liés
  (données propres qui masquent l'acteur de base) et les compendiums Actor du monde déverrouillés ; appelée à chaque
  chargement MJ, exposée en macro `game.galacticWars.completerCompetences()` (bilan en notification) et en correctif
  MJ `0.13.2-competences-manquantes`. Dans le monde de test, les 6 fiches avaient déjà leurs 38 compétences. Vérifié :
  acteur 37 → 38 et token non lié 36 → 38, second passage sans effet, données restaurées.
- **Image unique par acteur (bug remonté par l'auteur)** : les fiches affichaient `system.portrait`, indépendant de
  `img` et du token. `GalacticWarsActor` (documents/actor.mjs) unifie les trois à la création (portrait personnalisé,
  sinon img) et à chaque changement du portrait ou de l'image (`_preUpdate`), puis met à jour les tokens posés (liés, ou
  affichant l'ancienne image) dans `_onUpdate` côté auteur. Vaut pour les 4 fiches. Correctif MJ
  `0.13.2-image-unique-acteurs` pour l'existant (monde de test : Alek, portrait personnalisé mais acteur et token
  par défaut). Vérifié : portrait → img + token + token posé ; img → portrait + token ; création ; restauration.
- **Holonet : barre de défilement (bug)** : la section, élément flexible en overflow:hidden, rétrécissait et coupait
  le contenu. Barre d'adresse fixe, page défilante (`.holonet-page` en overflow-y:auto) — vérifié avec 12 infos.
- **Visuels des objets (demande de l'auteur)** : 23 des 24 objets des compendiums Armes / Armures / Équipements
  illustrés avec les images de `asset_visuel/item/` (fournies par l'auteur, jusqu'ici inutilisées), copiées sous des noms
  ASCII dans `asset_visuel/objets/` (dossier versionné, ~3,4 Mo, ajouté au déploiement et à la release ; `item/` intact).
  Rayon tracteur : icône Foundry `icons/magic/control/debuff-energy-hold-levitate-teal-blue.webp`. Datapad / comlink :
  `IMAGES_APPAREILS` (équipement de départ des métiers). Correctif MJ `0.13.2-icones-objets` : remplace seulement les
  icônes génériques (`IMAGES_GENERIQUES`) des copies — 4 objets dans le monde de test. `deploy-local.ps1 -NoRestart` copie
  désormais aussi les images (servies sans redémarrage) ; les packs, eux, attendent le prochain redémarrage de Foundry.
- Vérifié : ouverture depuis l'inventaire, recherche, filtre #rebellion, adresses, précédent / suivant, synchro depuis
  la fiche, modification et création depuis l'Holonet visibles dans Notes → Infos, aucune erreur JS.

## Session du 2026-09-24 (suite 5) — Gain d'expérience et plafond à 90 % (v0.13.0→v0.13.1)

- **Bouton « Gain d'XP » (todo)** dans l'en-tête, à côté d'Édition (propriétaire seulement) : passe la fiche en édition,
  ouvre une fenêtre avec le texte de l'auteur et la liste des compétences éligibles (ni bloquées ni au plafond,
  « 88 % → 90 % ») ; +`GW.gainExperience` (5) ajouté à l'ajustement, limité au plafond ; message dans le tchat
  (« X gagne +5 % en … (a % → b %) ») pour le MJ.
- **Plafond (`GW.plafondCompetence` = 90)** dans `prepareDerivedData` : total = min(90 + bonus racial positif, calcul) —
  « à part avec des effets ou une ethnie ». Les effets n'existent pas encore dans le système. `atteintPlafond` →
  ajustement grisé en édition (input caché conservé : ArrayField). Aucun personnage du monde de test n'était au-delà.
- Vérifié (Playwright) : bascule en édition, +5 % (14 → 19), 88 → 90 (+2), compétence au plafond retirée de la liste,
  ajustement grisé et conservé après une sauvegarde, ajustement manuel de 200 ramené à 90, données restaurées.

## Session du 2026-09-24 (suite 4) — Refonte des objets (v0.12.4→v0.13.0)

Choix de l'auteur : boucliers = armures d'emplacement « bouclier » ; tout objet **rangé** par défaut (y compris
les existants — donc aucun correctif de contenu nécessaire) ; réalisation en orchestration multi-agents.

- **Socle (orchestrateur)** : `data/objet-base.mjs` (quantité, prix, porté, tags, description, notes MJ) partagé par
  arme / armure / équipement ; arme + portée ; `GW.emplacementsArmure` (plastron, casque, bras, jambes, bouclier) ;
  deux feuilles dédiées `styles/objets.css` et `styles/inventaire.css` (déclarées dans system.json).
- **Fiches d'objet (agent 1)** : templates `item/arme|armure|equipement-sheet.hbs` + partiels, choisis par
  `_configureRenderParts` (race / métier / talent / pouvoir / école gardent `item-sheet.hbs`) ; en-tête image entière
  (FilePicker), badge de type, interrupteur porté, « Montrer dans le tchat » ; onglets Détails / Description / Notes du
  MJ (MJ seul) ; compétence en liste (valeur hors liste conservée), taux du porteur, Attaquer / Dégâts.
- **Inventaire + tchat (agent 2)** : `GalacticWarsItem` : `afficherDansTchat`, `attaquer({pool})` (décrémente
  lui-même la réserve), `lancerDegats` (partie valide de la formule, reste en note, mention Instable),
  `basculerPorte` ; carte `templates/chat/objet-carte.hbs`, boutons gérés par `helpers/chat-objet.mjs`
  (renderChatMessageHTML, retirés si ni MJ ni propriétaire) ; objet caché → murmure MJ + auteur. Inventaire :
  lignes image / badges / valeur, rangé grisé, réduction totale des armures portées, attaque rapide ; clic = tchat,
  clic droit = porter / ranger, tags, tchat, fiche, suppression confirmée. `rollCompetence` : option `titre`.
- **Revue (2 agents)** : bloquant trouvé — `GW.emplacementsArmure` redéfini plus bas dans config.mjs par une
  ancienne liste inutilisée (écrasait « bouclier ») : supprimée avec `GW.typesEquipement` (inutilisé). Corrigés
  aussi : sections de la fiche d'objet héritant du flex de `.galactic-wars section`, libellé d'emplacement hors
  liste, « +15 % » en dur (→ `GW.bonusAlignement`).
- **Bug de données ancien** : 4 armes du compendium (Lance-roquette, Grenade, Grenade militaire, Trident sith)
  avaient `type: "armé"` → documents invalides, jamais ajoutables. Corrigé ; compétence liée toujours vide (à
  fixer par l'auteur).
- **Piège de déploiement** : une nouvelle feuille de style déclarée dans system.json n'est chargée qu'après un
  **redémarrage** de Foundry (manifeste lu au démarrage) — comme les packs.
- Vérifié dans Foundry (Playwright + captures) : porter / ranger (ligne et menu), carte + Attaquer / Dégâts
  (3d6 + explosion → 3d6), carte cachée en murmure, fiches à 480 px sans défilement horizontal, taux en direct,
  emplacement Bouclier, fiche de race inchangée, aucune erreur JS. Ajustements : fond sombre de l'image de carte,
  bouton d'édition des textes toujours visible.
- **Demande de l'auteur** : en mode édition de la fiche, bouton crayon (doré) sur chaque ligne d'inventaire →
  fiche de l'objet (action `ouvrirObjet`), sans envoyer de carte au tchat. Absent hors édition. Vérifié.
- **Compétence manquante (bug remonté par l'auteur)** : « Arme contondante et blanche » (`armeBlanche`, Corps,
  compétence générale −10 % hors métier — choix de l'auteur). Présente dans la grille source (`Template corriger.xlsx`)
  mais jamais créée ; point ouvert de la feuille de route soldé. Accordée (bonus 0, recommandée) par les 8 métiers qui la
  recommandent dans `Metier.docx` V2.6 : Padawan, Apprenti sith, Chasseur de primes, Assassin, Pirate, Contrebandier,
  Mandalorien soldat, Mécanicien (mention « aucune compétence dédiée » retirée des descriptions) ; « Arme contondante » du compendium passée de Bagarre à la nouvelle compétence. Ajout aux personnages
  existants par la migration (38 compétences) ; deux correctifs MJ : acquisition sur les personnages de ces métiers,
  copies de l'arme contondante restées sur Bagarre. Vérifié après redémarrage.
- Libellés renommés à la demande de l'auteur : « Arme contondante/blanche », « Blaster/Lancer » (clés inchangées).

## Session du 2026-09-24 (suite 3) — Favoris, tag Caché, fiche d'objet réparée (v0.12.3→v0.12.4)

- **Compétences favorites (todo)** : champ `favori` dans chaque entrée de `system.competences` (+ input caché
  dans chaque ligne — ArrayField, voir la règle du JOURNAL — et valeur par défaut dans `completerCompetences`).
  Étoile au survol de la ligne (pleine et dorée si favori), bascule par réécriture du tableau complet. Panneau
  « Favoris » en haut de l'onglet Personnage (masqué sans favori) : une carte par compétence, couleur de sa
  caractéristique, total, jet au clic (compétence bloquée : carte désactivée). Vérifié : favori conservé après une
  sauvegarde du formulaire, reste des compétences inchangé, jet lancé depuis le panneau.
- **Tag « Caché » (todo)** : `system.tags` (SchemaField, `data/tags-objet.mjs`) sur arme / armure / équipement,
  catalogue `GW.tagsObjet` extensible. Case dans la fiche d'objet, clic droit sur une ligne d'inventaire
  (Marquer / Retirer « Caché »), badge pointillé et nom en italique dans l'inventaire.
- **Bug trouvé en testant : la fiche d'objet n'a jamais fonctionné** — `ItemSheetV2` ne met pas `item` dans le
  contexte, le template affichait un nom vide et aucune section propre au type, et toute sauvegarde était
  rejetée (nom vide invalide). `context.item = this.item` ajouté. La refonte complète des fiches d'objet (todo,
  modèle antique) reste à faire.

## Session du 2026-09-24 (suite 2) — Traits et images entières (v0.12.2→v0.12.3)

- **Tableau Traits (todo)** : un « trait » = Item `talent` porté (avantage / inconvénient, compendium Talents).
  Section dans l'onglet Informations, entre la description et l'ethnie ; **absente** du rendu tant que le
  personnage n'a aucun trait, sauf en mode édition (`afficherTraits`). En édition : bouton + (choix dans le
  compendium Talents, doublon par nom refusé, `compendiumSource` renseigné pour les futurs correctifs de
  contenu) et suppression par ligne ; le nom ouvre la fiche de l'objet. Glisser-déposer d'un talent : géré par
  ActorSheetV2. Fonds de lignes / en-tête hérités des tableaux Foundry neutralisés.
- **Images entières (todo)** : portrait du PJ et vignettes des PNJ passés de `object-fit: cover` (recadrage) à
  `contain` sur le fond du cadre ; portrait d'ethnie borné à 260 × 320 en taille intrinsèque (le cadre épouse
  l'image). Vérifié : rapport largeur/hauteur affiché = rapport de l'image source.
- Aucune donnée existante modifiée : pas d'entrée `PACK_UPDATES` nécessaire.

## Session du 2026-09-24 (suite) — Lumière/Obscurité visuelle et mises à jour de contenu (v0.12.1→v0.12.2)

- **Lumière / Obscurité (todo)** : jauge d'équilibre (piste bleu → violet → rouge, repère central, curseur
  lumineux positionné à 50 % + 5 % par point d'écart), valeurs en grand de chaque côté, libellé de tendance
  (Équilibre / Penche vers… / … dominante, seuil à 4 points d'écart), carte teintée par `color-mix` selon la part
  d'Obscurité et plus lumineuse quand la réserve dominante monte (`--rouge`, `--intensite` en style inline,
  calculés par `#preparerEquilibre`). Points de réserve passés de 6 à 10 px avec halo. Vérifié par captures à
  0/0, 3/3, 8/1, 2/5, 1/10.
- **Mises à jour de contenu (demande de l'auteur, modèle antique)** : `helpers/pack-updates.mjs` (registre
  `PACK_UPDATES`, réglage monde `correctifsAppliques`) + fenêtre MJ `apps/pack-update-picker.mjs` ouverte au
  `ready` après les notes de version. Différence avec antique : les compendiums système sont remplacés par
  Foundry à chaque mise à jour, les correctifs visent donc les **copies** dans le monde (objets importés,
  objets portés, personnages, tokens non liés) par champs ciblés. Chaque entrée compte ses documents concernés ;
  0 = marquée appliquée sans rien demander (monde neuf ou déjà à jour). Boutons Appliquer / Ignorer (avec
  confirmation) / Plus tard. Outils réutilisables : `tousLesActeurs()`, `copiesDivergentes(pack, champs)`,
  `synchroniserCopies(pack, champs)` ; `competencesSelonMetier()` extrait de `applyMetier`. Deux premiers
  correctifs : portraits d'ethnie sur les races copiées, bonus de compétences des métiers réalignés. Testé sur
  des documents temporaires désynchronisés (1 race à image obsolète, 1 personnage Contrebandier sans
  acquisitions) : fenêtre affichée, les deux corrigés, 37 compétences conservées, documents supprimés ensuite.
  Dans le monde de test, rien n'était concerné.

## Session du 2026-09-24 — Box Crédits et notes de version MJ (v0.12.0→v0.12.1)

- **Box Crédits (todo)** : l'`<input type="number">` ne pouvait ni grouper les chiffres ni aller à la ligne.
  Affichage remplacé par un texte formaté (espace fine U+2009, sécable, tous les 3 chiffres — purement visuel),
  l'input n'apparaît qu'au clic (Entrée / sortie du champ pour revenir). Retour à la ligne entre groupes,
  puis réduction automatique de la police dans `_onRender` si deux lignes ne suffisent pas. Vérifié dans
  Foundry : 0, 1 500, 1 234 567, 123 456 789 012 (2 lignes), 9 007 199 254 740 991 (police 14,3 px, sans débordement) ;
  la saisie sauvegarde et les 37 compétences restent intactes.
- **Installation par manifeste** : le dépôt `SotarS21/jdr_gw` est public, le manifeste
  `releases/latest/download/system.json` et le zip se téléchargent sans authentification (contrôlé) — la
  chaîne de release existait déjà depuis v0.10.0. Ajout, sur le modèle d'antique, de `helpers/version-check.mjs`
  + `helpers/release-notes.mjs` : au premier chargement après une mise à jour, le MJ voit les notes des versions
  installées depuis la dernière vue (réglage monde caché `derniereVersionVue`). Inactif en déploiement local
  (`manifest` vide dans le dépôt). Pas d'écrasement de compendiums à proposer (contrairement à antique) : les
  packs compilés sont dans le zip, remplacés à chaque mise à jour. README : section Installation + publication.

## Session du 2026-09-23/24 — Récapitulatif : 4 versions publiées (v0.10.0 → v0.12.0)

Vue d'ensemble de la session ; le détail technique de chaque changement est dans les entrées
« 2026-09-23 » ci-dessous.

**Méthode de travail adoptée (demande de l'auteur).** Après un changement commité mais jamais
déployé (« je ne vois pas le correctif dans Foundry »), règle fixée : **valider en local avant tout
push**. Outils : `scripts/deploy-local.ps1` (build des packs, arrêt / copie miroir / relance de
Foundry sur le monde de test, `-NoRestart` pour le code seul, refus si des joueurs sont connectés
sans `-Force`) et `scripts/verify-local.mjs` (connexion MJ headless, version chargée, erreurs JS,
contrôle ciblé ; refuse un monde qui n'est pas Galactic Wars). La commande `/deploy-galactic-wars`
décrit ce flux ; push et tag seulement après accord de l'auteur. Chaque redémarrage de Foundry a été
demandé avant d'être fait (il déconnecte l'utilisateur).

**Versions publiées** (`github.com/SotarS21/jdr_gw/releases`, workflow de release vert à chaque fois) :

| Version | Contenu principal |
|---|---|
| v0.10.1 | Portraits d'ethnie sur les 43 items Race |
| v0.11.0 | Compétences remplies à la création ; caractéristique = plancher du taux ; mode Édition (caractéristiques, race, métier, niveaux, ajustements) ; validation non bloquante des 120 points ; fiche à 940 px ; 12 compétences réservées par métier avec déblocage MJ au clic droit ; point jaune = compétence recommandée par le métier, point violet = compétence liée à la Force ; PV / Force / Crédits dans l'en-tête ; prérequis de métier supprimés ; 5 métiers alignés sur `Metier.docx` (V2.6) |
| v0.11.1 | Points de force en ressource simple ; retouches de la todo (lot 1 : compétences grisées masquées hors édition, jet au clic sur le nom, titres de colonnes, bouton Repos, case Force en édition) ; caractéristiques avec total en grand et couleur par colonne (Corps rouge, Mental bleu, Dextérité vert) ; stress retiré de la fiche classique ; barre de PV colorée |
| v0.12.0 | Onglet Informations (description du personnage, ethnie : portrait, compétences spéciales, modificateurs séparés) ; onglet Notes (Résumés datés, Infos à mots-clés, PNJ avec image et statut, Missions avec importance et statut) en fenêtres d'édition, aperçus limités à 3 / 5 lignes ; portraits agrandis ; éditeurs de texte riche réparés |

**Bugs remontés par l'auteur et corrigés en cours de route** : correctif invisible dans Foundry
(jamais déployé) ; compétences Corps « sans » la valeur de Corps (malus sous la caractéristique) ;
point orange figé au changement de métier ; grisé absent sur les compétences de Force (spécificité
CSS) ; relance automatique de Foundry ratée (verrou `options.json.lock`) ; en-tête du tableau de
compétences désaligné ; description des PNJ impossible à remplir (éditeur écrasé à 0 px) ; aperçu
des cartes réduit à une ligne (paragraphes fusionnés).

**Todo de l'auteur** (`Desktop/todo_foundry_galactic_wars.txt`) : lots 1 et 2 faits. Reste : tag
« Caché » sur l'équipement ; refonte du template des objets inspirée d'Antique (porté / rangé au clic
droit, compétence liée, attaque et dégâts depuis le chat) ; onglet Combat (ligne inachevée dans la
todo) ; Comlink (canaux numérotés, archivage, messagerie MJ / PJ avec « vu ») ; **nouveau** :
recalibrer les images pour qu'elles s'affichent toujours en entier dans leurs emplacements (portrait
du PJ et vignettes des PNJ sont aujourd'hui recadrés en carré).

**Points d'attention** : un personnage déjà doté d'un métier doit le re-choisir pour récupérer les
accès et compétences ajoutés au compendium Métiers (les points jaunes, eux, sont recalculés par la
migration) ; le monde de test Foundry est partagé avec d'autres projets (il est passé sur
« testantique » en cours de session).

---

## Session du 2026-09-23 (suite) — Onglets Informations et Notes, lot 2 de la todo (v0.11.1 → v0.12.0)

**Choix de l'auteur** : édition par fenêtre modale ; mots-clés sur les Infos seulement, sans filtre ; 4 sous-onglets ; les « compétences spéciales » sont celles de l'ethnie → deux onglets séparés, **Informations** (ethnie) et **Notes** (Résumé / Infos / PNJ / Missions). La todo a aussi reçu trois nouveaux blocs (refonte du template des objets inspirée d'Antique avec porté/rangé et jets depuis le chat, onglet Combat inachevé, spécification complète du Comlink et de sa messagerie), gardés pour la suite.

**Données** : `resume` (HTMLField), `notes` gagne `motsCles` (tableau de chaînes ; nom conservé pour ne pas perdre les notes existantes), `pnjs` et `missions` (ArrayField, statuts/importances en `choices` issus de `GW.statutsPnj` / `GW.importancesMission` / `GW.statutsMission`). **Édition** : `helpers/notes.mjs` — `DialogV2.input` avec `<prose-mirror>` pour les textes riches, mots-clés saisis séparés par des virgules (nettoyés, dédoublonnés), écriture par remplacement du tableau complet ; aucun input de ces listes dans le formulaire de la fiche, donc la sauvegarde automatique ne peut pas les altérer. **Informations** : lecture de l'Item race par `system.race.uuid` (`fromUuid`), modificateurs non nuls affichés en étiquettes.

**Vérifié** (personnages temporaires, supprimés ensuite) : création d'une Info (mots-clés « Hoth, base,  Hoth , secret » → [Hoth, base, secret]), réouverture pré-remplie et modification, PNJ « hostile » en rouge, mission principale / en cours puis suppression avec confirmation, compteurs des sous-onglets, sauvegarde du formulaire sans effet sur les listes (37 compétences intactes), frappe réelle dans l'éditeur riche de la modale enregistrée, Résumé modifié et enregistré sur place ; onglet Informations de Kael Dorn : Zabrak, portrait, description, 6 modificateurs ; message d'aide sans ethnie.

Retour de l'auteur : modificateurs de l'ethnie séparés en deux groupes titrés (« Bonus / malus de caractéristiques », « Bonus / malus de compétences », + armure naturelle à part), bonus en vert et malus en rouge. Vérifié sur Kael (Zabrak) : Corps +5 d'un côté, 5 modificateurs de compétences de l'autre.

Section **Description du personnage** en tête de l'onglet Informations (demande de l'auteur) : les 6 champs de `system.infos` (âge, taille, sexe, cheveux, peau, yeux — présents dans le schéma mais jamais affichés sur la fiche classique) + un texte libre `system.description` (nouveau HTMLField). Champs simples de SchemaField, donc sûrs avec la sauvegarde automatique. Vérifié : âge, yeux et description enregistrés.

**Bug remonté : description des PNJ impossible à remplir.** Mesuré : `<prose-mirror>` faisait 160 px mais sa barre d'outils et sa zone de saisie 0 px — mon `display: block` cassait le flex colonne dans lequel Foundry dimensionne ses enfants. Même défaut sur la nouvelle Description. Corrigé (`display: flex; flex-direction: column` + hauteur minimale) : zone de saisie de 230 px dans les 3 fenêtres (PNJ, Mission, Info, bouton Enregistrer visible), 270 px pour le Résumé, 210 px pour la Description.

**Plusieurs résumés datés** (demande de l'auteur) : `system.resumes` (titre, description, date en ms) remplace le résumé unique, géré comme les autres listes (type `resume` dans `helpers/notes.mjs`, date posée par `normaliser` à la création et à chaque modification), affiché du plus récent au plus ancien avec la date locale. `runMigrations` reprend un ancien `system.resume` non vide en premier résumé « Résumé » puis le vide. Vérifié : migration d'un ancien texte, création de 2 résumés, tri, modification → date mise à jour et résumé remonté en tête.

Images agrandies (demande de l'auteur) : portrait d'ethnie 140 → 260 px de large, proportions conservées (plus de recadrage carré, 260×294 pour Zabrak) ; portrait du personnage dans l'en-tête 76 → 128 px (en-tête 145 px en lecture, 180 px en édition, aucun débordement).

Aperçu limité des cartes (demande de l'auteur) : texte coupé à 3 lignes (Infos, PNJ, Missions) ou 5 lignes (Résumés) avec « … » (`line-clamp`) ; texte complet en mode Édition de la fiche (classe `texte-complet`) et dans la fenêtre d'édition. Vérifié par mesure : cartes longues coupées à 3/5 lignes, carte courte intacte, texte complet en mode Édition et dans la modale.

Une seule fenêtre d'édition par entrée (demande de l'auteur) : `helpers/notes.mjs` garde les fenêtres ouvertes par Actor + type + index (`nouvelle` pour le « + ») ; un nouveau clic ramène la fenêtre existante au premier plan (`bringToFront`, `maximize` si réduite) et place le focus dans son premier champ. Commun aux 4 types. Vérifié : double-clic rapide → 1 fenêtre, clic supplémentaire → toujours 1, autre carte → 2, re-clic sur la première → premier plan + focus sur « Nom », réouverture possible après fermeture, double-clic sur « + » → 1.

Correction (retour de l'auteur : « on ne voit qu'une ligne ») : les paragraphes avaient été passés en `display: inline` pour placer le « … », ce qui fusionnait plusieurs lignes courtes en une seule. Paragraphes rétablis en blocs (sans marge) : le décompte porte sur les lignes réellement affichées. Vérifié : 2 lignes → 2, 6 lignes courtes → lignes 1 à 3 puis coupé, long paragraphe → 3 lignes, résumé de 8 lignes → 5 ; tout visible en mode Édition.

Image de PNJ (demande de l'auteur) : champ `img` (FilePathField image) sur `system.pnjs`, saisi dans la fenêtre via l'élément natif `<file-picker type="image">` (champ + bouton de parcours Foundry) ; vignette 72×72 à gauche de la carte, bordée de la couleur du statut. Vérifié : champ présent, chemin enregistré, vignette chargée sur la carte avec image, carte sans image inchangée, chemin pré-rempli à la réouverture.

**Fichiers** : `module/helpers/notes.mjs` (nouveau), `module/data/actor-personnage.mjs`, `module/config.mjs`, `module/sheets/personnage-sheet.mjs`, `templates/actor/personnage-sheet.hbs`, `lang/fr.json`, `styles/galactic-wars.css`, `system.json`, `CAHIER_DES_CHARGES.md`.

---

## Session du 2026-09-23 (suite) — Points de force en ressource simple (v0.11.0 → v0.11.1)

**Todo de l'auteur (`Desktop/todo_foundry_galactic_wars.txt`) — lot 1, retouches de la fiche classique.** Liste regroupée en 4 lots (1 : retouches de fiche ; 2 : onglet Informations restructuré — PNJ, Missions, Résumé, Info importante, mots-clés ; 3 : tag « Caché » sur l'équipement ; 4 : Comlink, canaux + messagerie, à spécifier). Choix de l'auteur : lot 1 d'abord ; « compétences non utilisées » = compétences grisées ; clic **gauche** sur le nom pour lancer (le clic droit reste le menu MJ de déblocage) ; points jaune/violet non déplacés, légende seulement renommée. Livré : masquage CSS des compétences grisées hors édition (pas `{{#if}}` : leurs inputs cachés doivent rester soumis, ArrayField) ; case Sensible à la Force en édition seulement ; couleurs PV/Force/Crédits ; ligne de titres Niv./Ajust./Total ; total de caractéristique en 1,7rem ; dé supprimé ; légende « compétence liée à la Force » ; bouton Repos. Vérifié sur Kael Dorn : 25 lignes visibles / 12 grisées masquées en lecture, visibles en édition ; clic sur Bagarre → message « Bagarre (cible 30%) » (supprimé après test) ; Repos → 30/30 ; sauvegarde hors édition sans perte sur les compétences ; aucun débordement.

Retour de l'auteur : les titres doivent former un vrai en-tête de tableau, chacun au-dessus de sa colonne. Cause : la ligne de titres n'avait que la classe `skill-row` (colonnes définies) sans le `display: grid` porté par `.competence-row` — ses titres s'empilaient au centre. Ajout de `display: grid` + même `gap`, et d'un titre « Nom ». Vérifié par mesure : bords gauche/droit de chaque titre identiques à ceux des cellules, dans les 3 colonnes, en lecture et en édition.

Caractéristiques réorganisées (retour de l'auteur) : total affiché en premier et en très grand (2,6rem), valeur saisie + modificateur racial en dessous ; info-bulles Total / Input / Bonus racial. Vérifié : ordre correct dans les 3 blocs, en lecture et en édition, sauvegarde de la base OK, aucun débordement.

Couleur par caractéristique (demande de l'auteur) : Corps rouge, Mental bleu, Dextérité vert — classe `car-<cle>` sur chaque colonne, variable CSS `--car-couleur` appliquée au libellé, au grand total, à la bordure/fond du bloc et aux pourcentages des compétences de la colonne ; les compétences grisées restent grises (règle de grisé plus spécifique). Vérifié par couleurs calculées dans les 3 colonnes.

Stress retiré de la fiche classique (demande de l'auteur, futur système d'états actifs) : carte supprimée, en-tête en 3 colonnes ; `system.stress` gardé dans le schéma et vérifié intact après une sauvegarde. Le Stress de la fiche rapide (une des 8 caractéristiques de jet) n'est pas touché.

Valeur des points de force centrée dans sa carte (demande de l'auteur). Vérifié : centre de l'input = centre de la carte.

Barre de progression des PV (demande de l'auteur) sous la valeur, dans la carte PV : pourcentage calculé dans `_prepareContext` (borné 0–100, 0 si PV max = 0), seuils vert > 50 % / orange 25–50 % / rouge < 25 %. Vérifié sur Kael (30 PV max) : 30 → vert 100 %, 12 → orange 40 %, 3 → rouge 10 %, 0 → rouge 0 % ; PV restaurés. Puis, à la demande de l'auteur, remplissage ancré à droite : la barre se vide de gauche vers la droite (vérifié par mesure à 12/30).

Au passage, `verify-local.mjs` refuse désormais de se connecter si le monde actif n'est pas un monde Galactic Wars (le serveur avait basculé sur « testantique » en cours de session ; l'auteur a relancé le bon monde lui-même).

**Points de force** (demande utilisateur : « une ressource utilisable, pas une valeur sur une autre ») : la carte de l'en-tête n'affiche plus que `system.pointsDeForce.value` (min 0), sans séparateur ni maximum. Schéma inchangé (`ressource(0)`, `.max` ignoré) pour ne pas avoir à migrer les Actors existants. Vérifié : un seul input, sauvegarde OK, en-tête sans débordement.

---

## Session du 2026-09-23 (suite) — Mode édition, largeur, compétences réservées (v0.10.2 → v0.11.0)

**1. Mode édition (demande utilisateur).** Bouton « Édition » avec cadenas à côté du nom sur la
fiche classique. Verrouillé : caractéristiques de base en lecture seule (`<span>` au lieu de
l'`<input>` — un champ de `SchemaField` absent du formulaire est simplement ignoré à la
sauvegarde, sans risque type `ArrayField`), boutons « Choisir » race/métier masqués (et les
actions refusées côté code). Déverrouillé : comme avant. État tenu par l'instance de fiche
(`#modeEdition`, même principe que `#ongletActif`), pas persisté ; ouvert d'office sur un
personnage vierge. Portée volontairement limitée à ce qui a été demandé (caractéristiques, race,
métier) : niveau, compétences et ressources restent toujours modifiables. Vérifié en direct sur
Kael Dorn : verrouillé → 0 input de base, 0 bouton « Choisir » ; déverrouillé → 3 inputs, 2
boutons, modification de Mental sauvegardée (37 compétences intactes), valeur restaurée ensuite.

**2. Largeur de la fiche (demande utilisateur : plus de barre de défilement horizontale à
l'ouverture).** Mesuré : à 720 px, `.sheet-body` débordait (745/684 px) à cause des lignes de
compétences — les libellés longs ("Informatique/piratage"...) fixent une largeur minimale à chaque
colonne. Aucun débordement à partir de ~920 px ; largeur par défaut passée à 940 px. Vérifié sur les
5 personnages classiques du monde : `scrollWidth` = `clientWidth` (904 px).

**3. Niveaux de compétence et ajustements manuels rattachés au mode édition (demande
utilisateur).** Hors édition : niveau affiché en lecture seule, ajustement manuel masqué (colonne
retirée de la grille). Piège évité : `system.competences` est un `ArrayField`, donc retirer ces
`<input>` du formulaire les aurait remis à 0 à la première sauvegarde (même mécanisme que le bug du
2026-09-15) — ils restent soumis en `<input type="hidden">`. Vérifié : sauvegarde hors édition →
tableau de compétences identique octet pour octet.

**4. Compétences réservées à un métier (demande utilisateur, règle proposée puis validée).**
Analyse de la mise en forme conditionnelle des fiches Excel classiques (lue directement dans le XML
des `.xlsx`, SheetJS ne l'expose pas) : le jaune marque les compétences accordées par le métier
choisi, le gris (police gris clair) ne vise que 6 compétences, chacune réservée à un métier — même
jeu de règles dans 15 fiches dont `Template corriger.xlsx`, variantes partielles/cassées (`#REF!`)
dans quelques autres. Écarts relevés avec le compendium et tranchés par l'auteur : Drain/Éclair de
force → Guerrier sith **et Jedi Noire** (aucun métier ne les accordait) ; Sécurité → Voleur + Agent
secret (cumul) ; Médecine → Médecin + Soldat médecin (cumul). Règle retenue : bloquée = grisée,
niveau compté 0, jet refusé (bouton désactivé + garde dans `rollCompetence`), info-bulle joueur
« Seul le MJ peut débloquer la compétence. » ; le MJ débloque/rebloque par clic droit (`ContextMenu`
v14, `label`/`visible`/`onClick`), stocké dans le nouveau champ `debloquee` et mis à jour par
remplacement du tableau complet. Vérifié sur Kael Dorn (Contrebandier) : 6 compétences bloquées, 6
surlignées, menu « Débloquer » puis « Rebloquer », état restauré après test. Le compendium Métiers
modifié ne sera visible qu'après redémarrage de Foundry.

**6. Appel à la rage réservée** (demande utilisateur) à Apprenti sith, Guerrier sith et Jedi Noire : `reservee: true` + ajoutée aux métiers Guerrier sith et Jedi Noire du compendium (Apprenti sith l'accordait déjà ; aucun autre métier ne l'accordait).

**7. Méditation de la force réservée** (demande utilisateur) à Jedi consulaire, Jedi Noire et Padawan : `reservee: true` + ajoutée à ces trois métiers du compendium (aucun ne l'accordait jusque-là).

**8. Point orange des compétences (bug remonté : "pas mis à jour quand on change de métier").**
Le point affichait `GW.competences[cle].metier` — un type de compétence fixe (malus -30 %), indépendant
du métier choisi. L'auteur précise qu'il doit représenter les compétences recommandées par les
documents sources pour le métier choisi = les entrées `obligatoire: true` du métier (toutes celles
d'origine ; les accès ajoutés aujourd'hui pour les compétences réservées sont en `obligatoire:
false`). Nouveau champ `recommandee` (+ `<input hidden>`, ArrayField), posé par `applyMetier`
(qui part désormais de `toObject()` plutôt que des données préparées), recalculé par `runMigrations`
pour les personnages déjà dotés d'un métier. Légende : « compétence recommandée par le métier ».
Vérifié sur Kael Dorn : Contrebandier → 6 points, Voleur → 3 (Sécurité accessible sans point),
retour Contrebandier → 6, 37 compétences intactes.

**9. Validation non bloquante des 120 points de caractéristique** (demande utilisateur), reprise de la case B4 de `Template corriger.xlsx` (`=SUM(B6,E6,H6)`, mise en forme conditionnelle jaune < 120, vert = 120, rouge > 120). Indicateur `X / 120` en mode édition uniquement, calculé sur les seules bases saisies. Vérifié : 39 (Kael) → jaune, 50+40+30 → vert, 135 → rouge et la valeur est bien sauvegardée ; caractéristiques de Kael restaurées.

**10. PV, Points de force, Stress et Crédits dans l'en-tête** (demande utilisateur) : cartes déplacées (pas dupliquées — deux inputs de même `name` produiraient un tableau à la soumission) dans `.header-ressources`, à droite du nom. Deux ajustements CSS nécessaires, repérés à la mesure : la règle générale `.stat-grid` (plus loin dans le fichier) écrasait les colonnes de l'en-tête, et l'input Crédits en `width: 100%` gonflait sa colonne à 231 px. Résultat : ressources 469 px / nom 319 px, aucun libellé tronqué, aucun débordement. Vérifié : PV modifiés depuis l'onglet Équipements et sauvegardés, 37 compétences intactes.

**11. Suppression des prérequis de métier** (bug remonté : ex. Jedi consulaire exigeait Padawan niveau 4). `verifierPrerequisMetier` et l'option `ignorerPrerequis` supprimés de `helpers/metier.mjs`, ainsi que les 2 messages d'avertissement associés dans `lang/fr.json`. Les champs `prerequis` des Items métier sont conservés (informatifs). Vérifié : Kael Dorn (niveau 3, Contrebandier) → Jedi consulaire accepté, puis retour Contrebandier.

**12. Bouton Édition placé au-dessus du nom** (bug remonté) : `.nom-row` en colonne, bouton avant le champ nom. Vérifié : bouton au-dessus, nom sur toute la largeur, aucun débordement.

**13. Compétences recommandées revues avec `Metier.docx`** (demande utilisateur, citée comme « v2.7 » — le document s'annonce en V2.6 ; seul `asset_fiche_perso/fiche_classique/Metier.docx` existe à côté de `Metier v2.5.docx`). Transcription manuelle des listes « compétence recommander » vers les clés `GW.competences`, puis comparaison avec les entrées `obligatoire: true` du compendium : 15/20 identiques, 5 écarts présentés puis appliqués tels quels à la demande de l'auteur (Jedi consulaire, Padawan, Pilote, Chasseur de primes, Voleur — détail dans le CDC §5.1duodecies). Les accès aux compétences réservées (`obligatoire: false`) sont conservés. Non transcrits : « Arme contondante (et blanche) » (aucune clé, 8 métiers), et les précisions libres (« Sabre laser (niveau 2) », « Chirurgie + 20 % », « Mécanique sur grosse ingénierie »). Les personnages déjà dotés d'un de ces 5 métiers doivent le re-choisir pour en profiter (aucun dans le monde de test).

**14. Point violet des compétences de Force** (demande utilisateur) : le point `dot-force` n'existait que dans la légende ; ajouté sur chaque ligne `estCompetenceForce`. `force: true` étendu à Appel à la rage, Sabre laser et Spiritisme pour correspondre à la liste de l'auteur (11 compétences). Vérifié après redémarrage (avec le compendium Métiers du point 13) : 11 points violets sur Kael Dorn, les 5 métiers corrigés conformes au document.

**15. Compétences Jedi grisées pour les autres métiers** (demande utilisateur) : Poussée de la force, Persuasion de la force, Contrôle télékinétique et Sabre laser passent en `reservee: true` (Méditation de la force l'était déjà). Conflit signalé puis tranché par l'auteur : Sabre laser est recommandée par `Metier.docx` pour Apprenti sith et Guerrier sith → ils la gardent. Accès ajoutés (`obligatoire: false`) : Poussée de la force → Padawan, Jedi Noire ; Persuasion de la force → Padawan.
Puis, côté sith (demande suivante) : Poussée, Drain, Persuasion, Contrôle par la force, Éclair de force et Sabre laser grisés pour tout métier autre qu'Apprenti sith, Guerrier sith et Jedi Noire, « sauf certaines compétences pour les Jedi » — interprété comme l'union des deux règles (les accès Jedi restent). Accès ajoutés : Apprenti sith (Poussée, Drain, Persuasion, Contrôle par la force, Éclair), Guerrier sith (Poussée, Persuasion), Jedi Noire (Contrôle par la force).

**16. Grisé invisible sur les compétences de Force bloquées** (bug remonté : « le grisé n'est pas le même que pour Médecine »). Données correctes (12 compétences bloquées partout, cadenas, jet désactivé, % gris), mais le libellé restait violet : `.competence-row.force .label` a la même spécificité que la règle du grisé et se trouve plus loin dans le fichier. Sélecteur du grisé renforcé (`.competence-row.skill-row.bloquee`), et points jaune/violet atténués sur une ligne bloquée. Vérifié : les 12 libellés bloqués ont la même couleur grise.

**5. Info-bulle « Total »** au-dessus du pourcentage de chaque compétence (demande utilisateur), même principe que les info-bulles « Niveau » / ajustement. Vérifié : 37/37, affichée au survol.

**Fichiers modifiés** : `templates/actor/personnage-sheet.hbs`, `module/sheets/personnage-sheet.mjs`,
`module/config.mjs`, `module/data/actor-personnage.mjs`, `module/helpers/migration.mjs`,
`module/helpers/rolls.mjs`, `packs/_source/metiers/{guerrier-sith,jedi-noire,voleur}.json`,
`lang/fr.json`, `styles/galactic-wars.css`, `system.json`, `CAHIER_DES_CHARGES.md`.

---

## Session du 2026-09-23 (suite) — Compétences à la création + plancher de caractéristique (v0.10.1 → v0.10.2, jamais publiée seule)

**1. Compétences remplies à la création (CDC §10 item 15).** `PersonnageData._preCreate` complète
`system.competences` avec les 37 clés de `GW.competences` (helper `completerCompetences` extrait de
`helpers/migration.mjs`, que la migration réutilise). Les entrées fournies à la création (import de
compendium, duplication) sont conservées. Vérifié en direct : Actor vierge → 37 compétences, aucune
`cle` vide ; Actor créé avec `[{cle:"blaster", niveau:2}]` → 37 compétences, blaster toujours niveau 2.

**2. Bug remonté par l'utilisateur : les compétences liées à Corps ne reprenaient pas la valeur finale
de Corps.** Diagnostic : Corps était bien additionné, mais le malus de non-acquisition (-10 %, ou
-30 % pour une compétence de métier) s'appliquait au total et le faisait passer sous la
caractéristique (Kael Dorn, Corps 20 : Blocage 10 %, Canon lourd 0 %). Règle précisée par
l'utilisateur : la valeur finale de la caractéristique est un minimum affiché sur chaque compétence
liée, le niveau et les bonus s'y ajoutent. Nouveau calcul : `caractéristique + max(0, barème + racial
+ métier + ajustement + malus)`. Même chose pour Mental et Dextérité. Vérifié sur la fiche de Kael
Dorn : toutes les compétences Corps ≥ 20 % (Bagarre 30 %), Mental ≥ 10 %, Dextérité ≥ 14 %.

**3. Script de déploiement : relance ratée.** Première utilisation avec redémarrage : Foundry,
relancé 2 s après avoir été tué, a refusé de démarrer ("directory which is already locked by another
process") parce que le verrou `Config/options.json.lock` n'était pas encore considéré comme
abandonné. L'utilisateur a relancé Foundry à la main. `deploy-local.ps1` attend désormais que ce
verrou ne soit plus rafraîchi depuis 15 s avant de relancer — validé ensuite en conditions réelles (redémarrage v0.11.0 réussi du premier coup).

**Fichiers modifiés** : `module/data/actor-personnage.mjs`, `module/helpers/migration.mjs`,
`scripts/deploy-local.ps1`, `system.json`, `CAHIER_DES_CHARGES.md`.

---

## Session du 2026-09-23 — Portraits des races (v0.10.0 → v0.10.1)

**Portraits appliqués aux 43 items du compendium Races.** Piste notée à la fin de la session
précédente : les items Race utilisaient tous le placeholder `icons/svg/oak.svg` alors que les
portraits d'ethnies sont versionnés (et embarqués dans la release) depuis `0b539ee`. Le champ
`img` de chaque `packs/_source/races/*.json` pointe maintenant vers
`systems/galactic-wars/asset_visuel/Ethnie/<fichier>`, en réutilisant la correspondance déjà
établie pour le "Codex des espèces" (source de vérité : le `src` de l'image de chaque page du
codex) plutôt qu'en refaisant une normalisation de noms. 3 races ont un nom d'item différent du
titre de page : "Devaronian (mâle) Devaron" → Devaronian, "Les hommes des sable ou Tusken
Raider" → Tusken Raider, "Robot" → droïde de combat (même choix que dans le codex). Existence
de chaque fichier vérifiée sur disque avant écriture ; 43/43, aucun manquant. Packs recompilés
(`npm run pack:build`).

**Fichiers modifiés** : `packs/_source/races/*.json` (43 fichiers, champ `img` uniquement),
`system.json` (version), `CAHIER_DES_CHARGES.md` (§5.1decies).

**Refonte du déploiement local (remontée utilisateur : "je ne vois pas le correctif dans
Foundry").** Cause : rien n'avait été déployé — le dossier système de Foundry était resté sur
`5747755` (v0.10.0) — et l'ancienne commande `/deploy-galactic-wars` (`Copy-Item` à chaud +
"faites Ctrl+F5") ne pouvait de toute façon pas marcher pour un compendium : les packs LevelDB sont
verrouillés tant que le monde tourne, seul un redémarrage de Foundry les fait relire. Nouvelle
procédure, **validation locale obligatoire avant tout push/tag** :
- `scripts/deploy-local.ps1` : build des packs → arrêt de Foundry (refuse, code 2, si des
  utilisateurs sont connectés, sauf `-Force`) → copie miroir `robocopy /MIR` du seul contenu de
  la release → relance de l'appli desktop avec `--world=galacit-wars-v-final` → contrôle que
  `/api/status` annonce la version de `system.json`. `-NoRestart` pour du JS/CSS seul.
- `scripts/verify-local.mjs` : connexion MJ headless (Playwright du cache npx), contrôle de
  `game.system.version`, erreurs JS de la page, et évaluation d'un contrôle ciblé passé en argument.
- La commande `/deploy-galactic-wars` (`VTT_Foundry/.claude/commands/`) décrit ces étapes et
  interdit push/tag avant vérification + accord de l'utilisateur.

Vérifié : Foundry relancé en v0.10.1, les 43 races du compendium ont un portrait qui se charge
(requête HEAD OK), aucune icône `oak.svg` restante, aucune erreur JS.

---

## Session du 2026-09-22/23 — Fix scrollbar, Codex des espèces, publication GitHub (v0.10.0)

**1. Bug remonté par l'utilisateur : pas de scrollbar sur la fiche personnage classique.**
Régression introduite par le fix de sauvegarde de la session du 2026-09-15 (`f9795e1`) : en
remplaçant le `<form>` de tête de chaque template par un `<div class="galactic-wars-body">`
(pour ne plus imbriquer de `<form>` dans celui de `DocumentSheetV2`), la chaîne flex qui
borne `.sheet-body` et déclenche son `overflow-y: auto` s'est retrouvée cassée : ce nouveau
`<div>` n'avait aucune règle CSS (`display: block` par défaut), donc `flex:1 1 auto` sur
`.sheet-body` ne faisait plus rien, sa hauteur devenait `auto` et le contenu débordait
silencieusement. Touchait les **5 fiches** (même wrapper partout), pas seulement la classique.
Corrigé en ajoutant `.galactic-wars .galactic-wars-body { display:flex; flex-direction:column;
flex:1 1 auto; min-height:0; }` (`styles/galactic-wars.css`, commit `5747755`). Vérifié en
direct (Playwright, monde `Galacit wars V final`, personnage "Kael Dorn (test)") :
`bodyScrollHeight` (1308px) > `bodyHeight` (559px), scroll effectif jusqu'à 749px.

**2. Dossier de déploiement Foundry resynchronisé.** `D:\AppDataFoundry$\FoundryVTT_Data\Data\
systems\galactic-wars` est un second clone git du même dépôt (`github.com/SotarS21/jdr_gw`),
resté bloqué sur `c17866a` avec des modifications locales non commitées (un reliquat de la
session du 2026-09-15, déjà repris dans `f9795e1`). Modifications mises de côté (`git stash
push -u`) puis fast-forward jusqu'à `origin/main` ; le stash, devenu obsolète, a été supprimé
ensuite à la demande de l'utilisateur.

**3. Portraits d'ethnies versionnés.** `asset_visuel/Ethnie/` (62 images, 7,3 Mo) ajouté au
dépôt (commit `0b539ee`) — jusque-là présent en local uniquement, jamais commité. Le reste de
`asset_visuel/` (vaisseaux/personnages/lieux/items, ~244 Mo, essentiellement des assets de
vaisseaux jusqu'à 19 Mo pièce) reste volontairement hors dépôt pour l'instant : décision prise
avec l'utilisateur (git gonflerait de façon quasi irréversible) — à ajouter séparément si besoin
un jour. Rien dans le code ne référence ces sous-dossiers, donc aucune fonctionnalité n'en dépend.

**4. Journal "Codex des espèces" créé (nouveau pack JournalEntry).** Demande de l'utilisateur :
un JournalEntry avec une page par ethnie. Généré par script (`packs/_source/codex-especes/
codex-des-especes.json`, commit `58c0203`) à partir des 62 portraits et des 43 items du
compendium Races : chaque page = portrait + description. Mapping fichier → race fait par
normalisation du nom (accents/casse/underscores) + quelques correctifs manuels (typos
"charigan"/"turken_raider" pour Chagrian/Tusken Raider, variantes singulier/pluriel
mirialan(s), "rodian" vs le nom francisé "Rodien"). 44 pages sur 62 sont rattachées à une race
existante (avec ses modificateurs caractéristiques/compétences et armure naturelle affichés) ;
les 18 autres (espèces jamais codées comme race jouable : anomide, bimm, hutt, kaminoan,
killik, voss, etc., + un des deux portraits de droïde, la variante "R3") n'ont qu'un portrait
et une note d'absence de fiche mécanique. Point technique retenu pour la prochaine fois qu'un
pack embarque une hiérarchie de documents (JournalEntry→pages, Actor→items...) : chaque
document embarqué a besoin de son propre `_key` (`!journal.pages!<journalId>.<pageId>`), sinon
`foundryvtt-cli` refuse de compiler ("Key cannot be null or undefined") — absent des autres
packs source du dépôt jusqu'ici, aucun n'avait ce genre de hiérarchie.

Test en direct : rechargement du pack nécessitant un redémarrage du serveur Foundry (le
manifeste système n'est relu qu'au démarrage) — le process desktop (`Foundry Virtual Tabletop
.exe`) a été fermé avec l'accord explicite de l'utilisateur, à charge pour lui de le relancer.

**5. Mise en place de la publication GitHub (installation par URL de manifeste).** Question de
l'utilisateur : les utilisateurs peuvent-ils installer le système depuis GitHub ? Réponse :
pas encore (aucun `url`/`manifest`/`download` dans `system.json`, aucun workflow CI). Repris du
mécanisme déjà en place sur le système `antique` (`github.com/SotarS21/jdr_antik`,
`.github/workflows/release.yml`) : tag `v*.*.*` → CI reconstruit les packs (`npm run
pack:build` — nécessaire ici puisque `packs/<nom>/` LevelDB est gitignoré, contrairement à
antique qui commite ses `.db`), écrit `manifest`/`download` dans une copie CI de `system.json`
(jamais committé en local, pour que `game.system.manifest` reste falsy en dev — cf. le même
garde-fou dans `antique/module/helpers/version-check.mjs`), zippe `system.json` + `module/` +
`lang/` + `styles/` + `templates/` + `asset_visuel/Ethnie/` + les 10 dossiers de packs, publie
une GitHub Release avec `system.zip`/`system.json` en pièces jointes (commit `239e8de`).
Premier tag `v0.10.0` créé et poussé : release publiée avec succès (`github.com/SotarS21/
jdr_gw/releases/tag/v0.10.0`), workflow vert en 21s. URL de manifeste utilisable dès
maintenant : `https://github.com/SotarS21/jdr_gw/releases/latest/download/system.json`.

**Fichiers modifiés** : `styles/galactic-wars.css` (fix scrollbar), `asset_visuel/Ethnie/*`
(nouveau, 62 fichiers), `packs/_source/codex-especes/codex-des-especes.json` (nouveau),
`system.json` (pack codex-especes, url/manifest/download), `.github/workflows/release.yml`
(nouveau).

**Pistes pour une prochaine session** : committer le reste de `asset_visuel/` si besoin
(vaisseaux/personnages/lieux/items, ~244 Mo, à discuter — probablement à alléger/compresser
d'abord) ; remplacer les placeholders `icons/svg/oak.svg` des items Race par les vrais
portraits maintenant versionnés ; envisager un mécanisme de notification de mise à jour côté
GM façon `antique/module/helpers/version-check.mjs` (dialogue de notes de version + option
d'écraser les compendiums système) maintenant que `manifest`/`download` existent réellement en
release.

---

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
