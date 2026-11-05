import { GW } from "../config.mjs";

/**
 * Résultat commun d'un jet 1d100 sous une cible en % (règle de l'auteur, 2026-09-24) :
 * ≤ GW.seuilReussiteCritique (5) = réussite critique, quelle que soit la cible ; ≤ cible = réussite ;
 * > cible = échec ; ≥ GW.seuilEchecCritique (96) = échec critique, quelle que soit la cible.
 */
async function resoudrePourcentage(cible) {
  const roll = new Roll("1d100");
  await roll.evaluate();

  const critique = roll.total <= GW.seuilReussiteCritique;
  const echecCritique = roll.total >= GW.seuilEchecCritique;
  const reussite = critique || (!echecCritique && roll.total <= cible);

  return { roll, reussite, critique, echecCritique };
}

/** Nature du résultat, pour la couleur du message (vert / rouge) : reussite, echec, critique, echec-critique. */
function natureResultat({ critique, echecCritique, reussite }) {
  return echecCritique ? "echec-critique" : critique ? "critique" : reussite ? "reussite" : "echec";
}

/** Libellé coloré du résultat (suivi de l'auteur n° 11 : succès en vert, échecs en rouge). */
function libelleResultat(resultat) {
  return `<span class="gw-resultat ${natureResultat(resultat)}">${game.i18n.localize(flavorResultatCle(resultat))}</span>`;
}

/** Drapeau du message : la classe gw-<nature> est posée sur le message à l'affichage (couleur du total). */
const drapeauResultat = (resultat) => ({ "galactic-wars": { resultat: natureResultat(resultat) } });

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
 * @param {string} [options.titre] en-tête affiché au-dessus du jet (ex. nom de l'arme utilisée,
 *   voir GalacticWarsItem#attaquer) — texte brut, échappé ici.
 */
export async function rollCompetence(actor, cle, { titre } = {}) {
  const competence = actor.system.competences?.find((c) => c.cle === cle);
  if (!competence) {
    ui.notifications.warn(game.i18n.format("GALACTICWARS.Avertissement.CompetenceInconnue", { cle }));
    return null;
  }
  if (competence.bloquee) {
    ui.notifications.warn(game.i18n.localize("GALACTICWARS.Sheet.CompetenceBloquee"));
    return null;
  }

  const cible = Math.min(100, competence.total);

  const resultat = await resoudrePourcentage(cible);
  const flavor = game.i18n.format("GALACTICWARS.Jet.Flavor", {
    competence: game.i18n.localize(competence.label),
    cible
  });
  const flavorTitre = titre ? `<strong class="gw-jet-titre">${foundry.utils.escapeHTML(titre)}</strong><br>` : "";

  await resultat.roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${flavorTitre}${flavor}<br>${libelleResultat(resultat)}`,
    flags: drapeauResultat(resultat)
  });

  // `cible` : taux effectif du jet (marge = cible − dé, voir helpers/combat.mjs) ; `echelle` : d20 ou pourcentage.
  return { ...resultat, cible, echelle: "pourcentage" };
}

/**
 * Jet de Survie (fiche rapide) : reste en pourcentage même si les 8 caractéristiques de
 * la fiche rapide, elles, se jettent en d20 (voir rollCaracteristiqueD20).
 * @param {Actor} actor
 */
export async function rollSurvie(actor) {
  return rollPourcentageSimple(actor, "GALACTICWARS.Sheet.Survie", actor.system.survie.total);
}

/**
 * Jet de Chance (fiche rapide / PNJ, v0.23.0) : 1d100 sous la valeur, comme la Survie.
 * @param {Actor} actor
 */
export async function rollChance(actor) {
  return rollPourcentageSimple(actor, "GALACTICWARS.Sheet.Chance", actor.system.chance);
}

/** Jet en % sous une valeur fixe, sans modificateur, envoyé au tchat. */
async function rollPourcentageSimple(actor, libelle, cible) {
  const resultat = await resoudrePourcentage(cible);
  const flavor = game.i18n.format("GALACTICWARS.Jet.Flavor", {
    competence: game.i18n.localize(libelle),
    cible
  });

  await resultat.roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${flavor}<br>${libelleResultat(resultat)}`,
    flags: drapeauResultat(resultat)
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
export async function rollCaracteristiqueD20(actor, cle, { titre } = {}) {
  if (actor.type !== "personnage-rapide") {
    throw new Error("rollCaracteristiqueD20 attend un Actor de type personnage-rapide");
  }
  // Valeur jouée : saisie + effets actifs (traits, talents).
  const valeur = actor.system.caracteristiquesTotales?.[cle] ?? actor.system.caracteristiques?.[cle];
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

  const resultat = { reussite, critique, echecCritique };
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${titreDuJet(titre)}${flavor}<br>${libelleResultat(resultat)}`,
    flags: drapeauResultat(resultat)
  });

  return { roll, reussite, critique, echecCritique, cible: valeur, echelle: "d20" };
}

/**
 * Jet de caractéristique en pourcentage (PNJ) : 1d100 <= total% = réussite. Les PNJ
 * partagent le même bloc de 8 caractéristiques que la fiche rapide (voir
 * rollCaracteristiqueD20), mais résolu en % comme la fiche classique — deux mécaniques
 * différentes sur le même schéma de données, d'où deux fonctions distinctes.
 * @param {Actor} actor
 * @param {string} cle une des 8 clés de system.caracteristiques
 */
export async function rollCaracteristiquePourcentage(actor, cle, { titre } = {}) {
  if (actor.type !== "pnj") {
    throw new Error("rollCaracteristiquePourcentage attend un Actor de type pnj");
  }
  // Valeur jouée : saisie + effets actifs (bonus d20 × 5, voir PersonnageRapideData).
  const valeur = actor.system.caracteristiquesTotales?.[cle] ?? actor.system.caracteristiques?.[cle];
  if (valeur === undefined) {
    ui.notifications.warn(game.i18n.format("GALACTICWARS.Avertissement.CaracteristiqueInconnue", { cle }));
    return null;
  }

  // Plafond à 100, comme rollCompetence (v0.26.0) : la marge d'un jet en % ne dépasse pas l'échelle.
  const cible = Math.min(100, valeur);
  const resultat = await resoudrePourcentage(cible);
  const flavor = game.i18n.format("GALACTICWARS.Jet.Flavor", {
    competence: game.i18n.localize(GW.caracteristiquesRapides[cle] ?? cle),
    cible
  });

  await resultat.roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${titreDuJet(titre)}${flavor}<br>${libelleResultat(resultat)}`,
    flags: drapeauResultat(resultat)
  });

  return { ...resultat, cible, echelle: "pourcentage" };
}

/** Ligne de titre (nom de l'arme…) en tête d'un jet, échappée. */
function titreDuJet(titre) {
  return titre ? `<strong class="gw-jet-titre">${foundry.utils.escapeHTML(titre)}</strong><br>` : "";
}

/**
 * Jet d'attaque ou de défense selon la fiche (v0.26.0) : compétence en % (classique), caractéristique en d20
 * (fiche rapide) ou en % (PNJ). null si le jet est impossible (avertissement déjà affiché).
 * @param {Actor} actor
 * @param {{competence?: string, caracteristique?: string, titre?: string}} options
 */
export async function rollAttaque(actor, { competence, caracteristique, titre } = {}) {
  const type = actor?.type;
  if (type === "personnage") return rollCompetence(actor, competence, { titre });
  if (type === "personnage-rapide" || type === "pnj") {
    if (!caracteristique) {
      ui.notifications.warn(game.i18n.format("GALACTICWARS.Objet.SansCaracteristique", { nom: titre ?? "" }));
      return null;
    }
    return type === "pnj"
      ? rollCaracteristiquePourcentage(actor, caracteristique, { titre })
      : rollCaracteristiqueD20(actor, caracteristique, { titre });
  }
  ui.notifications.warn(game.i18n.format("GALACTICWARS.Objet.FicheSansAttaque", { nom: actor?.name ?? "" }));
  return null;
}

/**
 * Jet additif en d20 (fiche sith) : 1d20 + valeur, comparé à un DC fixé par le MJ en
 * cours de partie — le système ne détermine pas la réussite lui-même (pas de DC stocké
 * sur la fiche), contrairement aux autres mécaniques (%, d20 sous la valeur).
 * @param {Actor} actor
 * @param {string} labelKey clé i18n du libellé affiché dans le message de jet
 * @param {number} valeur le modificateur ajouté au d20
 */
/** À enregistrer au hook "init" : classe gw-<nature> sur les messages de jet (couleur du total du dé). */
export function enregistrerHooksJets() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    const nature = message.getFlag?.("galactic-wars", "resultat");
    if (nature) html.classList.add("gw-jet", `gw-${nature}`);
  });
}

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
