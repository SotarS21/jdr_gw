import { TYPES_OBJETS_RESERVE } from "./equipage.mjs";

/**
 * Objets possédés des fiches rapide, PNJ et sith (audit du 2026-09-29) : ces fiches n'avaient qu'un champ texte
 * « Équipement », si bien que les objets reçus (réserve d'équipage, soute du vaisseau, équipement de départ du
 * métier, glisser-déposer) étaient créés sans être affichés nulle part. Liste sous ce champ, qui reste pour les
 * notes libres : clic = carte dans le tchat, bouton = fiche de l'objet, corbeille en mode modifiable.
 */

/** Lignes de la liste (armes, armures, équipements), triées par nom. */
export function objetsPossedes(actor) {
  return actor.items
    .filter((i) => TYPES_OBJETS_RESERVE.includes(i.type))
    .sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang))
    .map((i) => ({ id: i.id, nom: i.name, img: i.img, quantite: i.system.quantite ?? 1 }));
}

const objetDeLaLigne = (sheet, target) => sheet.actor.items.get(target.closest("[data-item-id]")?.dataset.itemId);

/** Actions à déclarer dans DEFAULT_OPTIONS.actions de la fiche. */
export const ACTIONS_OBJETS_POSSEDES = {
  afficherObjet(event, target) {
    return objetDeLaLigne(this, target)?.afficherDansTchat();
  },
  ouvrirObjet(event, target) {
    return objetDeLaLigne(this, target)?.sheet.render({ force: true });
  },
  async supprimerObjet(event, target) {
    if (!this.isEditable) return;
    const item = objetDeLaLigne(this, target);
    if (!item) return;
    const confirme = await foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.localize("GALACTICWARS.Objet.SupprimerObjet"), icon: "fa-solid fa-trash" },
      content: `<p>${game.i18n.format("GALACTICWARS.Objet.SupprimerConfirmation", { nom: foundry.utils.escapeHTML(item.name) })}</p>`
    });
    if (confirme) await item.delete();
  }
};

/**
 * Fiche seulement observée : Foundry désactive tous les boutons ; montrer un objet dans le tchat et ouvrir sa fiche
 * (lecture seule) restent permis. À appeler depuis _onRender.
 */
export function reactiverObjetsPossedes(sheet) {
  if (sheet.isEditable) return;
  for (const bouton of sheet.element.querySelectorAll('.objets-possedes button[data-action="afficherObjet"], .objets-possedes button[data-action="ouvrirObjet"]')) {
    bouton.disabled = false;
  }
}
