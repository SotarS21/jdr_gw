import { GW } from "../config.mjs";
import { rollCaracteristiqueD20, rollCaracteristiquePourcentage, rollSurvie } from "../helpers/rolls.mjs";
import { applyRace } from "../helpers/race.mjs";
import { applyMetier } from "../helpers/metier.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class PersonnageRapideSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["galactic-wars", "sheet", "actor", "personnage-rapide"],
    position: { width: 560, height: 640 },
    window: { resizable: true },
    actions: {
      rollCaracteristique: PersonnageRapideSheet.#onRollCaracteristique,
      rollSurvie: PersonnageRapideSheet.#onRollSurvie,
      applyRace: PersonnageRapideSheet.#onApplyRace,
      applyMetier: PersonnageRapideSheet.#onApplyMetier,
      editImage: PersonnageRapideSheet.#onEditImage
    }
  };

  static PARTS = {
    body: { template: "systems/galactic-wars/templates/actor/personnage-rapide-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;

    context.system = system;
    context.caracteristiques = Object.entries(GW.caracteristiquesRapides).map(([cle, label]) => ({
      cle,
      label,
      valeur: system.caracteristiques[cle]
    }));
    context.limites = GW.limitesCaracteristiquesRapides;
    context.estPnj = this.actor.type === "pnj";
    context.descriptionEnrichie = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      system.description,
      { relativeTo: this.actor }
    );

    return context;
  }

  static async #onRollCaracteristique(event, target) {
    const cle = target.dataset.cle;
    if (this.actor.type === "pnj") await rollCaracteristiquePourcentage(this.actor, cle);
    else await rollCaracteristiqueD20(this.actor, cle);
  }

  static async #onRollSurvie() {
    await rollSurvie(this.actor);
  }

  static async #onApplyRace() {
    const uuid = this.actor.system.race.uuid;
    if (!uuid) return ui.notifications.warn(game.i18n.localize("GALACTICWARS.Avertissement.AucuneRaceSelectionnee"));
    const race = await fromUuid(uuid);
    if (race) await applyRace(this.actor, race);
  }

  static async #onApplyMetier() {
    const uuid = this.actor.system.metier.uuid;
    if (!uuid) return ui.notifications.warn(game.i18n.localize("GALACTICWARS.Avertissement.AucunMetierSelectionne"));
    const metier = await fromUuid(uuid);
    if (metier) await applyMetier(this.actor, metier);
  }

  static async #onEditImage() {
    const picker = new foundry.applications.apps.FilePicker.implementation({
      current: this.actor.system.portrait,
      type: "image",
      callback: (path) => this.actor.update({ "system.portrait": path })
    });
    return picker.browse();
  }
}
