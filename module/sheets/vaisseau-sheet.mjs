const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class VaisseauSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["galactic-wars", "sheet", "actor", "vaisseau"],
    position: { width: 640, height: 760 },
    window: { resizable: true },
    actions: {
      addArmement: VaisseauSheet.#onAddArmement,
      removeArmement: VaisseauSheet.#onRemoveArmement,
      addEquipage: VaisseauSheet.#onAddEquipage,
      removeEquipage: VaisseauSheet.#onRemoveEquipage,
      editImage: VaisseauSheet.#onEditImage
    }
  };

  static PARTS = {
    body: { template: "systems/galactic-wars/templates/actor/vaisseau-sheet.hbs", scrollable: [".sheet-body"] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;

    context.system = system;
    context.descriptionEnrichie = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      system.description,
      { relativeTo: this.actor }
    );

    return context;
  }

  static async #onAddArmement() {
    await this.actor.update({
      "system.armement": [...this.actor.system.armement, { nom: "", degats: "", quantite: 1 }]
    });
  }

  static async #onRemoveArmement(event, target) {
    const index = Number(target.dataset.index);
    await this.actor.update({
      "system.armement": this.actor.system.armement.filter((_, i) => i !== index)
    });
  }

  static async #onAddEquipage() {
    await this.actor.update({
      "system.equipage": [...this.actor.system.equipage, { role: "", nom: "", description: "" }]
    });
  }

  static async #onRemoveEquipage(event, target) {
    const index = Number(target.dataset.index);
    await this.actor.update({
      "system.equipage": this.actor.system.equipage.filter((_, i) => i !== index)
    });
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
