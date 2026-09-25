/**
 * Comlink (équipement d'appareil "comlink", demande de l'auteur) : canaux numérotés (contact,
 * actif / inactif, archivé) et, si la messagerie est activée (« comlink ++ »), une conversation
 * par canal — messages du MJ à gauche (au nom du contact), du PJ à droite (au nom du porteur),
 * marqués « vu » par le MJ.
 *
 * `system.comlink.canaux` est un ArrayField (messages imbriqués) : chaque opération réécrit le
 * tableau complet, jamais un seul index (voir JOURNAL.md, corruption des ArrayField).
 */

const echapper = (texte) => foundry.utils.escapeHTML(String(texte ?? ""));
const t = (cle, data) => (data ? game.i18n.format(`GALACTICWARS.Comlink.${cle}`, data) : game.i18n.localize(`GALACTICWARS.Comlink.${cle}`));

/** Copie modifiable des canaux (source, sans données dérivées). */
function canauxSource(item) {
  return foundry.utils.deepClone(item.system.toObject().comlink?.canaux ?? []);
}

function enregistrer(item, canaux) {
  return item.update({ "system.comlink.canaux": canaux });
}

/** Numéro suivant : plus grand numéro existant (archives comprises) + 1. */
export function prochainNumero(canaux) {
  return canaux.reduce((max, c) => Math.max(max, c.numero ?? 0), 0) + 1;
}

/** Vrai si `numero` n'est utilisé par aucun autre canal (archives comprises). */
export function numeroLibre(canaux, numero, saufIndex = -1) {
  return !canaux.some((c, i) => i !== saufIndex && c.numero === numero);
}

/** Nouveau canal, numéro incrémenté automatiquement. Renvoie son index. */
export async function ajouterCanal(item) {
  const canaux = canauxSource(item);
  canaux.push({ numero: prochainNumero(canaux), nom: "", actif: true, archive: false, messages: [] });
  await enregistrer(item, canaux);
  return canaux.length - 1;
}

/**
 * Fenêtre de modification d'un canal : numéro (unique), nom du contact, communication active.
 * Un numéro déjà pris (ou invalide) est refusé : avertissement, rien n'est modifié.
 */
export async function modifierCanal(item, index) {
  const canaux = canauxSource(item);
  const canal = canaux[index];
  if (!canal) return;
  const contenu = `
    <div class="form-group"><label>${t("Numero")}</label>
      <input type="number" name="numero" value="${canal.numero}" min="1" step="1" required></div>
    <div class="form-group"><label>${t("Contact")}</label>
      <input type="text" name="nom" value="${echapper(canal.nom)}" placeholder="${t("ContactPlaceholder")}" autofocus></div>
    <div class="form-group"><label>${t("Communication")}</label>
      <select name="actif">
        <option value="true" ${canal.actif ? "selected" : ""}>${t("Actif")}</option>
        <option value="false" ${canal.actif ? "" : "selected"}>${t("Inactif")}</option>
      </select></div>`;
  const resultat = await foundry.applications.api.DialogV2.wait({
    window: { title: t("ModifierTitre", { numero: canal.numero }) },
    classes: ["galactic-wars", "galactic-wars-dialogue"],
    content: contenu,
    rejectClose: false,
    buttons: [
      {
        action: "ok", label: t("Enregistrer"), icon: "fa-solid fa-check", default: true,
        callback: (event, button, dialog) => {
          const form = button.form;
          const numero = Number(form.elements.numero.value);
          if (!Number.isInteger(numero) || numero < 1) {
            ui.notifications.warn(t("NumeroInvalide"));
            return null;
          }
          if (!numeroLibre(canaux, numero, index)) {
            ui.notifications.warn(t("NumeroPris", { numero }));
            return null;
          }
          return { numero, nom: form.elements.nom.value.trim(), actif: form.elements.actif.value === "true" };
        }
      },
      { action: "annuler", label: t("Annuler"), icon: "fa-solid fa-xmark" }
    ]
  });
  if (!resultat || typeof resultat !== "object") return;
  Object.assign(canal, resultat);
  await enregistrer(item, canaux);
}

/** Archive / désarchive un canal. */
export async function archiverCanal(item, index, archive) {
  const canaux = canauxSource(item);
  if (!canaux[index]) return;
  canaux[index].archive = archive;
  await enregistrer(item, canaux);
}

/** Configuration du comlink : messagerie on / off. */
export async function configurerComlink(item) {
  const actuelle = !!item.system.comlink?.messagerie;
  const messagerie = await foundry.applications.api.DialogV2.wait({
    window: { title: t("ConfigTitre") },
    classes: ["galactic-wars", "galactic-wars-dialogue"],
    content: `<div class="form-group"><label>${t("Messagerie")}</label>
      <input type="checkbox" name="messagerie" ${actuelle ? "checked" : ""}></div>
      <p class="hint">${t("MessagerieAide")}</p>`,
    rejectClose: false,
    buttons: [
      { action: "ok", label: t("Enregistrer"), icon: "fa-solid fa-check", default: true, callback: (e, b) => b.form.elements.messagerie.checked },
      { action: "annuler", label: t("Annuler"), icon: "fa-solid fa-xmark" }
    ]
  });
  if (typeof messagerie !== "boolean" || messagerie === actuelle) return;
  await item.update({ "system.comlink.messagerie": messagerie });
}

/**
 * Nouveau message sur un canal : le MJ écrit au nom du contact (à gauche), le joueur au nom du
 * porteur (à droite). Alerte chuchotée au destinataire (MJ, ou propriétaires du porteur).
 */
export async function envoyerMessage(item, index, texte) {
  texte = String(texte ?? "").trim();
  if (!texte) return;
  const canaux = canauxSource(item);
  const canal = canaux[index];
  if (!canal) return;
  const mj = game.user.isGM;
  const nom = mj ? (canal.nom || t("ContactInconnu")) : (item.actor?.name ?? game.user.name);
  canal.messages.push({ auteur: mj ? "mj" : "pj", nom, texte, vu: false });
  await enregistrer(item, canaux);
  await alerter(item, canal, mj);
}

/** MJ : bascule la marque « vu » d'un message du joueur. */
export async function basculerVu(item, index, indexMessage) {
  if (!game.user.isGM) return;
  const canaux = canauxSource(item);
  const message = canaux[index]?.messages?.[indexMessage];
  if (!message || message.auteur !== "pj") return;
  message.vu = !message.vu;
  await enregistrer(item, canaux);
}

/** Chuchotement « nouveau message » avec un bouton pour ouvrir le comlink sur ce canal. */
async function alerter(item, canal, depuisMJ) {
  const destinataires = depuisMJ
    ? game.users.filter((u) => !u.isGM && item.actor?.testUserPermission(u, "OWNER")).map((u) => u.id)
    : ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
  if (!destinataires.length) return;
  const porteur = item.actor?.name ?? item.name;
  await ChatMessage.create({
    whisper: destinataires,
    speaker: { alias: t("Titre") },
    content: `<div class="gw-alerte-comlink">
      <i class="fa-solid fa-tower-broadcast"></i>
      ${t("Alerte", { numero: canal.numero, contact: echapper(canal.nom || t("ContactInconnu")), porteur: echapper(porteur) })}
      <button type="button" data-gw-comlink="${item.uuid}" data-numero="${canal.numero}">${t("Ouvrir")}</button>
    </div>`
  });
}

/** Bouton « Ouvrir » des alertes : fiche du comlink sur le canal indiqué. */
function brancherAlerte(message, html) {
  for (const bouton of html?.querySelectorAll?.("[data-gw-comlink]") ?? []) {
    bouton.addEventListener("click", async (event) => {
      event.preventDefault();
      const item = await fromUuid(bouton.dataset.gwComlink).catch(() => null);
      if (!item?.sheet) return ui.notifications.warn(t("Introuvable"));
      await item.sheet.ouvrirComlink?.(Number(bouton.dataset.numero));
    });
  }
}

export function enregistrerHooksComlink() {
  Hooks.on("renderChatMessageHTML", brancherAlerte);
}
