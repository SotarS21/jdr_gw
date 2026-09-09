import { GW } from "../config.mjs";
import { rollD20Plus } from "../helpers/rolls.mjs";
import { applyRace } from "../helpers/race.mjs";
import { applyEcole } from "../helpers/ecole.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class PersonnageSithSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["galactic-wars", "sheet", "actor", "personnage-sith"],
    position: { width: 600, height: 700 },
    window: { resizable: true },
    actions: {
      rollCaracteristique: PersonnageSithSheet.#onRollCaracteristique,
      rollCompetenceForce: PersonnageSithSheet.#onRollCompetenceForce,
      applyRace: PersonnageSithSheet.#onApplyRace,
      applyEcole: PersonnageSithSheet.#onApplyEcole,
      editImage: PersonnageSithSheet.#onEditImage
    }
  };

  static PARTS = {
    body: { template: "systems/galactic-wars/templates/actor/personnage-sith-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;

    context.system = system;
    context.corpulences = GW.corpulences;
    context.caracteristiques = Object.entries(GW.caracteristiquesSith).map(([cle, label]) => ({
      cle,
      label,
      valeur: system.caracteristiques[cle]
    }));
    context.competencesForce = Object.entries(GW.competencesForceSith).map(([cle, label]) => ({
      cle,
      label,
      valeur: system.competencesForce[cle]
    }));
    context.descriptionEnrichie = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      system.description,
      { relativeTo: this.actor }
    );

    return context;
  }

  static async #onRollCaracteristique(event, target) {
    const cle = target.dataset.cle;
    await rollD20Plus(this.actor, GW.caracteristiquesSith[cle], this.actor.system.caracteristiques[cle]);
  }

  static async #onRollCompetenceForce(event, target) {
    const cle = target.dataset.cle;
    await rollD20Plus(this.actor, GW.competencesForceSith[cle], this.actor.system.competencesForce[cle]);
  }

  static async #onApplyRace() {
    const uuid = this.actor.system.race.uuid;
    if (!uuid) return ui.notifications.warn(game.i18n.localize("GALACTICWARS.Avertissement.AucuneRaceSelectionnee"));
    const race = await fromUuid(uuid);
    if (race) await applyRace(this.actor, race);
  }

  static async #onApplyEcole() {
    const uuid = this.actor.system.ecole.uuid;
    if (!uuid) return ui.notifications.warn(game.i18n.localize("GALACTICWARS.Avertissement.AucuneEcoleSelectionnee"));
    const ecole = await fromUuid(uuid);
    if (ecole) await applyEcole(this.actor, ecole);
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
