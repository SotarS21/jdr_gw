import { apercuGenerique, diffuserGenerique } from "../apps/generique.mjs";

const { JournalEntryPageHandlebarsSheet } = foundry.applications.sheets.journal;

/**
 * Page de journal « Générique » : en édition, les champs du générique ; en lecture, un encart avec le titre et les
 * boutons « Diffuser le générique » (MJ, tous les joueurs connectés) et « Aperçu » (local).
 */
export class PageGeneriqueSheet extends JournalEntryPageHandlebarsSheet {
  static DEFAULT_OPTIONS = {
    classes: ["galactic-wars", "gw-page-generique"],
    window: { icon: "fa-solid fa-film" },
    actions: {
      diffuser: PageGeneriqueSheet.#onDiffuser,
      apercu: PageGeneriqueSheet.#onApercu
    }
  };

  static EDIT_PARTS = {
    header: super.EDIT_PARTS.header,
    content: { template: "systems/galactic-wars/templates/journal/generique-edit.hbs", classes: ["standard-form"] },
    footer: super.EDIT_PARTS.footer
  };

  static VIEW_PARTS = {
    content: { template: "systems/galactic-wars/templates/journal/generique-view.hbs", root: true }
  };

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.page.system;
    context.system = system;
    context.isGM = game.user.isGM;
    context.paragraphes = system.diffusion.paragraphes;
    context.vitesses = {
      lente: "GALACTICWARS.Generique.Vitesse.lente",
      normale: "GALACTICWARS.Generique.Vitesse.normale",
      rapide: "GALACTICWARS.Generique.Vitesse.rapide"
    };
    return context;
  }

  static #onDiffuser() {
    diffuserGenerique(this.page);
  }

  static #onApercu() {
    apercuGenerique(this.page);
  }
}
