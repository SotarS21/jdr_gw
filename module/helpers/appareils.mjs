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
