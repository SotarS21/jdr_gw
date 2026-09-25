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
      <li>Équipement de départ : le Couteau devient une Lame (1d4), le Sabre d'entraînement un Sabre d'entraînement jedi.</li>
    </ul>`
  }
};
