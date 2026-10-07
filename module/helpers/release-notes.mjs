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
  },
  "0.18.3": {
    title: "v0.18.3",
    html: `<ul>
      <li>Fiche de vaisseau, équipage : glissez un membre d'une place à une autre (ou d'un poste à l'autre) ; si la place est prise, les deux membres échangent. Un membre déjà à bord n'est plus dupliqué.</li>
      <li>Chaque poste a sa compétence (déduite de son nom : Pilote → Pilotage, Navigateur → Informatique / piratage, Communicateur → Social, Mécanicien / Manutention → Mécanique, Canonnier → Canon lourd, Médecin de bord → Médecine, Capitaine → Commander / guider ; modifiable dans la fenêtre du poste). Le bouton dé d'une place lance la compétence du membre assis, à son taux.</li>
    </ul>`
  },
  "0.19.0": {
    title: "v0.19.0",
    html: `<ul>
      <li>Nouveau compendium <strong>Aménagements de vaisseau</strong> : 19 aménagements à acheter (infirmerie, cabines, cuisine, salon, salle de briefing, cockpit amélioré, soute agrandie, hangar à navette, sas d'arrimage, compartiment de contrebande, bouclier renforcé, brouilleur, rayon tracteur, hyperpropulseur…), avec prix et modules (estimés, à ajuster par le MJ).</li>
      <li>Fiche de vaisseau : les aménagements sont des objets à glisser depuis le compendium ; compteur « Modules utilisés / disponibles » (en rouge en cas de dépassement), modules disponibles réglables en mode Édition. Les aménagements d'origine valent 0 module.</li>
      <li>Nouvelle section <strong>Soute</strong> : glissez-y des équipements et des armures (depuis une fiche, ils y sont déplacés) ; « Donner » les rend à un membre de l'équipage assis à bord.</li>
      <li>Les vaisseaux existants sont convertis par un correctif proposé au MJ (aménagements en objets d'origine, modules du vaisseau homonyme du compendium).</li>
    </ul>`
  },
  "0.19.1": {
    title: "v0.19.1",
    html: `<ul>
      <li><strong>Correction</strong> : les aménagements d'origine des vaisseaux comptent maintenant dans les modules (1 module chacun) ; les modules disponibles = aménagements d'origine + places libres selon la taille. Un correctif proposé au MJ met à jour les vaisseaux déjà convertis.</li>
      <li>Jets : réussites en vert, échecs en rouge (critiques en badge plein), total du dé coloré.</li>
      <li>Onglet Informations : champ « Signe distinctif ».</li>
      <li>Tag « Endommagé » sur les armes, armures et équipements : l'objet ne peut plus être porté tant que le tag n'est pas retiré.</li>
      <li>Onglet Notes : glissez un personnage ou un PNJ sur la fiche pour l'ajouter à vos PNJ (relié à sa fiche) ; chaque carte a « Montrer dans le tchat », et la carte du tchat se glisse sur une fiche pour l'ajouter à ses propres notes.</li>
      <li>Mode Édition : compteur des niveaux de compétences répartis (12 au niveau 1, puis +3 par niveau).</li>
    </ul>`
  },
  "0.19.2": {
    title: "v0.19.2",
    html: `<ul>
      <li><strong>Animations</strong> (avec les modules Sequencer et JB2A activés) : tir laser vers les cibles pour les blasters et canons (vert pour les armes de vaisseau, raté si l'attaque échoue), coup de sabre laser, coup d'arme blanche ou de poing, explosion pour l'artifice ; traînée de fumée quand un vaisseau se déplace. Une arme configurée dans Automated Animations utilise sa propre animation. Réglage « Animations » dans les paramètres du monde pour tout couper.</li>
    </ul>`
  },
  "0.19.3": {
    title: "v0.19.3",
    html: `<ul>
      <li>Générique : la musique démarre avec la phrase d'ouverture « Il y a longtemps, dans une galaxie lointaine, très lointaine… » ; si l'ouverture est passée, au début du défilement.</li>
      <li>Animations : sabre laser et fumée des vaisseaux via la base de Sequencer (JB2A) ; coups de mêlée du tireur vers la cible.</li>
    </ul>`
  },
  "0.19.4": {
    title: "v0.19.4",
    html: `<ul>
      <li>Notes : barre de recherche dans les PNJ et les missions (nom, sous-titre, statut, texte ; sans tenir compte des accents).</li>
      <li>Informations : nouvelle section <strong>Métier</strong> sous l'ethnie — description, talent, compétences spéciales et équipement de départ du métier.</li>
      <li>Vaisseaux : le Dynamic 20 modular transport a deux postes (Pilote, Mécanicien), fait 100 m de long et peut avoir 10 modules (compendium, et correctif MJ pour celui du monde).</li>
      <li>Images du Barloz class médium Freighter, du Dynamic 20 modular transport et du Land speeder (compendium, et correctif MJ pour les copies du monde).</li>
    </ul>`
  },
  "0.19.5": {
    title: "v0.19.5",
    html: `<ul>
      <li>Fiche d'équipage : bouton <strong>Avantage d'équipage</strong> dans l'en-tête (non cumulable). Le MJ l'accorde d'un clic ; il s'allume, et un membre peut alors l'utiliser : tous les membres réussissent l'action d'équipe, l'avantage disparaît et le tchat l'annonce. Le MJ peut aussi l'utiliser ou le retirer.</li>
    </ul>`
  },
  "0.19.6": {
    title: "v0.19.6",
    html: `<ul>
      <li>Nouveau vaisseau au compendium : <strong>L'Empresse</strong> (HWSS Empress), frégate d'artillerie de 6 places bâtie autour du canon Sovereign (caractéristiques estimées, à ajuster par le MJ).</li>
      <li>Images du Barmaid Betty et du Lantallian GX-class Executive transport (compendium, et correctif MJ pour les copies du monde).</li>
      <li>Avantage d'équipage : utilisable aussi par un membre qui ne fait qu'observer la fiche d'équipage (le MJ connecté l'enregistre).</li>
    </ul>`
  },
  "0.19.7": {
    title: "v0.19.7",
    html: `<ul>
      <li>L'Empresse : postes <strong>Navigateur</strong> et <strong>Communicateur</strong> (8 places) ; correctif MJ pour la copie du monde (postes ajoutés, nom « HWSS Empress » remplacé par « L'Empresse »).</li>
    </ul>`
  },
  "0.19.8": {
    title: "v0.19.8",
    html: `<ul>
      <li>Images pour les 21 métiers du compendium (visibles aussi dans la section Métier de l'onglet Informations).</li>
      <li>Installation par manifeste : le compendium « Aménagements de vaisseau » est de nouveau inclus dans l'archive (il manquait depuis la v0.19.0).</li>
    </ul>`
  },
  "0.19.9": {
    title: "v0.19.9",
    html: `<ul>
      <li>Tous les métiers ont désormais une description (d'après le document des métiers).</li>
      <li>Métiers : le « niveau minimum » et le « métier requis » des prérequis sont supprimés.</li>
    </ul>`
  },
  "0.20.0": {
    title: "v0.20.0 — Traits à effets actifs",
    html: `<ul>
      <li>Nouveau compendium <strong>Traits</strong> : un trait par métier (21 métiers), avec des effets actifs appliqués automatiquement. Un trait chiffré existe en deux variantes : en <strong>%</strong> pour la fiche classique (+4 → +20 %), en <strong>d20</strong> pour la fiche rapide ; un PNJ, qui jette en %, compte ses bonus × 5.</li>
      <li>Le trait du métier est posé automatiquement sur la fiche quand on choisit un métier (variante adaptée à la fiche) et remplacé au changement de métier.</li>
      <li>Talents chiffrés : <strong>Brutale</strong> (Social −10 %), <strong>Charismatique</strong> (Social +20 %, Furtivité −15 %) et <strong>Stresser</strong> (Sang-froid −20 %) appliquent leurs effets, avec leur variante pour la fiche rapide.</li>
      <li>Les effets s'ajoutent au total des compétences (fiche classique) ou des caractéristiques (fiche rapide / PNJ) et sont affichés à côté ; un bonus d'effet relève le plafond de 90 %. Le plafond porte sur la valeur hors effets : un bonus n'empêche pas de progresser par l'expérience, un malus ne s'efface pas avec elle.</li>
      <li><strong>Couverts</strong> : Demi-couvert (+4) et Couvert total (+8) d'armure temporaire, exclusifs, à prendre depuis le HUD du token ou depuis la fiche (onglet Combat) ; l'armure temporaire réduit les dégâts subis.</li>
      <li>Médecin : le bonus de Médecine est désormais porté par le trait <strong>Chirurgien</strong> (+20 %) et non plus par le métier.</li>
      <li>Fiche de talent : fiche visée (toutes, classique, rapide) et liste des effets (créer, modifier, activer, supprimer). Fiche de métier : choix du trait posé (variante classique et variante rapide).</li>
      <li>Correctif MJ <code>0.20.0-traits-metier</code> : pose le trait du métier sur les personnages déjà dotés d'un métier et recalcule le bonus de Médecine des Médecins ; un message chuchoté au MJ liste les fiches où un talent ou un trait avait peut-être déjà été reporté à la main.</li>
    </ul>`
  },
  "0.20.1": {
    title: "v0.20.1 — Nouveaux traits, traits actifs",
    html: `<ul>
      <li>Compendium <strong>Traits</strong> : 10 nouveaux traits, dans le dossier « Traits robot » — passifs (Le Gardien, Diagnostique, Peau de nanite, Cryptographie, Invisibilité, Tentative de confusion) et actifs (Protection rapprochée, Charge, Support de combat, Attaque !). Les traits des métiers sont rangés dans le dossier « Traits de métier ».</li>
      <li><strong>Traits actifs</strong> : un trait actif porteur d'effets a un bouton sur la fiche (classique et rapide) pour allumer ou éteindre ses effets — Protection rapprochée : +10 d'armure tant qu'elle est active. Case « Trait actif » sur la fiche du talent.</li>
    </ul>`
  },
  "0.20.2": {
    title: "v0.20.2 — Bonus des traits visibles sur les compétences",
    html: `<ul>
      <li>Une compétence modifiée par un trait ou un talent affiche son bonus à côté du total (pastille verte, rouge pour un malus : « 45% +20 »), dans la liste des compétences, les favoris et l'onglet Combat.</li>
      <li>Au survol, l'info-bulle liste les traits et talents à l'origine du bonus (ex. « Fureur obscure +20 % ») ; même chose pour les bonus de caractéristiques de la fiche rapide et des PNJ.</li>
    </ul>`
  },
  "0.20.3": {
    title: "v0.20.3 — Compendium Traits rangé par fiche",
    html: `<ul>
      <li>Compendium <strong>Traits</strong> rangé en deux dossiers, <strong>Traits fiche classique</strong> et <strong>Traits fiche rapide</strong>, chacun avec ses sous-dossiers « Traits de métier » et « Traits robot » (31 traits par fiche).</li>
      <li>Les traits communs aux deux fiches existent désormais en deux exemplaires, un par dossier ; chaque métier pose celui de la fiche du personnage. Les traits déjà posés sur les fiches ne changent pas.</li>
      <li>Le Gardien, Cryptographie, Tentative de confusion et Support de combat ont une variante d20 pour la fiche rapide (+5 % = +1).</li>
    </ul>`
  },
  "0.20.4": {
    title: "v0.20.4 — Corrections : vaisseau pour les joueurs, démarrage du MJ",
    html: `<ul>
      <li>Fiche de vaisseau seulement <strong>observée</strong> par un joueur : le bouton d'ouverture de la fiche d'un membre d'équipage et le <strong>jet de poste</strong> de son propre personnage fonctionnent de nouveau.</li>
      <li>Armement du vaisseau : un joueur qui voit le vaisseau a les boutons <strong>Attaquer</strong> et <strong>Dégâts</strong> sur la carte de l'arme dans le tchat (le tireur reste son token sélectionné).</li>
      <li>Démarrage du MJ : la complétion des compétences ne plante plus avec un token non lié, et une erreur de migration n'empêche plus l'affichage des notes de version et des correctifs.</li>
    </ul>`
  },
  "0.20.5": {
    title: "v0.20.5 — Postes des vaisseaux, objets des fiches rapides, gain d'XP",
    html: `<ul>
      <li><strong>Vaisseaux</strong> : Barloz, Barmaid Betty, CEC XS-122, Corellian Dawn, Gunboat, Lantallian et Land speeder ont de vrais postes (Capitaine, Pilote, Canonnier, Mécanicien…) au lieu d'un unique poste « Équipage » à 1 place. « Équipage » reste un poste de passagers, sans jet. Correctif proposé au MJ pour les copies du monde.</li>
      <li>Fiches <strong>rapide, PNJ et sith</strong> : liste des objets possédés au-dessus du texte « Équipement » (clic = tchat, ouvrir la fiche, supprimer) — les objets reçus de la réserve, de la soute ou du métier y apparaissent enfin.</li>
      <li><strong>Gain d'XP</strong> (fiche classique) : +5 % compte toujours, même au niveau 0 sur une compétence hors métier ; l'info-bulle du total indique la part d'expérience.</li>
      <li>Fiche d'équipage consultée par un joueur : onglets et fiches des membres accessibles. Pouvoirs de Force : le nom ouvre la fiche.</li>
      <li>Notes, Holonet et Comlink : deux fenêtres ouvertes en même temps ne s'écrasent plus. Correctifs : un seul MJ les applique, et une seule fois.</li>
    </ul>`
  },
  "0.20.6": {
    title: "v0.20.6 — Petites corrections",
    html: `<ul>
      <li><strong>Lumière / Obscurité</strong> : un double clic sur « utiliser » ne compte qu'une fois ; les clics rapides sur + / − ne se perdent plus.</li>
      <li>Fiche personnage : l'étoile Favori ne fait plus perdre une saisie en cours ; Initiative déjà lancée = un message ; le bloc Vaisseau de l'onglet Équipements se met à jour.</li>
      <li><strong>Défense</strong> : une défense déjà jouée ne se rejoue plus après un rechargement. Soin mal écrit (« 4 PV ») : message clair ; un soin ne fait jamais baisser les PV.</li>
      <li>Vaisseau : pas de bouton de jet pour une compétence bloquée ; un acteur de compendium ou un équipage ne peut pas occuper un poste ; un membre glissé d'un vaisseau à l'autre quitte l'ancien.</li>
      <li>Holonet et Comlink : l'historique suit les infos ajoutées ou supprimées ; le canal ouvert suit son nouveau numéro ; la navigation fonctionne sur une fiche seulement consultée.</li>
      <li>Générique : « Arrêter pour tous » sur la page du journal ; « Passer » ne relance plus le texte ; l'aperçu n'est plus interrompu par une diffusion ; image de fond avec apostrophe.</li>
      <li>Fiche sith : capacités spéciales d'école modifiables ; prétirés sith liés à leur race. Animations : JB2A Patreon reconnu.</li>
    </ul>`
  },
  "0.20.7": {
    title: "v0.20.7 — Règles précisées",
    html: `<ul>
      <li><strong>Niveaux de compétences</strong> : une compétence bloquée (réservée à un autre métier) compte 0 dans le compteur, comme elle s'affiche — ses points sont à redistribuer. Si le MJ la débloque, son niveau revient.</li>
      <li><strong>Gain de niveau</strong> : règle confirmée, la même compétence peut recevoir plusieurs des 3 points (niveau 3 au maximum).</li>
      <li><strong>Métiers</strong> : l'affiliation (« empire / république / privé », « un maître »…) s'affiche dans le choix du métier et se modifie dans la fiche du métier. Indicatif : rien n'est vérifié.</li>
    </ul>`
  },
  "0.21.0": {
    title: "v0.21.0 — Journaux du catalogue",
    html: `<ul>
      <li>Nouveau compendium <strong>Journaux du catalogue</strong> : journal des objets (20), des armes (80), des armures (5) et des métiers (21).</li>
      <li>Une page par entrée : image, caractéristiques (dégâts, compétence, réduction, prix…), description et lien vers la fiche du compendium, à glisser sur une fiche.</li>
      <li>Métiers : affiliation, talent, compétences du métier et au choix, trait de chaque fiche, équipement de départ.</li>
    </ul>`
  }
};
