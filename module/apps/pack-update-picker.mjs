import { getPendingPackUpdates, markPackUpdatesApplied } from "../helpers/pack-updates.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Fenêtre MJ listant les correctifs de contenu en attente (module/helpers/pack-updates.mjs),
 * regroupés par compendium d'origine ou « Personnages et tokens ». Seuls les correctifs cochés
 * sont appliqués ; « Plus tard » ferme sans rien marquer (reproposé au prochain chargement MJ),
 * « Ignorer » marque les correctifs cochés comme traités sans les appliquer.
 */
export class PackUpdatePicker extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "galactic-wars-pack-update-picker",
    classes: ["galactic-wars", "pack-update-picker"],
    position: { width: 540, height: "auto" },
    window: { title: "Galactic Wars — mises à jour de contenu", icon: "fa-solid fa-box-open", resizable: true },
    actions: {
      appliquer: PackUpdatePicker.#onAppliquer,
      ignorer: PackUpdatePicker.#onIgnorer,
      plusTard: PackUpdatePicker.#onPlusTard
    }
  };

  static PARTS = {
    main: { template: "systems/galactic-wars/templates/apps/pack-update-picker.hbs" }
  };

  /** Instance unique : un second déclenchement remet la fenêtre existante au premier plan. */
  static #instance = null;

  static open() {
    PackUpdatePicker.#instance ??= new PackUpdatePicker();
    PackUpdatePicker.#instance.render({ force: true });
    return PackUpdatePicker.#instance;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const libelles = new Map(game.system.packs.map((p) => [p.name, `Copies issues du compendium ${p.label}`]));
    libelles.set("acteurs", "Personnages et tokens du monde");
    const groupes = new Map();
    for (const update of await getPendingPackUpdates()) {
      if (!groupes.has(update.cible)) groupes.set(update.cible, { label: libelles.get(update.cible) ?? update.cible, entrees: [] });
      groupes.get(update.cible).entrees.push(update);
    }
    context.groupes = [...groupes.values()];
    context.enAttente = context.groupes.length > 0;
    return context;
  }

  /** @override */
  _onClose(options) {
    super._onClose(options);
    if (PackUpdatePicker.#instance === this) PackUpdatePicker.#instance = null;
  }

  #idsCoches() {
    return [...this.element.querySelectorAll('input[type="checkbox"][data-id]:checked')].map((el) => el.dataset.id);
  }

  async #terminer() {
    if ((await getPendingPackUpdates()).length) this.render();
    else this.close();
  }

  static async #onAppliquer() {
    const ids = this.#idsCoches();
    if (!ids.length) return ui.notifications.warn("Galactic Wars — aucun correctif coché.");
    const { PACK_UPDATES } = await import("../helpers/pack-updates.mjs");
    let modifies = 0, echecs = 0;
    const appliques = [];
    for (const update of PACK_UPDATES.filter((u) => ids.includes(u.id))) {
      try {
        modifies += (await update.apply()) ?? 0;
        appliques.push(update.id);
      } catch (err) {
        console.error(`Galactic Wars | Échec du correctif "${update.id}"`, err);
        echecs++;
      }
    }
    await markPackUpdatesApplied(appliques);
    const resume = `Galactic Wars — ${appliques.length} correctif(s) appliqué(s), ${modifies} document(s) mis à jour`
      + (echecs ? `, ${echecs} échec(s) (voir la console)` : "") + ".";
    ui.notifications[echecs ? "warn" : "info"](resume);
    await this.#terminer();
  }

  static async #onIgnorer() {
    const ids = this.#idsCoches();
    if (!ids.length) return ui.notifications.warn("Galactic Wars — aucun correctif coché.");
    const confirme = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Ignorer les correctifs cochés" },
      content: "<p>Les correctifs cochés ne seront plus proposés et <strong>ne seront pas appliqués</strong>. Continuer ?</p>"
    });
    if (!confirme) return;
    await markPackUpdatesApplied(ids);
    await this.#terminer();
  }

  static #onPlusTard() {
    this.close();
  }
}
