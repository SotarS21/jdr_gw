/**
 * Aménagements et soute des vaisseaux (v0.19.0, suivi de l'auteur n° 12-14) : les aménagements sont des objets
 * « amenagement » portés par le vaisseau (compendium Aménagements), qui occupent des modules ; la soute contient des
 * équipements et armures. Avant la v0.19.0, les aménagements étaient une liste (`system.amenagements`) : convertie en
 * objets d'origine (0 module, 0c) par `convertirAmenagements` (bouton de la fiche, correctif MJ, compendium).
 */

/** Image d'un aménagement sans visuel : la fiche affiche alors une icône déduite de son nom. */
export const IMAGE_AMENAGEMENT = "icons/svg/upgrade.svg";

/** Types d'objets rangés dans la soute d'un vaisseau. */
export const TYPES_SOUTE = ["equipement", "armure"];

/** Données d'objet « amenagement » d'origine depuis une entrée de l'ancienne liste. */
export function amenagementDepuisAncienFormat(entree) {
  const echapper = foundry.utils.escapeHTML;
  return {
    name: entree.nom || game.i18n.localize("GALACTICWARS.Amenagement.Nouveau"),
    type: "amenagement",
    img: IMAGE_AMENAGEMENT,
    system: { prix: "", modules: 0, description: entree.description ? `<p>${echapper(entree.description)}</p>` : "" }
  };
}

/** Convertit l'ancienne liste d'aménagements d'un vaisseau en objets. Renvoie le nombre d'aménagements créés. */
export async function convertirAmenagements(vaisseau) {
  const anciens = vaisseau.system.toObject().amenagements ?? [];
  if (!anciens.length) return 0;
  await vaisseau.createEmbeddedDocuments("Item", anciens.map(amenagementDepuisAncienFormat));
  await vaisseau.update({ "system.amenagements": [] });
  return anciens.length;
}

/** Modules occupés par les aménagements d'un vaisseau. */
export function modulesUtilises(vaisseau) {
  return vaisseau.items.filter((i) => i.type === "amenagement").reduce((s, i) => s + (i.system.modules ?? 0), 0);
}
