import { objetDeDepart, estContactDeDepart, pnjDeDepart } from "./objets-depart.mjs";
import { GW } from "../config.mjs";
import { ficheDeLActeur } from "./effets.mjs";

/** Types d'acteur qui reçoivent le trait du métier (fiche classique, fiche rapide, PNJ). */
const TYPES_AVEC_TRAIT = ["personnage", "personnage-rapide", "pnj"];

/**
 * Données de création du trait du métier adapté à l'acteur (variante de GW.fichesTrait), ou null.
 * @param {Actor} actor
 * @param {Item} metierItem
 */
export async function traitDuMetier(actor, metierItem) {
  if (!TYPES_AVEC_TRAIT.includes(actor.type)) return null;
  const uuid = metierItem.system.traits?.[ficheDeLActeur(actor)];
  const trait = uuid ? await fromUuid(uuid).catch(() => null) : null;
  if (trait?.type !== "talent") return null;
  const donnees = trait.toObject();
  delete donnees._id;
  foundry.utils.setProperty(donnees, "flags.galactic-wars.traitMetier", true);
  foundry.utils.setProperty(donnees, "_stats.compendiumSource", trait.uuid);
  return donnees;
}

/**
 * Pose du trait du métier face aux talents déjà portés par l'acteur (les objets à drapeau traitMetier, retirés au
 * changement de métier, sont ignorés) — évite un doublon dont les effets se cumuleraient :
 * - talent venu du même trait (même lien compendium, ex. ajouté à la main par le bouton +) : il reçoit le drapeau
 *   traitMetier (remplacé normalement au prochain changement de métier), rien n'est créé ;
 * - autre variante du même trait (compendium Traits, même nom) : remplacée par la variante adaptée à la fiche ;
 * - talent homonyme d'une autre origine (maison, compendium Talents) : gardé tel quel, le trait n'est pas posé.
 * @param {Actor} actor
 * @param {object} trait données de création (traitDuMetier)
 * @returns {{ creer: object|null, marquer: Item|null, supprimer: Item|null }}
 */
export function planPoseTrait(actor, trait) {
  const talents = actor.items.filter((i) => i.type === "talent" && !i.getFlag("galactic-wars", "traitMetier"));
  const source = trait._stats?.compendiumSource;
  const meme = source ? talents.find((i) => i._stats?.compendiumSource === source) : null;
  if (meme) return { creer: null, marquer: meme, supprimer: null };
  const homonyme = talents.find((i) => i.name === trait.name);
  if (!homonyme) return { creer: trait, marquer: null, supprimer: null };
  const duCompendiumTraits = String(homonyme._stats?.compendiumSource ?? "").startsWith(`Compendium.${game.system.id}.traits.`);
  if (duCompendiumTraits) return { creer: trait, marquer: null, supprimer: homonyme };
  return { creer: null, marquer: null, supprimer: null };
}

/**
 * Applique un métier (Item type "metier") sur un Actor : équipement de départ, référence
 * au métier, et — uniquement pour les Actor qui ont un tableau `system.competences` (la
 * fiche classique ; pas la fiche rapide) — les bonus de compétence accordés. Les objets
 * précédemment créés par un métier sont marqués du flag `startingGear` pour pouvoir être
 * proprement remplacés si le joueur change de métier.
 *
 * Aucun prérequis : tout métier est accessible directement, à la demande de l'auteur (2026-09-23) ;
 * niveau minimum et métier requis supprimés des Items métier en v0.19.9.
 * @param {Actor} actor
 * @param {Item} metierItem
 */
export async function applyMetier(actor, metierItem) {
  if (metierItem.type !== "metier") throw new Error("applyMetier attend un Item de type metier");

  const trait = await traitDuMetier(actor, metierItem);
  const pose = trait ? planPoseTrait(actor, trait) : { creer: null, marquer: null, supprimer: null };
  const ancienEquipement = actor.items.filter((i) => i.getFlag("galactic-wars", "startingGear") || i.getFlag("galactic-wars", "traitMetier"));
  if (pose.supprimer) ancienEquipement.push(pose.supprimer);
  if (pose.marquer) await pose.marquer.setFlag("galactic-wars", "traitMetier", true);
  if (ancienEquipement.length) {
    await actor.deleteEmbeddedDocuments(
      "Item",
      ancienEquipement.map((i) => i.id)
    );
  }

  // Contacts (« Connaissance dans la pègre »…) : PNJ de l'onglet Notes sur la fiche classique, qui a
  // des Notes ; objets ailleurs. Armes et armures reconnues : copies typées du compendium.
  const avecNotes = Array.isArray(actor.system.pnjs);
  const lignes = metierItem.system.equipement;
  const contacts = avecNotes ? lignes.filter((e) => estContactDeDepart(e.nom)) : [];
  const nouveauxObjets = await Promise.all(lignes.filter((e) => !contacts.includes(e)).map((e) => objetDeDepart(e)));
  if (pose.creer) nouveauxObjets.push(pose.creer);
  if (nouveauxObjets.length) await actor.createEmbeddedDocuments("Item", nouveauxObjets);

  const updates = {
    "system.metier.uuid": metierItem.uuid,
    "system.metier.nom": metierItem.name
  };

  if (avecNotes) {
    // Contacts de départ de l'ancien métier encore intacts remplacés ; les PNJ du joueur sont gardés.
    const pnjs = actor.system.toObject().pnjs.filter((p) => !p.origineMetier);
    updates["system.pnjs"] = [...pnjs, ...contacts.map((e) => pnjDeDepart(e.nom, metierItem.name))];
  }
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
