const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export class GalacticWarsItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["galactic-wars", "sheet", "item"],
    position: { width: 480, height: 560 },
    window: { resizable: true },
    // Voir personnage-sheet.mjs : sans ça, ItemSheetV2 (submitOnChange:false par défaut)
    // ne sauvegarde aucun champ texte/nombre simple tant qu'aucune action explicite ne
    // force un update().
    form: { submitOnChange: true }
  };

  static PARTS = {
    body: { template: "systems/galactic-wars/templates/item/item-sheet.hbs", scrollable: [".sheet-body"] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.system = this.item.system;
    context.descriptionEnrichie = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description ?? "",
      { relativeTo: this.item }
    );
    return context;
  }
}
