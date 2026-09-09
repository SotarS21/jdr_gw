import { GW } from "../config.mjs";
import { rollCompetence } from "../helpers/rolls.mjs";
import { applyRace } from "../helpers/race.mjs";
import { applyMetier } from "../helpers/metier.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class PersonnageSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["galactic-wars", "sheet", "actor", "personnage"],
    position: { width: 720, height: 780 },
    window: { resizable: true },
    actions: {
      rollCompetence: PersonnageSheet.#onRollCompetence,
      applyRace: PersonnageSheet.#onApplyRace,
      applyMetier: PersonnageSheet.#onApplyMetier,
      editImage: PersonnageSheet.#onEditImage,
      createItem: PersonnageSheet.#onCreateItem,
      deleteItem: PersonnageSheet.#onDeleteItem
    }
  };

  static PARTS = {
    body: { template: "systems/galactic-wars/templates/actor/personnage-sheet.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;

    context.system = system;
    context.caracteristiques = Object.entries(GW.caracteristiques).map(([cle, label]) => ({
      cle,
      label,
      ...system.caracteristiques[cle]
    }));
    context.competences = [...system.competences].sort((a, b) =>
      game.i18n.localize(a.label).localeCompare(game.i18n.localize(b.label))
    );
    context.armes = this.actor.items.filter((i) => i.type === "arme");
    context.armures = this.actor.items.filter((i) => i.type === "armure");
    context.pouvoirs = this.actor.items.filter((i) => i.type === "pouvoir");
    context.equipements = this.actor.items.filter((i) => i.type === "equipement");
    context.biographieEnrichie = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      system.biographie,
      { relativeTo: this.actor }
    );

    return context;
  }

  static async #onRollCompetence(event, target) {
    await rollCompetence(this.actor, target.dataset.cle);
  }

  static async #onApplyRace(event, target) {
    const uuid = this.actor.system.race.uuid;
    if (!uuid) return ui.notifications.warn(game.i18n.localize("GALACTICWARS.Avertissement.AucuneRaceSelectionnee"));
    const race = await fromUuid(uuid);
    if (race) await applyRace(this.actor, race);
  }

  static async #onApplyMetier(event, target) {
    const uuid = this.actor.system.metier.uuid;
    if (!uuid) return ui.notifications.warn(game.i18n.localize("GALACTICWARS.Avertissement.AucunMetierSelectionne"));
    const metier = await fromUuid(uuid);
    if (metier) await applyMetier(this.actor, metier);
  }

  static async #onEditImage(event, target) {
    const current = this.actor.system.portrait;
    const picker = new foundry.applications.apps.FilePicker.implementation({
      current,
      type: "image",
      callback: (path) => this.actor.update({ "system.portrait": path })
    });
    return picker.browse();
  }

  static async #onCreateItem(event, target) {
    const type = target.dataset.type;
    await this.actor.createEmbeddedDocuments("Item", [
      { name: game.i18n.localize("GALACTICWARS.Item.NouvelObjet"), type }
    ]);
  }

  static async #onDeleteItem(event, target) {
    const li = target.closest("[data-item-id]");
    await this.actor.deleteEmbeddedDocuments("Item", [li.dataset.itemId]);
  }
}
