/**
 * Applique une race (Item type "race") sur un Actor "personnage" : modificateurs de
 * caractéristiques et de compétences. Ré-appliquer une race remplace simplement les
 * valeurs `racial`, ça ne duplique jamais rien (elles sont recalculées, pas cumulées).
 * @param {Actor} actor
 * @param {Item} raceItem
 */
export async function applyRace(actor, raceItem) {
  if (raceItem.type !== "race") throw new Error("applyRace attend un Item de type race");

  const mods = raceItem.system.modificateursCaracteristiques;
  const modsCompetences = raceItem.system.modificateursCompetences ?? {};

  const competences = actor.system.competences.map((c) => ({
    ...c,
    racial: modsCompetences[c.cle] ?? 0
  }));

  await actor.update({
    "system.race.uuid": raceItem.uuid,
    "system.race.nom": raceItem.name,
    "system.caracteristiques.corps.racial": mods.corps,
    "system.caracteristiques.mental.racial": mods.mental,
    "system.caracteristiques.dexterite.racial": mods.dexterite,
    "system.competences": competences
  });
}
