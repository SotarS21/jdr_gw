import { GW } from "../config.mjs";
import { rollCompetence } from "../helpers/rolls.mjs";
import { applyRace } from "../helpers/race.mjs";
import { applyMetier } from "../helpers/metier.mjs";
import { choisirItemCompendium } from "../helpers/compendium-picker.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class PersonnageSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["galactic-wars", "sheet", "actor", "personnage"],
    // 940 px : les 3 colonnes de compétences (libellés longs non sécables, ex.
    // "Informatique/piratage") ne tiennent sans défilement horizontal qu'à partir de ~920 px.
    position: { width: 940, height: 780 },
    window: { resizable: true },
    // Par défaut ActorSheetV2 a submitOnChange:false — sans ça, aucun champ texte/nombre
    // simple (nom, niveau, notes, caractéristiques, compétences...) ne se sauvegarde tant
    // que rien d'autre ne force un update() (voir JOURNAL.md, bug remonté par l'utilisateur :
    // le taux d'une compétence ne "s'adaptait" pas quand on changeait son niveau).
    form: { submitOnChange: true },
    actions: {
      rollCompetence: PersonnageSheet.#onRollCompetence,
      applyRace: PersonnageSheet.#onApplyRace,
      applyMetier: PersonnageSheet.#onApplyMetier,
      editImage: PersonnageSheet.#onEditImage,
      createItem: PersonnageSheet.#onCreateItem,
      deleteItem: PersonnageSheet.#onDeleteItem,
      changerOnglet: PersonnageSheet.#onChangerOnglet,
      basculerEdition: PersonnageSheet.#onBasculerEdition,
      ajusterLumiere: PersonnageSheet.#onAjusterLumiere,
      ajusterObscurite: PersonnageSheet.#onAjusterObscurite,
      addNote: PersonnageSheet.#onAddNote,
      removeNote: PersonnageSheet.#onRemoveNote
    }
  };

  static PARTS = {
    body: { template: "systems/galactic-wars/templates/actor/personnage-sheet.hbs", scrollable: [".sheet-body"] }
  };

  /** Onglet actif — état d'affichage pur, pas de persistance sur l'Actor (survit aux re-rendus
   *  puisque l'instance de sheet, elle, persiste entre deux rendus). */
  #ongletActif = "personnage";

  /** Mode édition des caractéristiques, de la race et du métier — même principe que l'onglet
   *  actif (état d'affichage de l'instance, rien n'est écrit sur l'Actor). null = pas encore
   *  choisi : ouvert d'office sur un personnage vierge, verrouillé sinon. */
  #modeEdition = null;

  get modeEdition() {
    if (this.#modeEdition === null) {
      const system = this.actor.system;
      const vierge = !system.race?.nom && !system.metier?.nom
        && Object.values(system.caracteristiques).every((c) => !c.base);
      this.#modeEdition = vierge;
    }
    return this.#modeEdition;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;

    context.actor = this.actor;
    context.system = system;
    context.ongletActif = this.#ongletActif;
    context.modeEdition = this.modeEdition;
    // `index` conserve la position réelle dans system.competences (pas celle, différente,
    // dans la sous-liste triée/filtrée par caractéristique ci-dessous) pour que les inputs
    // du template continuent de cibler la bonne entrée du tableau.
    const competencesIndexees = system.competences.map((c, index) => ({ ...c, index }));
    context.caracteristiques = Object.entries(GW.caracteristiques).map(([cle, label]) => ({
      cle,
      label,
      ...system.caracteristiques[cle],
      competences: competencesIndexees
        .filter((c) => c.caracteristique === cle)
        .sort((a, b) => game.i18n.localize(a.label).localeCompare(game.i18n.localize(b.label)))
    }));
    context.armes = this.actor.items.filter((i) => i.type === "arme");
    context.armures = this.actor.items.filter((i) => i.type === "armure");
    context.pouvoirs = this.actor.items.filter((i) => i.type === "pouvoir");
    context.equipements = this.actor.items.filter((i) => i.type === "equipement");
    context.notesEnrichies = await Promise.all(
      system.notes.map((note) =>
        foundry.applications.ux.TextEditor.implementation.enrichHTML(note.contenu, { relativeTo: this.actor })
      )
    );
    // Pips d'affichage pour les jauges Lumière/Obscurité (voir styles/galactic-wars.css) —
    // purement visuel, la valeur réelle reste system.lumiere/system.obscurite.
    context.pipsLumiere = Array.from({ length: 10 }, (_, i) => i < system.lumiere);
    context.pipsObscurite = Array.from({ length: 10 }, (_, i) => i < system.obscurite);

    return context;
  }

  static async #onChangerOnglet(event, target) {
    this.#ongletActif = target.dataset.onglet;
    this.render();
  }

  static async #onBasculerEdition() {
    this.#modeEdition = !this.modeEdition;
    this.render();
  }

  static async #onRollCompetence(event, target) {
    const choix = this.element.querySelector('input[name="bonusAlignement"]:checked')?.value;
    const pool =
      (choix === "lumiere" && this.actor.system.lumiere > 0) ||
      (choix === "obscurite" && this.actor.system.obscurite > 0)
        ? choix
        : null;

    await rollCompetence(this.actor, target.dataset.cle, { pool });

    if (pool) {
      await this.actor.update({ [`system.${pool}`]: this.actor.system[pool] - 1 });
    }
  }

  static async #onAjusterLumiere(event, target) {
    await this.#ajusterReserve("lumiere", Number(target.dataset.delta));
  }

  static async #onAjusterObscurite(event, target) {
    await this.#ajusterReserve("obscurite", Number(target.dataset.delta));
  }

  async #ajusterReserve(cle, delta) {
    const valeur = Math.min(10, Math.max(0, this.actor.system[cle] + delta));
    await this.actor.update({ [`system.${cle}`]: valeur });
  }

  static async #onAddNote() {
    await this.actor.update({
      "system.notes": [...this.actor.system.notes, { titre: "", contenu: "" }]
    });
  }

  static async #onRemoveNote(event, target) {
    const index = Number(target.dataset.index);
    await this.actor.update({
      "system.notes": this.actor.system.notes.filter((_, i) => i !== index)
    });
  }

  static async #onApplyRace(event, target) {
    if (!this.modeEdition) return;
    const race = await choisirItemCompendium("races", { title: game.i18n.localize("GALACTICWARS.Sheet.Race") });
    if (race) await applyRace(this.actor, race);
  }

  static async #onApplyMetier(event, target) {
    if (!this.modeEdition) return;
    const metier = await choisirItemCompendium("metiers", { title: game.i18n.localize("GALACTICWARS.Sheet.Metier") });
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
