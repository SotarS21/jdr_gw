/**
 * Boutons des cartes d'objet du tchat (templates/chat/objet-carte.hbs, postées par
 * GalacticWarsItem#afficherDansTchat) : Attaquer / Dégâts. L'objet est retrouvé via
 * flags["galactic-wars"].itemUuid du message.
 */

/** Droit d'utiliser les boutons : MJ, ou propriétaire de l'objet (item.isOwner). */
function peutUtiliser(item) {
  return game.user.isGM || !!item?.isOwner;
}

/**
 * Objet de la carte, résolu sans attendre pour décider de l'affichage des boutons au rendu
 * (le hook est synchrone). fromUuidSync suffit pour un objet d'acteur du monde ; pour un
 * objet de compendium il ne renvoie qu'une entrée d'index (sans isOwner) : boutons retirés
 * sauf pour le MJ, ce qui est le comportement voulu.
 */
function objetSync(uuid) {
  try {
    return uuid ? fromUuidSync(uuid) : null;
  } catch {
    return null;
  }
}

function brancherCarte(message, html) {
  const carte = html?.querySelector?.(".galactic-wars-carte-objet");
  if (!carte) return;
  const uuid = message.getFlag("galactic-wars", "itemUuid");
  const actions = carte.querySelector(".carte-actions");
  if (!actions) return;

  if (!peutUtiliser(objetSync(uuid))) {
    actions.remove();
    return;
  }

  for (const bouton of actions.querySelectorAll("[data-gw-carte-action]")) {
    bouton.addEventListener("click", async (event) => {
      event.preventDefault();
      const item = uuid ? await fromUuid(uuid).catch(() => null) : null;
      if (!item) {
        ui.notifications.warn(game.i18n.localize("GALACTICWARS.Objet.Introuvable"));
        return;
      }
      if (!peutUtiliser(item)) return;
      bouton.disabled = true;
      try {
        if (bouton.dataset.gwCarteAction === "attaquer") await item.attaquer();
        else if (bouton.dataset.gwCarteAction === "degats") await item.lancerDegats();
      } finally {
        bouton.disabled = false;
      }
    });
  }
}

/**
 * Jet de dégâts d'une arme (GalacticWarsItem#lancerDegats) : bouton « Appliquer les dégâts »,
 * MJ uniquement (choix de l'auteur). Cibles = tokens sélectionnés par le MJ au moment du clic,
 * sinon ceux que l'attaquant ciblait au moment du jet. Chaque cible encaisse les dégâts moins sa réduction (armures portées
 * + armure naturelle), bilan posté dans le tchat.
 */
function brancherDegats(message, html) {
  const degats = message.getFlag("galactic-wars", "degats");
  if (!degats || !game.user.isGM || !html?.querySelector) return;
  const zone = html.querySelector(".message-content");
  if (!zone || zone.querySelector(".gw-appliquer-degats")) return;

  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "gw-appliquer-degats";
  bouton.innerHTML = `<i class="fa-solid fa-heart-crack"></i> ${game.i18n.localize("GALACTICWARS.Combat.Appliquer")}`;
  if (degats.cibles?.length) {
    bouton.dataset.tooltip = game.i18n.format("GALACTICWARS.Combat.AppliquerCibles", { nombre: degats.cibles.length });
  }
  bouton.addEventListener("click", async (event) => {
    event.preventDefault();
    bouton.disabled = true;
    try {
      await appliquerDegats(degats);
    } finally {
      bouton.disabled = false;
    }
  });
  zone.append(bouton);
}

async function appliquerDegats({ total, cibles = [] }) {
  let tokens = (canvas.tokens?.controlled ?? []).map((t) => t.document);
  if (!tokens.length) tokens = (await Promise.all(cibles.map((uuid) => fromUuid(uuid).catch(() => null)))).filter(Boolean);
  if (!tokens.length) {
    ui.notifications.warn(game.i18n.localize("GALACTICWARS.Combat.AucuneCible"));
    return;
  }
  const echapper = foundry.utils.escapeHTML;
  const lignes = [];
  for (const token of tokens) {
    const actor = token.actor;
    if (!actor) continue;
    const resultat = await actor.encaisserDegats(total);
    if (!resultat) {
      ui.notifications.warn(game.i18n.format("GALACTICWARS.Combat.SansPV", { nom: token.name }));
      continue;
    }
    lignes.push(`<li>${game.i18n.format("GALACTICWARS.Combat.Bilan", { nom: echapper(token.name), ...resultat })}</li>`);
  }
  if (!lignes.length) return;
  await ChatMessage.create({
    content: `<div class="gw-bilan-degats"><strong>${game.i18n.localize("GALACTICWARS.Combat.DegatsAppliques")}</strong><ul>${lignes.join("")}</ul></div>`,
    whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id)
  });
}

/** Enregistrement des hooks de tchat des objets (appelé une fois depuis galactic-wars.mjs). */
export function enregistrerHooksChatObjet() {
  Hooks.on("renderChatMessageHTML", brancherCarte);
  Hooks.on("renderChatMessageHTML", brancherDegats);
}
