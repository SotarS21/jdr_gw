import { appareilSelonNom, IMAGES_APPAREILS } from "./appareils.mjs";
import { GW } from "../config.mjs";

/**
 * Applique un métier (Item type "metier") sur un Actor : équipement de départ, référence
 * au métier, et — uniquement pour les Actor qui ont un tableau `system.competences` (la
 * fiche classique ; pas la fiche rapide) — les bonus de compétence accordés. Les objets
 * précédemment créés par un métier sont marqués du flag `startingGear` pour pouvoir être
 * proprement remplacés si le joueur change de métier.
 *
 * Aucun prérequis n'est vérifié (ex. "Padawan niveau 4" pour Jedi consulaire) : tout métier
 * est accessible directement, à la demande de l'auteur (2026-09-23). Les prérequis restent
 * renseignés sur l'Item métier à titre informatif.
 * @param {Actor} actor
 * @param {Item} metierItem
 */
export async function applyMetier(actor, metierItem) {
  if (metierItem.type !== "metier") throw new Error("applyMetier attend un Item de type metier");

  const ancienEquipement = actor.items.filter((i) => i.getFlag("galactic-wars", "startingGear"));
  if (ancienEquipement.length) {
    await actor.deleteEmbeddedDocuments(
      "Item",
      ancienEquipement.map((i) => i.id)
    );
  }

  const nouveauxObjets = metierItem.system.equipement.map((e) => {
    const appareil = appareilSelonNom(e.nom);
    return {
      name: e.nom,
      type: "equipement",
      ...(IMAGES_APPAREILS[appareil] ? { img: IMAGES_APPAREILS[appareil] } : {}),
      system: { quantite: e.quantite, appareil },
      flags: { "galactic-wars": { startingGear: true } }
    };
  });
  if (nouveauxObjets.length) await actor.createEmbeddedDocuments("Item", nouveauxObjets);

  const updates = {
    "system.metier.uuid": metierItem.uuid,
    "system.metier.nom": metierItem.name
  };

  if (Array.isArray(actor.system.competences)) {
    updates["system.competences"] = competencesSelonMetier(actor.system.toObject().competences, metierItem);
  }
  if ("description" in (actor.system.metier ?? {}) && metierItem.system.talent?.description) {
    updates["system.metier.description"] = metierItem.system.talent.description;
  }

  await actor.update(updates);

  return true;
}

/**
 * Bonus de métier, acquisition et point orange recalculés d'après le métier, sur une copie du
 * tableau complet de compétences (à écrire en un seul update — jamais un index d'ArrayField).
 * @param {object[]} competences  source (toObject) du tableau system.competences
 * @param {Item} metierItem
 * @returns {object[]}
 */
export function competencesSelonMetier(competences, metierItem) {
  const accordees = new Map(metierItem.system.competences.map((c) => [c.cle, c]));
  return competences.map((c) => {
    const accordee = accordees.get(c.cle);
    if (!accordee) return { ...c, metier: 0, acquiseParMetier: false, recommandee: false };
    return { ...c, metier: accordee.bonus, acquiseParMetier: true, recommandee: accordee.obligatoire };
  });
}

void GW; // réservé pour une future validation croisée avec la liste des compétences
