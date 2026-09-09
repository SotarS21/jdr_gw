/**
 * Applique une race (Item type "race") sur un Actor : modificateurs de caractéristiques
 * et de compétences (fiche classique uniquement — voir note ci-dessous), nom de race.
 * Ré-appliquer une race remplace simplement les valeurs `racial`, ça ne duplique jamais
 * rien (elles sont recalculées, pas cumulées).
 *
 * Les modificateurs raciaux du compendium sont exprimés dans le référentiel de la fiche
 * classique (caractéristiques Corps/Mental/Dextérité + compétences en %) : ils ne
 * s'appliquent donc qu'à un Actor "personnage". Sur une fiche rapide (8 caractéristiques
 * directes, pas de %), seul le nom de la race est renseigné pour l'instant — traduire les
 * bonus raciaux vers ce référentiel est un choix de design à faire, pas une simple
 * conversion technique.
 * @param {Actor} actor
 * @param {Item} raceItem
 */
export async function applyRace(actor, raceItem) {
  if (raceItem.type !== "race") throw new Error("applyRace attend un Item de type race");

  const updates = {
    "system.race.uuid": raceItem.uuid,
    "system.race.nom": raceItem.name
  };

  if (actor.type === "personnage") {
    const mods = raceItem.system.modificateursCaracteristiques;
    const modsCompetences = raceItem.system.modificateursCompetences ?? {};

    updates["system.caracteristiques.corps.racial"] = mods.corps;
    updates["system.caracteristiques.mental.racial"] = mods.mental;
    updates["system.caracteristiques.dexterite.racial"] = mods.dexterite;
    updates["system.competences"] = actor.system.competences.map((c) => ({
      ...c,
      racial: modsCompetences[c.cle] ?? 0
    }));
  }

  await actor.update(updates);
}
