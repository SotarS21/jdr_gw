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

/** Enregistrement des hooks de tchat des objets (appelé une fois depuis galactic-wars.mjs). */
export function enregistrerHooksChatObjet() {
  Hooks.on("renderChatMessageHTML", brancherCarte);
}
