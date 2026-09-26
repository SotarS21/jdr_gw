/**
 * Armement des vaisseaux (v0.16.0) : des objets « arme » portés par l'acteur vaisseau, ajoutés par glisser-déposer.
 * Le tir utilise la compétence de l'arme au taux du **token sélectionné** (le tireur), pas celui du vaisseau — qui
 * n'a pas de compétences (règle de l'auteur, 2026-09-26).
 *
 * Avant la v0.16.0, l'armement était une liste de texte (`system.armement` : nom, dégâts, quantité) : convertie en
 * objets par `convertirArmement` (bouton de la fiche, correctif MJ `0.16.0-armement-en-objets`).
 */

/** Compétence des armes de vaisseau converties ou créées depuis la fiche (tourelles, canons). */
export const COMPETENCE_ARME_VAISSEAU = "canonLourd";

export const IMAGE_ARME_VAISSEAU = "systems/galactic-wars/asset_visuel/objets/armes-tourelle-laser-lourde.jpg";

/** Emplacement d'une arme sur le vaisseau (texte libre, ex. « Avant-Gauche, Avant-Droite ») — propre au vaisseau. */
export function emplacementArme(arme) {
  return arme.getFlag?.("galactic-wars", "emplacement") ?? "";
}

/** Données d'objet « arme » depuis une entrée de l'ancien `system.armement`. */
export function armeDepuisAncienFormat(entree) {
  return {
    name: entree.nom || game.i18n.localize("GALACTICWARS.Vaisseau.NouvelleArme"),
    type: "arme",
    img: IMAGE_ARME_VAISSEAU,
    system: {
      degats: entree.degats || "",
      quantite: Math.max(1, entree.quantite ?? 1),
      competence: COMPETENCE_ARME_VAISSEAU,
      porte: true
    },
    flags: { "galactic-wars": { emplacement: entree.emplacement ?? "" } }
  };
}

/** Convertit l'ancien armement texte d'un vaisseau en objets « arme ». Renvoie le nombre d'armes créées. */
export async function convertirArmement(vaisseau) {
  const anciennes = vaisseau.system.toObject().armement ?? [];
  if (!anciennes.length) return 0;
  await vaisseau.createEmbeddedDocuments("Item", anciennes.map(armeDepuisAncienFormat));
  await vaisseau.update({ "system.armement": [] });
  return anciennes.length;
}

/**
 * Tireur d'une arme de vaisseau : acteur du token sélectionné qui a des compétences (fiche classique), sinon le
 * personnage de l'utilisateur. null si aucun.
 */
export function tireurSelectionne() {
  const aDesCompetences = (acteur) => Array.isArray(acteur?.system?.competences) && acteur.system.competences.length > 0;
  const token = canvas?.tokens?.controlled?.find((t) => aDesCompetences(t.actor));
  if (token) return token.actor;
  return aDesCompetences(game.user.character) ? game.user.character : null;
}
