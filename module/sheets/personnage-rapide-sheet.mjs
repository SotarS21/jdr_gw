import { GW } from "../config.mjs";
import { rollCaracteristiqueD20, rollCaracteristiquePourcentage, rollSurvie } from "../helpers/rolls.mjs";
import { applyRace } from "../helpers/race.mjs";
import { applyMetier } from "../helpers/metier.mjs";
import { choisirItemCompendium } from "../helpers/compendium-picker.mjs";
import { basculerCouvert, couvertActif, ligneTrait, basculerTraitActif, sourcesEffets } from "../helpers/effets.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class PersonnageRapideSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["galactic-wars", "sheet", "actor", "personnage-rapide"],
    position: { width: 560, height: 640 },
    window: { resizable: true },
    // Voir personnage-sheet.mjs : sans ça, ActorSheetV2 (submitOnChange:false par défaut)
    // ne sauvegarde aucun champ texte/nombre simple tant qu'aucune action explicite ne
    // force un update().
    form: { submitOnChange: true },
    actions: {
      rollCaracteristique: PersonnageRapideSheet.#onRollCaracteristique,
      rollSurvie: PersonnageRapideSheet.#onRollSurvie,
      applyRace: PersonnageRapideSheet.#onApplyRace,
      applyMetier: PersonnageRapideSheet.#onApplyMetier,
      editImage: PersonnageRapideSheet.#onEditImage,
      ajouterTrait: PersonnageRapideSheet.#onAjouterTrait,
      ouvrirTrait: PersonnageRapideSheet.#onOuvrirTrait,
      supprimerTrait: PersonnageRapideSheet.#onSupprimerTrait,
      basculerTraitActif: PersonnageRapideSheet.#onBasculerTraitActif,
      basculerCouvert: PersonnageRapideSheet.#onBasculerCouvert
    }
  };

  static PARTS = {
    body: { template: "systems/galactic-wars/templates/actor/personnage-rapide-sheet.hbs", scrollable: [".sheet-body"] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;

    context.actor = this.actor;
    context.system = system;
    context.caracteristiques = Object.entries(GW.caracteristiquesRapides).map(([cle, label]) => ({
      cle,
      label,
      valeur: system.caracteristiques[cle],
      // Effets actifs (traits, talents) : bonus affiché à côté de la saisie, valeur jouée = saisie + bonus.
      bonus: system.bonusCaracteristiques?.[cle] ?? 0,
      total: system.caracteristiquesTotales?.[cle] ?? system.caracteristiques[cle],
      // Traits / talents sources du bonus (v0.20.2) ; un PNJ les compte × 5, en %.
      sources: sourcesEffets(this.actor, `system.effets.caracteristiques.${cle}`, this.actor.type === "pnj"
        ? { facteur: GW.facteurD20VersPourcentage, unite: " %" } : {})
    }));
    // Traits portés (v0.20.0) : la fiche rapide n'affichait aucun objet ; une variante « classique » (%) n'a aucun
    // effet ici. Un PNJ compte les bonus d20 × GW.facteurD20VersPourcentage : le résumé affiche la valeur appliquée
    // (en %), comme la pastille à côté de la caractéristique.
    const facteur = this.actor.type === "pnj" ? GW.facteurD20VersPourcentage : 1;
    context.traits = this.actor.items.filter((i) => i.type === "talent").sort((a, b) => a.name.localeCompare(b.name))
      .map((i) => ligneTrait(i, "classique", { facteur }));
    const reduction = await this.actor.reductionDegats();
    context.reduction = reduction;
    context.couverts = Object.entries(GW.couverts).map(([cle, c]) => ({ cle, label: c.label, armure: c.armure, actif: couvertActif(this.actor) === cle }));
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
    const race = await choisirItemCompendium("races", { title: game.i18n.localize("GALACTICWARS.Sheet.Race") });
    if (race) await applyRace(this.actor, race);
  }

  static async #onApplyMetier() {
    const metier = await choisirItemCompendium("metiers", { title: game.i18n.localize("GALACTICWARS.Sheet.Metier") });
    if (metier) await applyMetier(this.actor, metier);
  }

  static async #onAjouterTrait() {
    if (!this.isEditable) return;
    const talent = await choisirItemCompendium(["traits", "talents"], {
      title: game.i18n.localize("GALACTICWARS.Traits.Ajouter"),
      champs: ["system.fiche"],
      filtre: (entree) => entree.system?.fiche !== "classique"
    });
    if (!talent) return;
    if (this.actor.items.some((i) => i.type === "talent" && i.name === talent.name)) {
      return ui.notifications.warn(game.i18n.format("GALACTICWARS.Traits.DejaPresent", { nom: talent.name }));
    }
    const data = talent.toObject();
    delete data._id;
    foundry.utils.setProperty(data, "_stats.compendiumSource", talent.uuid);
    await this.actor.createEmbeddedDocuments("Item", [data]);
  }

  static #onOuvrirTrait(event, target) {
    this.actor.items.get(target.closest("[data-item-id]")?.dataset.itemId)?.sheet.render({ force: true });
  }

  static async #onSupprimerTrait(event, target) {
    if (!this.isEditable) return;
    await this.actor.items.get(target.closest("[data-item-id]")?.dataset.itemId)?.delete();
  }

  /** Allume ou éteint un trait actif (ses effets). */
  static async #onBasculerTraitActif(event, target) {
    if (!this.isEditable) return;
    await basculerTraitActif(this.actor.items.get(target.closest("[data-item-id]")?.dataset.itemId));
  }

  static async #onBasculerCouvert(event, target) {
    if (!this.isEditable) return;
    await basculerCouvert(this.actor, target.dataset.couvert);
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
