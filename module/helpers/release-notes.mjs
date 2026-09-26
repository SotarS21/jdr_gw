/**
 * Notes de version affichées au MJ après une mise à jour du système (voir version-check.mjs).
 * Une entrée par version publiée — à tenir à jour avec la table de JOURNAL.md à chaque release.
 */
export const RELEASE_NOTES = {
  "0.10.1": {
    title: "v0.10.1",
    html: "<ul><li>Portraits d'ethnie sur les 43 races du compendium.</li></ul>"
  },
  "0.11.0": {
    title: "v0.11.0",
    html: `<ul>
      <li>Compétences remplies dès la création du personnage.</li>
      <li>Mode Édition (caractéristiques, race, métier, niveaux, ajustements) et validation des 120 points.</li>
      <li>Compétences réservées par métier, déblocage par le MJ au clic droit.</li>
      <li>PV, Force et Crédits dans l'en-tête de la fiche.</li>
    </ul>`
  },
  "0.11.1": {
    title: "v0.11.1",
    html: `<ul>
      <li>Points de force en ressource simple, bouton Repos, barre de PV colorée.</li>
      <li>Jet de compétence au clic sur son nom ; compétences non utilisées masquées hors édition.</li>
    </ul>`
  },
  "0.12.0": {
    title: "v0.12.0",
    html: `<ul>
      <li>Onglet Informations : description du personnage, ethnie et ses modificateurs.</li>
      <li>Onglet Notes : résumés datés, infos à mots-clés, PNJ avec statut, missions.</li>
    </ul>`
  },
  "0.12.1": {
    title: "v0.12.1",
    html: `<ul>
      <li>Box Crédits : chiffres groupés par 3, retour à la ligne et police réduite pour les grands montants.</li>
      <li>Fenêtre de notes de version au MJ après chaque mise à jour du système.</li>
    </ul>`
  },
  "0.12.2": {
    title: "v0.12.2",
    html: `<ul>
      <li>Lumière / Obscurité : jauge d'équilibre bleu ↔ rouge, carte teintée selon le côté dominant, points lumineux.</li>
      <li>Mises à jour de contenu : après une mise à jour, le MJ choisit les correctifs à appliquer aux objets, personnages et tokens du monde.</li>
    </ul>`
  },
  "0.12.3": {
    title: "v0.12.3",
    html: `<ul>
      <li>Onglet Informations : tableau des Traits (talents portés, avantage / inconvénient), visible dès qu'il y a un trait ou en mode édition.</li>
      <li>Portrait du personnage, portrait d'ethnie et vignettes des PNJ affichés en entier, sans recadrage ni déformation.</li>
    </ul>`
  },
  "0.12.4": {
    title: "v0.12.4",
    html: `<ul>
      <li>Compétences favorites : étoile sur chaque compétence, panneau Favoris (jet au clic) en haut de l'onglet Personnage.</li>
      <li>Tag « Caché » sur les armes, armures et équipements : case dans la fiche de l'objet ou clic droit dans l'inventaire.</li>
    </ul>`
  },
  "0.13.0": {
    title: "v0.13.0 — refonte des objets",
    html: `<ul>
      <li>Nouvelles fiches d'arme, d'armure / bouclier et d'équipement : image entière, porté / rangé, onglets Détails / Description / Notes du MJ, compétence liée avec le taux du porteur, boutons Attaquer et Dégâts.</li>
      <li>Boucliers : armures d'emplacement « Bouclier », cumulables avec les autres armures.</li>
      <li>Inventaire : lignes avec image et badges, objets rangés grisés, réduction totale des armures portées, attaque rapide ; clic = carte dans le tchat, clic droit = porter / ranger, tags, fiche, suppression.</li>
      <li>En mode édition de la fiche, un bouton crayon sur chaque objet de l'inventaire ouvre sa fiche.</li>
      <li>Cartes d'objet dans le tchat avec Attaquer / Dégâts (propriétaire et MJ) ; un objet caché est montré en murmure.</li>
      <li>Tout objet est désormais rangé par défaut : portez vos armes et armures pour les utiliser.</li>
      <li>Nouvelle compétence « Arme contondante/blanche » (Corps, −10 % hors métier), accordée par les 8 métiers qui la recommandent (Padawan, Apprenti sith, Chasseur de primes, Assassin, Pirate, Contrebandier, Mandalorien soldat, Mécanicien) ; l'« Arme contondante » du compendium l'utilise.</li>
      <li>Compendium Armes : Lance-roquette, Grenade, Grenade militaire et Trident sith sont de nouveau utilisables (type invalide corrigé).</li>
    </ul>`
  },
  "0.13.1": {
    title: "v0.13.1",
    html: `<ul>
      <li>Bouton « Gain d'XP » sur la fiche classique : passe en édition et propose +5 % sur une compétence au choix (message dans le tchat).</li>
      <li>Plafond des compétences à 90 %, dépassable seulement par le bonus d'ethnie ; au plafond, l'ajustement est grisé en mode édition.</li>
    </ul>`
  },
  "0.13.2": {
    title: "v0.13.2 — Datapad et Holonet",
    html: `<ul>
      <li>Nouveau champ « Appareil » sur les équipements (Datapad, Comlink).</li>
      <li>Un datapad a un onglet <strong>Holonet</strong> : navigateur sur les Infos du personnage (onglet Notes → Infos) — recherche, mots-clés, pages, précédent / suivant — avec création, modification et suppression, synchronisées avec la fiche.</li>
      <li>Jets en pourcentage : réussite critique de 1 à 5 et échec critique de 96 à 100, quel que soit le taux (auparavant réussite critique à 10 % du taux).</li>
      <li>Compétences manquantes (dont « Arme contondante/blanche ») ajoutées automatiquement à toutes les fiches existantes au chargement du monde par le MJ, y compris les tokens non liés et les compendiums du monde ; aussi en macro : <code>game.galacticWars.completerCompetences()</code>.</li>
      <li>Une seule image par personnage : changer le portrait de la fiche change aussi l'image de l'acteur et celle de son token (tokens posés compris) ; correctif proposé au MJ pour les acteurs existants.</li>
      <li>Visuels des objets : les armes, armures et équipements des compendiums, ainsi que les datapads et comlinks de départ, ont leur image (correctif proposé au MJ pour les objets déjà copiés).</li>
      <li>Holonet : la barre d'adresse reste fixe et la page défile.</li>
      <li>Bouton Holonet sur la ligne du datapad dans l'inventaire ; les « Datapad » de départ des métiers sont reconnus (correctif proposé au MJ pour les existants).</li>
    </ul>`
  },
  "0.13.3": {
    title: "v0.13.3",
    html: `<ul>
      <li>Compétence liée : Lance-roquette → Canon lourd, Grenade et Grenade militaire → Artifice, Trident sith → Arme contondante/blanche (correctif proposé au MJ pour les copies sans compétence).</li>
      <li>Au plafond de 90 %, l'ajustement d'une compétence reste modifiable à la baisse (la hausse reste bloquée).</li>
    </ul>`
  },
  "0.14.0": {
    title: "v0.14.0 — Onglet Combat",
    html: `<ul>
      <li>Nouvel onglet <strong>Combat</strong> : armes portées (Attaquer / Dégâts), protection (armures, bouclier, armure naturelle de l'ethnie, réduction totale), compétences de combat et, pour un personnage sensible à la Force, ses compétences liées à la Force.</li>
      <li>Initiative du combat Foundry : 1d20 (bouton Initiative dans l'onglet).</li>
      <li>Attaque réussie sur des tokens ciblés : chaque cible tente Parade/esquive ou Protection de la Force ; si les deux réussissent, la meilleure réussite l'emporte (critique, puis marge ; égalité = défense).</li>
      <li>Jet de dégâts d'une arme : bouton MJ « Appliquer les dégâts » aux tokens sélectionnés (sinon aux cibles de l'attaquant), réduits par les armures ; bilan chuchoté au MJ.</li>
    </ul>`
  },
  "0.14.1": {
    title: "v0.14.1",
    html: `<ul>
      <li>Armes et armures de départ des métiers : créées comme de vraies armes / armures du compendium (dégâts, compétence liée, réduction, visuel) au lieu de simples équipements ; les dés ou le bonus écrits dans le nom sont repris (« Blaster 1D4 +2 », « Armure intermédiaire +2 »). Correctif proposé au MJ pour les personnages et tokens existants.</li>
      <li>Objets créés à la main portant le nom exact d'un objet du compendium : son visuel leur est proposé (correctif MJ).</li>
      <li>Fiches de race, métier, talent, pouvoir et école : l'image est de nouveau modifiable au clic.</li>
    </ul>`
  },
  "0.14.2": {
    title: "v0.14.2 — Catalogue économique",
    html: `<ul>
      <li>Compendium Armes : 70 armes et améliorations du classeur « Science économique » (blasters, fusils, canons, lance-flamme, grenades, bâtons, tridents, vibrolames, sabres, tasers…) avec dégâts, compétence liée, prix et visuel ; compendium Équipements : Gant magnétique, Accessoire silencieux, Cartouche de carbonite.</li>
      <li>Prix d'après le classeur : Arme contondante 522c, Fusil de précision 1200c, sabres laser non achetables (NA) ; Blaster lourd 2d6+3 pour 400c (correctif proposé au MJ pour les copies).</li>
      <li>Onglet Combat : bouton d'attaque retiré des lignes d'armes (attaque au clic sur l'arme, depuis sa carte de tchat), libellé « Dégâts » devant la valeur ; rappel des points de Lumière / Obscurité et choix du bonus (retiré de l'onglet Équipements), appliqué aussi à l'attaque lancée depuis la carte de tchat.</li>
      <li>La carte de tchat d'une arme n'affiche plus son prix.</li>
      <li>Fiches d'objet : onglet Détails en deuxième position (après Description).</li>
      <li>Objets de soin : bouton « Utiliser » sur la carte de tchat — Kolto regagne 4 PV, Kolto max 6 PV, Matériel médical tous les PV (champ « Soin » réglable sur tout équipement).</li>
      <li>Équipement de départ : le Couteau devient une Lame (1d4), le Sabre d'entraînement un Sabre d'entraînement jedi.</li>
    </ul>`
  },
  "0.15.0": {
    title: "v0.15.0 — Comlink",
    html: `<ul>
      <li>Nouvel onglet <strong>Comlink</strong> sur les comlinks (bouton antenne dans l'inventaire) : canaux numérotés automatiquement, nom du contact, communication active / inactive, numéro modifiable à tout moment (jamais un numéro déjà pris), archivage et affichage des canaux archivés.</li>
      <li>Messagerie (« comlink ++ », à activer dans la configuration du comlink) : un clic sur un canal ouvre la conversation — messages du MJ à gauche au nom du contact, du joueur à droite au nom du personnage, historique complet dans une zone défilante ; le MJ clique sur un message du joueur pour le marquer « vu ».</li>
      <li>Alerte privée dans le tchat à chaque nouveau message (au MJ, ou au joueur quand le MJ répond), avec un bouton pour ouvrir le comlink sur le canal.</li>
      <li>Les équipements nommés « Comlink » sont reconnus comme comlinks (correctif proposé au MJ pour l'existant).</li>
      <li>État « Inconscient » : un personnage ou un PNJ qui tombe à 0 PV passe inconscient (sur ses tokens), et se réveille dès qu'il regagne 1 PV.</li>
      <li>Fiches PNJ et partie rapide : points de vie (actuels / max) ; les dégâts appliqués depuis le tchat fonctionnent aussi sur les PNJ.</li>
    </ul>`
  },
  "0.15.1": {
    title: "v0.15.1",
    html: `<ul>
      <li>Comlink : bouton « Montrer la conversation dans le tchat » dans la conversation d'un canal (mêmes bulles : contact à gauche, personnage à droite, « vu ») ; publique, ou chuchotée au MJ si le comlink est « Caché ».</li>
    </ul>`
  },
  "0.15.2": {
    title: "v0.15.2",
    html: `<ul>
      <li>Contacts de départ des métiers (« Connaissance dans la pègre » du Contrebandier, du Pirate, de l'Assassin…, « Contact sur quasiment chaque planète » de l'Agent secret) : ce sont désormais des PNJ alliés de l'onglet Notes → PNJ, et non plus des objets de l'inventaire. Un contact complété par le joueur est conservé au changement de métier. Correctif proposé au MJ pour les fiches existantes.</li>
    </ul>`
  },
  "0.15.3": {
    title: "v0.15.3",
    html: `<ul>
      <li>Inventaire : un clic sur la ligne d'un Datapad ou d'un Comlink ouvre sa fiche sur l'onglet Holonet / Comlink (au lieu de l'envoyer dans le tchat ; le clic droit garde « Montrer dans le tchat »).</li>
      <li>Comlink : cliquer sur l'onglet Comlink ramène à la liste des canaux, même depuis une conversation.</li>
      <li>Niveau du personnage modifiable en mode Édition seulement ; nouveau bouton <strong>Gain de niveau</strong> (mode Édition) : +1 niveau sur trois compétences différentes (niveau 3 au maximum) et +1 au niveau du personnage.</li>
      <li>Le bouton « Gain d'XP » n'apparaît qu'en mode Édition.</li>
    </ul>`
  },
  "0.15.4": {
    title: "v0.15.4",
    html: `<ul>
      <li>Gain de niveau : 3 niveaux à répartir, la même compétence pouvant être choisie plusieurs fois (niveau 3 au maximum) ; aperçu du niveau et du taux avant → après, repris dans le message du tchat.</li>
      <li>Inventaire : bouton Porté / Rangé à droite de chaque ligne ; boutons Attaquer, Comlink et Holonet retirés (un clic sur la ligne ouvre le datapad ou le comlink, l'attaque passe par la carte de tchat de l'arme).</li>
    </ul>`
  },
  "0.15.5": {
    title: "v0.15.5",
    html: `<ul>
      <li>Lumière / Obscurité : boutons « Utiliser un point de Lumière / d'Obscurité » (onglets Personnage et Combat), à utiliser avant l'action — le point est retiré et « &lt;nom&gt; a utilisé un point de … » s'affiche dans le tchat ; le MJ le convertit en niveau virtuel sur la compétence le temps de l'action.</li>
      <li>Le bonus automatique de +15 % sur les jets est supprimé (il ne correspondait pas à la règle).</li>
    </ul>`
  },
  "0.15.6": {
    title: "v0.15.6",
    html: `<ul>
      <li>Correction du taux des compétences : le bonus de niveau (5 / 10 / 20 %) s'ajoute toujours ; le bonus ou malus racial s'applique toujours ; le malus hors métier (−10 / −30 %) ne s'applique qu'au niveau 0, sans descendre sous la caractéristique. Auparavant, les premiers niveaux d'une compétence hors métier ne faisaient pas monter le taux. Les taux des fiches existantes se mettent à jour d'eux-mêmes.</li>
    </ul>`
  },
  "0.15.7": {
    title: "v0.15.7",
    html: `<ul>
      <li>Nouvel équipement « Kit de réparation » (200c) au compendium Équipements : outils pour réparer droïdes, véhicules, vaisseaux, armes et équipements avec la compétence Mécanique. Les kits de réparation déjà présents sont complétés (correctif proposé au MJ).</li>
    </ul>`
  },
  "0.15.8": {
    title: "v0.15.8",
    html: `<ul>
      <li>Onglet Équipements : panneau « Vaisseau » — glissez-déposez un vaisseau depuis l'onglet Acteurs pour y accéder depuis la fiche (le joueur doit avoir au moins le droit Observateur sur le vaisseau).</li>
      <li>Onglet Équipements en grille 2 × 2 : Armes, Armures et boucliers, Équipement, Vaisseau.</li>
      <li>En mode Édition, bouton de suppression sur chaque objet de l'onglet Équipements, avec confirmation.</li>
    </ul>`
  },
  "0.16.0": {
    title: "v0.16.0",
    html: `<ul>
      <li>Nouvelle fiche de vaisseau : grande image, jauges de coque et de bouclier, interrupteur de bouclier, équipage par poste avec plusieurs places, aménagements avec icône et description.</li>
      <li>Mode Édition (bouton en haut de la fiche) : identité, maximums, armes, postes et aménagements ne se modifient qu'en Édition ; hors Édition restent utilisables la coque, le bouclier, le déplacement, les armes et l'équipage.</li>
      <li>Armement = objets « arme » : glissez-déposez des armes sur la fiche ; un clic sur une arme affiche sa carte d'attaque, et le tir utilise la compétence de l'arme au taux du token sélectionné.</li>
      <li>Équipage : glissez-déposez un personnage ou un PNJ sur un poste (même hors Édition) ; son portrait ouvre sa fiche.</li>
      <li>Les vaisseaux existants sont repris (bouclier maximum = points actuels, noms d'équipage, aménagements). Leur ancien armement texte se convertit en armes par un correctif proposé au MJ, ou par le bouton « Convertir » de la fiche.</li>
    </ul>`
  },
  "0.16.1": {
    title: "v0.16.1",
    html: `<ul>
      <li>Quatre nouveaux vaisseaux au compendium Vaisseaux, avec leur image (acteur, fiche et token) : les frégates armées <strong>Pourparler</strong> et <strong>Lance d'argent</strong>, le transport <strong>La Brique</strong> et la grande frégate <strong>Lumière de l'aube</strong>. Leurs caractéristiques sont des estimations, à ajuster par le MJ.</li>
      <li>Images pour Le Frelon, la Convergence et le Gunboat 1061-968 (acteur, fiche et token) ; les copies du monde qui ont encore l'image par défaut sont mises à jour par un correctif proposé au MJ.</li>
    </ul>`
  },
  "0.16.2": {
    title: "v0.16.2",
    html: `<ul>
      <li>Chaque compendium du système a sa bannière (mosaïque de ses visuels : ethnies, armes, armures, équipements, vaisseaux, armes sith).</li>
    </ul>`
  },
  "0.16.3": {
    title: "v0.16.3",
    html: `<ul>
      <li>Toutes les armes, armures et équipements du compendium ont une description d'ambiance (les précisions de règle et références au classeur sont conservées).</li>
      <li>Nouveaux objets avec visuel : Robe de jedi, Tenue d'apprenti jedi, Robe noire, Tenue de contrebandier (équipements), Armure de guerrier sith et Plastron blindé (armures, réduction estimée). Les tenues de départ des métiers (Jedi consulaire, Padawan, Guerrier sith) reprennent ces vêtements.</li>
      <li>Visuels pour l'Accessoire silencieux et la Cartouche de carbonite.</li>
      <li>Correctif proposé au MJ : met à jour les objets déjà présents dans le monde (image encore générique, description vide ou ancienne) sans toucher à ce que vous avez personnalisé.</li>
    </ul>`
  },
  "0.17.0": {
    title: "v0.17.0",
    html: `<ul>
      <li>Nouveau type d'acteur <strong>Équipage</strong> (à créer dans l'onglet Acteurs) : on y dépose les personnages de l'équipe et son vaisseau.</li>
      <li>Onglet Membres : portrait, métier, PV et crédits de chacun ; bouton « Crédits » pour verser dans la caisse commune ou y prendre (message dans le tchat).</li>
      <li>Onglet Réserve : glissez un objet depuis la fiche d'un membre pour le mettre en commun ; « Donner » (ou un glisser vers une fiche) le rend à un membre. L'objet est déplacé, jamais dupliqué.</li>
      <li>Un personnage sans vaisseau à lui voit celui de son équipage dans l'onglet Équipements.</li>
      <li>Un nouvel équipage est utilisable par tous les joueurs (droit Propriétaire par défaut) ; le MJ peut le restreindre.</li>
    </ul>`
  },
  "0.18.0": {
    title: "v0.18.0",
    html: `<ul>
      <li>Nouveau : le <strong>générique façon intro spatiale</strong>. Dans un journal, ajoutez une page de type « Générique » (épisode, titre, phrase d'ouverture, texte, vitesse, musique et image de fond facultatives).</li>
      <li>« Diffuser le générique » le joue en plein écran chez tous les joueurs connectés : champ d'étoiles, phrase d'ouverture, logo qui recule, texte jaune qui défile en perspective. Le MJ peut passer au texte ou l'arrêter pour tous ; chacun peut le fermer avec Échap. « Aperçu » le joue pour vous seul.</li>
    </ul>`
  },
  "0.18.1": {
    title: "v0.18.1",
    html: `<ul>
      <li>Images pour le Moto speeder, Le Arcadia, le Corellian Dawn, le CEC XS-122 et La poubelle géante (acteur, fiche et token) ; les copies du monde qui ont encore l'image par défaut sont mises à jour par un correctif proposé au MJ.</li>
    </ul>`
  },
  "0.18.2": {
    title: "v0.18.2",
    html: `<ul>
      <li><strong>Tokens liés à leur fiche</strong> : les tokens des personnages avaient chacun leur propre fiche, différente de celle de l'acteur (PV, crédits, objets, image…). Les nouveaux personnages, vaisseaux et équipages ont désormais un token lié ; pour les existants, un correctif proposé au MJ sauvegarde l'acteur, y recopie la fiche du token puis le lie.</li>
      <li>Les joueurs peuvent glisser depuis l'onglet Acteurs les acteurs dont ils sont observateurs ou propriétaires (vers un équipage, un poste de vaisseau…).</li>
      <li>Nouveau métier <strong>Guerrier jedi</strong> (prérequis : Padawan niveau 4) et <strong>Datapad</strong> au compendium Équipements.</li>
      <li>Onglet Combat : compétences dans l'ordre alphabétique. Description du personnage (onglet Informations) plus grande. Gain de niveau : message « choisissez-en une autre ».</li>
    </ul>`
  }
};
