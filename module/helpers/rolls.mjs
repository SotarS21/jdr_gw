import { GW } from "../config.mjs";

/** Résultat commun d'un jet 1d100 sous une cible en %, avec seuils de critique. */
async function resoudrePourcentage(cible) {
  const roll = new Roll("1d100");
  await roll.evaluate();

  const reussite = roll.total <= cible;
  const critique = roll.total <= Math.max(1, Math.floor(cible / 10));
  const echecCritique = roll.total >= 96;

  return { roll, reussite, critique, echecCritique };
}

function flavorResultatCle({ critique, echecCritique, reussite }) {
  return echecCritique
    ? "GALACTICWARS.Jet.EchecCritique"
    : critique
    ? "GALACTICWARS.Jet.ReussiteCritique"
    : reussite
    ? "GALACTICWARS.Jet.Reussite"
    : "GALACTICWARS.Jet.Echec";
}

/**
 * Jet de compétence en pourcentage (fiche classique) : 1d100 <= total% = réussite.
 * @param {Actor} actor
 * @param {string} cle clé de GW.competences
 * @param {object} [options]
 * @param {"lumiere"|"obscurite"} [options.pool] réserve dont dépenser 1 point pour +GW.bonusAlignement%
 *   sur ce jet (voir personnage-sheet.mjs, qui décrémente la réserve une fois le jet lancé).
 */
export async function rollCompetence(actor, cle, { pool } = {}) {
  const competence = actor.system.competences?.find((c) => c.cle === cle);
  if (!competence) {
    ui.notifications.warn(game.i18n.format("GALACTICWARS.Avertissement.CompetenceInconnue", { cle }));
    return null;
  }

  const bonus = pool ? GW.bonusAlignement : 0;
  const cible = Math.min(100, competence.total + bonus);

  const resultat = await resoudrePourcentage(cible);
  const flavor = game.i18n.format("GALACTICWARS.Jet.Flavor", {
    competence: game.i18n.localize(competence.label),
    cible
  });
  const flavorBonus = pool
    ? `<br>${game.i18n.format("GALACTICWARS.Alignement.FlavorBonus", {
        bonus,
        reserve: game.i18n.localize(GW.alignements[pool])
      })}`
    : "";

  await resultat.roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${flavor}<br>${game.i18n.localize(flavorResultatCle(resultat))}${flavorBonus}`
  });

  return resultat;
}

/**
 * Jet de Survie (fiche rapide) : reste en pourcentage même si les 8 caractéristiques de
 * la fiche rapide, elles, se jettent en d20 (voir rollCaracteristiqueD20).
 * @param {Actor} actor
 */
export async function rollSurvie(actor) {
  const resultat = await resoudrePourcentage(actor.system.survie.total);
  const flavor = game.i18n.format("GALACTICWARS.Jet.Flavor", {
    competence: game.i18n.localize("GALACTICWARS.Sheet.Survie"),
    cible: actor.system.survie.total
  });

  await resultat.roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${flavor}<br>${game.i18n.localize(flavorResultatCle(resultat))}`
  });

  return resultat;
}

/**
 * Jet de caractéristique en d20 (fiche rapide, "partie rapide") : 1d20 <= valeur = réussite.
 * Un 1 naturel est une réussite critique, un 20 naturel un échec critique, quelle que soit
 * la valeur de la caractéristique — convention d20 classique.
 * @param {Actor} actor
 * @param {string} cle une des 8 clés de system.caracteristiques (force, capCombat, capTir,
 *   dexterite, mentale, perception, stress, affForce)
 */
export async function rollCaracteristiqueD20(actor, cle) {
  if (actor.type !== "personnage-rapide") {
    throw new Error("rollCaracteristiqueD20 attend un Actor de type personnage-rapide");
  }
  const valeur = actor.system.caracteristiques?.[cle];
  if (valeur === undefined) {
    ui.notifications.warn(game.i18n.format("GALACTICWARS.Avertissement.CaracteristiqueInconnue", { cle }));
    return null;
  }

  const roll = new Roll("1d20");
  await roll.evaluate();

  const critique = roll.total === 1;
  const echecCritique = roll.total === 20;
  const reussite = !echecCritique && (critique || roll.total <= valeur);

  const flavor = game.i18n.format("GALACTICWARS.Jet.FlavorD20", {
    competence: game.i18n.localize(GW.caracteristiquesRapides[cle] ?? cle),
    cible: valeur
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

/**
 * Jet de caractéristique en pourcentage (PNJ) : 1d100 <= total% = réussite. Les PNJ
 * partagent le même bloc de 8 caractéristiques que la fiche rapide (voir
 * rollCaracteristiqueD20), mais résolu en % comme la fiche classique — deux mécaniques
 * différentes sur le même schéma de données, d'où deux fonctions distinctes.
 * @param {Actor} actor
 * @param {string} cle une des 8 clés de system.caracteristiques
 */
export async function rollCaracteristiquePourcentage(actor, cle) {
  if (actor.type !== "pnj") {
    throw new Error("rollCaracteristiquePourcentage attend un Actor de type pnj");
  }
  const valeur = actor.system.caracteristiques?.[cle];
  if (valeur === undefined) {
    ui.notifications.warn(game.i18n.format("GALACTICWARS.Avertissement.CaracteristiqueInconnue", { cle }));
    return null;
  }

  const resultat = await resoudrePourcentage(valeur);
  const flavor = game.i18n.format("GALACTICWARS.Jet.Flavor", {
    competence: game.i18n.localize(GW.caracteristiquesRapides[cle] ?? cle),
    cible: valeur
  });

  await resultat.roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${flavor}<br>${game.i18n.localize(flavorResultatCle(resultat))}`
  });

  return resultat;
}

/**
 * Jet additif en d20 (fiche sith) : 1d20 + valeur, comparé à un DC fixé par le MJ en
 * cours de partie — le système ne détermine pas la réussite lui-même (pas de DC stocké
 * sur la fiche), contrairement aux autres mécaniques (%, d20 sous la valeur).
 * @param {Actor} actor
 * @param {string} labelKey clé i18n du libellé affiché dans le message de jet
 * @param {number} valeur le modificateur ajouté au d20
 */
export async function rollD20Plus(actor, labelKey, valeur) {
  const roll = new Roll("1d20 + @valeur", { valeur });
  await roll.evaluate();

  const flavor = game.i18n.format("GALACTICWARS.Jet.FlavorD20Plus", {
    competence: game.i18n.localize(labelKey),
    modificateur: valeur
  });

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor
  });

  return { roll };
}
