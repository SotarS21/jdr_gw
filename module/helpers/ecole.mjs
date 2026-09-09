/**
 * Applique une École sith (Item type "ecole") sur un Actor "personnage-sith" : remplit
 * `system.ecole.capacitesSpeciales` avec les capacités nommées de l'école (et son
 * équipement de départ, le cas échéant), sur le même principe que applyMetier/applyRace.
 * @param {Actor} actor
 * @param {Item} ecoleItem
 */
export async function applyEcole(actor, ecoleItem) {
  if (ecoleItem.type !== "ecole") throw new Error("applyEcole attend un Item de type ecole");

  const capacites = ecoleItem.system.capacites
    .map((c) => `${c.nom} : ${c.description}`)
    .join("\n");
  const equipement = ecoleItem.system.equipementDepart
    ? `\n${game.i18n.localize("GALACTICWARS.Sheet.EquipementDepart")} : ${ecoleItem.system.equipementDepart}`
    : "";

  await actor.update({
    "system.ecole.uuid": ecoleItem.uuid,
    "system.ecole.nom": ecoleItem.name,
    "system.ecole.capacitesSpeciales": capacites + equipement
  });
}
