import { GW } from "../config.mjs";
import { rollCompetence } from "./rolls.mjs";

/**
 * Attaque → défense (demande de l'auteur, 2026-09-25). Une attaque réussie sur des tokens ciblés
 * poste une carte « Défense » : chaque cible (son propriétaire ou le MJ) tente Parade/esquive ou
 * Protection de la Force — les deux sont toujours proposées, que l'arme soit de mêlée ou à distance.
 * Si la défense réussit aussi, la meilleure réussite l'emporte : critique > simple, puis la plus
 * grande marge (taux − dé) ; à égalité, la défense l'emporte.
 */

/** Arme à distance d'après sa compétence liée (GW.competencesDistance), sinon mêlée. */
export function estArmeADistance(arme) {
  return GW.competencesDistance.includes(arme?.system?.competence);
}

/** Résumé d'un jet de compétence réussi ou non, pour comparaison et affichage. */
function resume(resultat) {
  return {
    de: resultat.roll.total,
    cible: resultat.cible,
    reussite: resultat.reussite,
    critique: resultat.critique,
    marge: resultat.cible - resultat.roll.total
  };
}

/** Vrai si l'attaque passe la défense (les deux jets sont des résumés). */
export function attaqueLEmporte(attaque, defense) {
  if (!attaque.reussite) return false;
  if (!defense.reussite) return true;
  const rang = (j) => (j.critique ? 2 : 1);
  if (rang(attaque) !== rang(defense)) return rang(attaque) > rang(defense);
  return attaque.marge > defense.marge;
}

/**
 * Carte « Défense » après une attaque réussie. `tokens` : cibles de l'attaquant (TokenDocument).
 * @param {Item} arme
 * @param {object} resultat retour de rollCompetence (avec `cible`)
 * @param {TokenDocument[]} tokens
 */
export async function proposerDefense(arme, resultat, tokens) {
  if (!resultat?.reussite || !tokens.length) return null;
  const echapper = foundry.utils.escapeHTML;
  const distance = estArmeADistance(arme);
  const lignes = tokens.map((t) => `
    <li class="gw-defense-cible" data-token-uuid="${t.uuid}">
      <img src="${t.texture.src}" alt="">
      <span class="gw-defense-nom">${echapper(t.name)}</span>
      <span class="gw-defense-actions"></span>
    </li>`).join("");
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: arme.actor }),
    content: `<div class="gw-carte-defense">
      <header><strong>${game.i18n.localize("GALACTICWARS.Combat.Defense")}</strong>
        — ${echapper(arme.name)} (${game.i18n.localize(distance ? "GALACTICWARS.Combat.Distance" : "GALACTICWARS.Combat.Melee")})</header>
      <p class="gw-defense-consigne">${game.i18n.localize("GALACTICWARS.Combat.DefenseConsigne")}</p>
      <ul>${lignes}</ul>
    </div>`,
    flags: {
      "galactic-wars": {
        defense: { armeNom: arme.name, attaquant: arme.actor?.name ?? "", attaque: resume(resultat) }
      }
    }
  });
}

/** Défense choisie par la cible : jet, puis verdict posté dans le tchat. */
async function defendre(actor, nomCible, cle, defense) {
  const titre = game.i18n.format("GALACTICWARS.Combat.DefenseContre", { arme: defense.armeNom });
  const resultat = await rollCompetence(actor, cle, { titre });
  if (!resultat) return;
  const touche = attaqueLEmporte(defense.attaque, resume(resultat));
  const echapper = foundry.utils.escapeHTML;
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="gw-verdict ${touche ? "touche" : "evite"}">
      <i class="fa-solid ${touche ? "fa-burst" : "fa-shield-halved"}"></i>
      ${game.i18n.format(touche ? "GALACTICWARS.Combat.Touche" : "GALACTICWARS.Combat.Evite", {
        cible: echapper(nomCible), attaquant: echapper(defense.attaquant), arme: echapper(defense.armeNom)
      })}
      <span class="gw-verdict-marges">${game.i18n.format("GALACTICWARS.Combat.Marges", {
        attaque: defense.attaque.marge, defense: resultat.cible - resultat.roll.total
      })}</span>
    </div>`
  });
}

/** Boutons de la carte « Défense » : seulement pour le propriétaire de la cible (ou le MJ). */
function brancherDefense(message, html) {
  const defense = message.getFlag("galactic-wars", "defense");
  if (!defense || !html?.querySelector) return;
  for (const ligne of html.querySelectorAll(".gw-defense-cible[data-token-uuid]")) {
    const zone = ligne.querySelector(".gw-defense-actions");
    let token = null;
    try {
      token = fromUuidSync(ligne.dataset.tokenUuid);
    } catch {}
    const actor = token?.actor;
    if (!zone || zone.childElementCount || !actor?.isOwner) continue;
    if (!actor.system.competences) {
      // PNJ sans compétences en % : défense résolue à la main par le MJ.
      zone.innerHTML = `<em>${game.i18n.localize("GALACTICWARS.Combat.DefenseManuelle")}</em>`;
      continue;
    }
    for (const cle of GW.competencesDefense) {
      const competence = actor.system.competences.find((c) => c.cle === cle);
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.innerHTML = `${game.i18n.localize(GW.competences[cle].label)} <span class="mono">${competence?.total ?? 0}%</span>`;
      const indisponible = !competence || competence.bloquee || (GW.competences[cle].force && !actor.system.sensibleForce);
      if (indisponible) {
        bouton.disabled = true;
        bouton.dataset.tooltip = game.i18n.localize("GALACTICWARS.Combat.DefenseIndisponible");
      }
      bouton.addEventListener("click", async (event) => {
        event.preventDefault();
        for (const b of zone.querySelectorAll("button")) b.disabled = true;
        await defendre(actor, token.name, cle, defense);
      });
      zone.append(bouton);
    }
  }
}

export function enregistrerHooksCombat() {
  Hooks.on("renderChatMessageHTML", brancherDefense);
}
