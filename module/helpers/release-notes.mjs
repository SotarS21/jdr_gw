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
      <li>Compendium Armes : Lance-roquette, Grenade, Grenade militaire et Trident sith sont de nouveau utilisables (type invalide corrigé).</li>
    </ul>`
  }
};
