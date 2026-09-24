/** Visuel par défaut de chaque appareil (asset_visuel/objets). */
export const IMAGES_APPAREILS = {
  datapad: "systems/galactic-wars/asset_visuel/objets/equipements-datapad.png",
  comlink: "systems/galactic-wars/asset_visuel/objets/equipements-comlink.jpg"
};

/** Icônes génériques de Foundry, remplaçables sans perdre une image choisie par un joueur. */
export const IMAGES_GENERIQUES = new Set([
  "icons/svg/item-bag.svg", "icons/svg/mystery-man.svg", "icons/svg/sword.svg", "icons/svg/shield.svg", ""
]);

/**
 * Appareil (clé de GW.appareils) déduit du nom d'un équipement — pour les objets créés par nom
 * (équipement de départ des métiers, anciens objets) : « Datapad », « ComLink », « Com link »…
 * @param {string} nom
 * @returns {""|"datapad"|"comlink"}
 */
export function appareilSelonNom(nom) {
  const n = String(nom ?? "").trim().toLowerCase();
  if (/^datapad(?![a-z])/.test(n)) return "datapad";
  if (/^com[\s-]?link(?![a-z])/.test(n)) return "comlink";
  return "";
}
