import { GW } from "../config.mjs";

/** Types d'acteurs qui peuvent être membres d'un équipage. */
export const TYPES_MEMBRES = ["personnage", "personnage-rapide", "personnage-sith", "pnj"];

/** Types d'objets rangés dans la réserve d'un équipage. */
export const TYPES_OBJETS_RESERVE = ["arme", "armure", "equipement"];

/** Équipages (acteurs du monde) dont `acteur` est membre. */
export function equipagesDe(acteur) {
  if (!acteur) return [];
  const uuid = acteur.isToken ? acteur.token?.baseActor?.uuid ?? acteur.uuid : acteur.uuid;
  return game.actors.filter((a) => a.type === "equipage" && a.system.membres.includes(uuid));
}

/** Premier vaisseau d'équipage de `acteur` : { vaisseau, equipage } ou null. */
export function vaisseauDEquipage(acteur) {
  for (const equipage of equipagesDe(acteur)) {
    const vaisseau = equipage.system.vaisseau?.uuid ? fromUuidSync(equipage.system.vaisseau.uuid) : null;
    if (vaisseau) return { vaisseau, equipage };
  }
  return null;
}

/** PV actuels / max d'un acteur selon son type (GW.cheminPV), ou null. */
export function pvDe(acteur) {
  const chemin = GW.cheminPV[acteur?.type];
  if (!chemin) return null;
  return { value: foundry.utils.getProperty(acteur, chemin) ?? 0, max: acteur.system.pv?.max ?? 0 };
}

const notifier = (cle, donnees = {}, type = "info") => ui.notifications[type](game.i18n.format(`GALACTICWARS.Equipage.${cle}`, donnees));

/**
 * Déplace un objet d'un acteur à un autre (réserve ↔ membre) : copie chez le destinataire puis suppression chez
 * l'expéditeur. Il faut pouvoir modifier les deux acteurs.
 * @returns {Promise<Item|null>} l'objet créé
 */
export async function deplacerObjet(objet, destinataire) {
  const source = objet?.parent;
  if (!source || !destinataire || source === destinataire) return null;
  if (!source.isOwner || !destinataire.isOwner) {
    notifier("DroitsInsuffisants", { source: source.name, destinataire: destinataire.name }, "warn");
    return null;
  }
  const donnees = objet.toObject();
  delete donnees._id;
  // Un objet déposé dans la réserve est rangé ; donné à un membre, il reste rangé (le membre le porte s'il veut).
  if ("porte" in (donnees.system ?? {})) donnees.system.porte = false;
  const [cree] = await destinataire.createEmbeddedDocuments("Item", [donnees]);
  if (cree) await objet.delete();
  return cree ?? null;
}

/**
 * Transfert de crédits entre un membre et la caisse commune. `montant` > 0 : le membre verse ; < 0 : il prend.
 * @returns {Promise<boolean>}
 */
export async function transfererCredits(equipage, membre, montant) {
  montant = Math.trunc(Number(montant) || 0);
  if (!montant) return false;
  if (!equipage.isOwner || !membre.isOwner) {
    notifier("DroitsInsuffisants", { source: membre.name, destinataire: equipage.name }, "warn");
    return false;
  }
  const soldeMembre = membre.system.credits ?? 0;
  const caisse = equipage.system.credits ?? 0;
  if (montant > 0 && montant > soldeMembre) {
    notifier("CreditsInsuffisants", { nom: membre.name, solde: soldeMembre }, "warn");
    return false;
  }
  if (montant < 0 && -montant > caisse) {
    notifier("CaisseInsuffisante", { solde: caisse }, "warn");
    return false;
  }
  await membre.update({ "system.credits": soldeMembre - montant });
  await equipage.update({ "system.credits": caisse + montant });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: membre }),
    content: `<div class="gw-equipage-credits"><i class="fa-solid fa-coins"></i> ${game.i18n.format(
      montant > 0 ? "GALACTICWARS.Equipage.MessageVerse" : "GALACTICWARS.Equipage.MessagePris",
      { nom: foundry.utils.escapeHTML(membre.name), montant: Math.abs(montant), equipage: foundry.utils.escapeHTML(equipage.name) }
    )}</div>`
  });
  return true;
}

/* ---------------------------------------------------------------- */
/* Point d'équipe (suivi n° 28)                                     */
/* ---------------------------------------------------------------- */

const CANAL = "system.galactic-wars";

/** Membres (acteurs) de l'équipage dont `user` est propriétaire, son personnage attitré en premier. */
export function membresDeLUtilisateur(equipage, user = game.user) {
  const membres = equipage.system.membres.map((uuid) => fromUuidSync(uuid)).filter((a) => a?.testUserPermission?.(user, "OWNER"));
  return membres.sort((a, b) => (b === user.character) - (a === user.character));
}

/** Vrai si `user` peut dépenser un point d'équipe : MJ, ou propriétaire d'au moins un membre. */
export function peutDepenserPointEquipe(equipage, user = game.user) {
  return user.isGM || membresDeLUtilisateur(equipage, user).length > 0;
}

/** Le MJ ajoute (delta > 0) ou retire des points d'équipe. Seul le MJ peut en donner. */
export async function ajusterPointsEquipe(equipage, delta) {
  if (!game.user.isGM) return notifier("PointsEquipeReserveMJ", {}, "warn");
  const points = Math.max(0, (equipage.system.pointsEquipe ?? 0) + Math.trunc(delta));
  await equipage.update({ "system.pointsEquipe": points });
}

/**
 * Un membre dépense un point d'équipe : −1 et message « tous les membres réussissent l'action d'équipe ». Si
 * l'utilisateur ne peut pas modifier l'équipage (simple observateur), la dépense est relayée au MJ connecté.
 * @returns {Promise<boolean>}
 */
export async function depenserPointEquipe(equipage, user = game.user) {
  if (!peutDepenserPointEquipe(equipage, user)) {
    if (user === game.user) notifier("PointsEquipeNonMembre", {}, "warn");
    return false;
  }
  const points = equipage.system.pointsEquipe ?? 0;
  if (points <= 0) {
    if (user === game.user) notifier("AucunPointEquipe", {}, "warn");
    return false;
  }
  if (!equipage.isOwner) {
    if (!game.users.activeGM) {
      notifier("PointsEquipeSansMJ", {}, "warn");
      return false;
    }
    game.socket.emit(CANAL, { type: "equipage", action: "depenserPoint", equipage: equipage.uuid, user: user.id });
    return true;
  }
  await equipage.update({ "system.pointsEquipe": points - 1 });
  const membre = membresDeLUtilisateur(equipage, user)[0];
  const echapper = foundry.utils.escapeHTML;
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: membre ?? equipage }),
    content: `<div class="gw-point-equipe"><i class="fa-solid fa-handshake"></i> ${game.i18n.format("GALACTICWARS.Equipage.MessagePointEquipe", {
      nom: echapper(membre?.name ?? user.name), equipage: echapper(equipage.name), reste: points - 1
    })}</div>`
  });
  return true;
}

/** À appeler au hook "ready" : le MJ actif exécute les dépenses relayées par les joueurs. */
export function enregistrerSocketEquipage() {
  game.socket.on(CANAL, async (message) => {
    if (message?.type !== "equipage" || message.action !== "depenserPoint") return;
    if (game.users.activeGM !== game.user) return;
    const equipage = await fromUuid(message.equipage);
    const user = game.users.get(message.user);
    if (equipage?.type === "equipage" && user) await depenserPointEquipe(equipage, user);
  });
}
