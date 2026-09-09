/**
 * Jet de compétence en pourcentage : 1d100 <= total% = réussite.
 * @param {Actor} actor
 * @param {string} cle clé de GW.competences
 */
export async function rollCompetence(actor, cle) {
  const competence = actor.system.competences?.find((c) => c.cle === cle);
  if (!competence) {
    ui.notifications.warn(game.i18n.format("GALACTICWARS.Avertissement.CompetenceInconnue", { cle }));
    return null;
  }

  const roll = new Roll("1d100");
  await roll.evaluate();

  const reussite = roll.total <= competence.total;
  const critique = roll.total <= Math.max(1, Math.floor(competence.total / 10));
  const echecCritique = roll.total >= 96;

  const flavor = game.i18n.format("GALACTICWARS.Jet.Flavor", {
    competence: game.i18n.localize(competence.label),
    cible: competence.total
  });

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${flavor}<br>${game.i18n.localize(
      echecCritique
        ? "GALACTICWARS.Jet.EchecCritique"
        : critique
        ? "GALACTICWARS.Jet.ReussiteCritique"
        : reussite
        ? "GALACTICWARS.Jet.Reussite"
        : "GALACTICWARS.Jet.Echec"
    )}`
  });

  return { roll, reussite, critique, echecCritique };
}
