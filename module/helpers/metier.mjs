import { GW } from "../config.mjs";

/**
 * Vérifie les prérequis d'un métier (nom du métier requis + niveau minimum).
 * @returns {{ok: boolean, raison?: string}}
 */
export function verifierPrerequisMetier(actor, metierItem) {
  const { metier: metierRequis, niveauMinimum } = metierItem.system.prerequis;

  if (metierRequis && actor.system.metier.nom !== metierRequis) {
    return {
      ok: false,
      raison: game.i18n.format("GALACTICWARS.Avertissement.PrerequisMetierManquant", { metier: metierRequis })
    };
  }
  if (niveauMinimum && actor.system.niveau < niveauMinimum) {
    return {
      ok: false,
      raison: game.i18n.format("GALACTICWARS.Avertissement.NiveauInsuffisant", { niveau: niveauMinimum })
    };
  }
  return { ok: true };
}

/**
 * Applique un métier (Item type "metier") sur un Actor "personnage" : compétences +
 * équipement de départ. Les objets précédemment créés par un métier sont marqués du flag
 * `startingGear` pour pouvoir être proprement remplacés si le joueur change de métier.
 * @param {Actor} actor
 * @param {Item} metierItem
 * @param {object} [options]
 * @param {boolean} [options.ignorerPrerequis=false]
 */
export async function applyMetier(actor, metierItem, { ignorerPrerequis = false } = {}) {
  if (metierItem.type !== "metier") throw new Error("applyMetier attend un Item de type metier");

  if (!ignorerPrerequis) {
    const verification = verifierPrerequisMetier(actor, metierItem);
    if (!verification.ok) {
      ui.notifications.warn(verification.raison);
      return false;
    }
  }

  const ancienEquipement = actor.items.filter((i) => i.getFlag("galactic-wars", "startingGear"));
  if (ancienEquipement.length) {
    await actor.deleteEmbeddedDocuments(
      "Item",
      ancienEquipement.map((i) => i.id)
    );
  }

  const nouveauxObjets = metierItem.system.equipement.map((e) => ({
    name: e.nom,
    type: "equipement",
    system: { quantite: e.quantite },
    flags: { "galactic-wars": { startingGear: true } }
  }));
  if (nouveauxObjets.length) await actor.createEmbeddedDocuments("Item", nouveauxObjets);

  const bonusParCle = new Map(metierItem.system.competences.map((c) => [c.cle, c.bonus]));
  const competences = actor.system.competences.map((c) => {
    const bonus = bonusParCle.get(c.cle);
    if (bonus === undefined) return { ...c, metier: 0, acquiseParMetier: false };
    return { ...c, metier: bonus, acquiseParMetier: true };
  });

  await actor.update({
    "system.metier.uuid": metierItem.uuid,
    "system.metier.nom": metierItem.name,
    "system.competences": competences
  });

  return true;
}

void GW; // réservé pour une future validation croisée avec la liste des compétences
