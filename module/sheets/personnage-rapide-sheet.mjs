import { GW } from "../config.mjs";
import { rollCaracteristiqueD20, rollCaracteristiquePourcentage, rollSurvie, rollChance } from "../helpers/rolls.mjs";
import { applyRace } from "../helpers/race.mjs";
import { applyMetier, choisirMetier } from "../helpers/metier.mjs";
import { choisirItemCompendium } from "../helpers/compendium-picker.mjs";
import { basculerCouvert, couvertActif, ligneTrait, basculerTraitActif, sourcesEffets } from "../helpers/effets.mjs";
import { editerEntreeNote, supprimerEntreeNote, pnjDepuisActeur, ajouterEntreeNote, montrerEntreeNote, entreeDepuisGlisser } from "../helpers/notes.mjs";
import { preparerInventaire, preparerVaisseau, preparerNotes, activerRecherche, activerInventaire, activerObjet, supprimerObjetConfirme, menuInventaire } from "../helpers/fiche-commune.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/** Famille de couleur de chaque caractéristique rapide (liseré des pastilles, comme Corps / Dextérité / Mental). */
const FAMILLES_RAPIDES = {
  force: "corps", capCombat: "corps", capTir: "dexterite", dexterite: "dexterite",
  mentale: "mental", perception: "mental", stress: "mental", affForce: "force"
};

/**
 * Fiche « partie rapide » et PNJ (même modèle), refaite en v0.26.0 d'après la maquette validée par l'auteur :
 * thème de la fiche classique (classe `personnage`), onglets Personnage / Équipements / Biographie / Notes, mode
 * Édition, caractéristiques en pastilles cliquables, Chance et Survie en cartes sous les PV. Équipements (avec le
 * vaisseau) et Notes reprennent les parties communes de la fiche classique (helpers/fiche-commune.mjs).
 */
export class PersonnageRapideSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["galactic-wars", "sheet", "actor", "personnage", "personnage-rapide"],
    position: { width: 680, height: 800 },
    window: { resizable: true },
    // Voir personnage-sheet.mjs : sans ça, ActorSheetV2 (submitOnChange:false par défaut)
    // ne sauvegarde aucun champ texte/nombre simple tant qu'aucune action explicite ne
    // force un update().
    form: { submitOnChange: true },
    actions: {
      rollCaracteristique: PersonnageRapideSheet.#onRollCaracteristique,
      rollSurvie: PersonnageRapideSheet.#onRollSurvie,
      rollChance: PersonnageRapideSheet.#onRollChance,
      applyRace: PersonnageRapideSheet.#onApplyRace,
      applyMetier: PersonnageRapideSheet.#onApplyMetier,
      editImage: PersonnageRapideSheet.#onEditImage,
      basculerEdition: PersonnageRapideSheet.#onBasculerEdition,
      changerOnglet: PersonnageRapideSheet.#onChangerOnglet,
      ajouterTrait: PersonnageRapideSheet.#onAjouterTrait,
      ouvrirTrait: PersonnageRapideSheet.#onOuvrirTrait,
      supprimerTrait: PersonnageRapideSheet.#onSupprimerTrait,
      basculerTraitActif: PersonnageRapideSheet.#onBasculerTraitActif,
      basculerCouvert: PersonnageRapideSheet.#onBasculerCouvert,
      createItem: PersonnageRapideSheet.#onCreateItem,
      afficherObjet: PersonnageRapideSheet.#onAfficherObjet,
      ouvrirObjet: PersonnageRapideSheet.#onOuvrirObjet,
      supprimerObjet: PersonnageRapideSheet.#onSupprimerObjet,
      basculerPorteObjet: PersonnageRapideSheet.#onBasculerPorteObjet,
      ouvrirVaisseau: PersonnageRapideSheet.#onOuvrirVaisseau,
      retirerVaisseau: PersonnageRapideSheet.#onRetirerVaisseau,
      changerSousOnglet: PersonnageRapideSheet.#onChangerSousOnglet,
      ajouterEntreeNote: PersonnageRapideSheet.#onAjouterEntreeNote,
      editerEntreeNote: PersonnageRapideSheet.#onEditerEntreeNote,
      supprimerEntreeNote: PersonnageRapideSheet.#onSupprimerEntreeNote,
      montrerEntreeNote: PersonnageRapideSheet.#onMontrerEntreeNote,
      ouvrirActeurPnj: PersonnageRapideSheet.#onOuvrirActeurPnj
    }
  };

  static PARTS = {
    body: { template: "systems/galactic-wars/templates/actor/personnage-rapide-sheet.hbs", scrollable: [".sheet-body"] }
  };

  /** Onglet et sous-onglet Notes actifs, recherche des PNJ / missions : état d'affichage gardé entre deux rendus. */
  #ongletActif = "personnage";
  #sousOngletNotes = "resume";
  #recherche = { pnj: "", missions: "" };

  /** Vaisseau affiché (onglet Équipements) : la fiche se redessine quand il change. */
  #uuidVaisseau = null;
  #hookVaisseau = null;

  /** Mode Édition : ouvert d'office sur une fiche vierge (aucune caractéristique saisie), fermé sinon. */
  #modeEdition = null;

  get modeEdition() {
    this.#modeEdition ??= Object.values(this.actor.system.caracteristiques).every((v) => !v);
    return this.#modeEdition;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;
    const estPnj = this.actor.type === "pnj";

    context.actor = this.actor;
    context.system = system;
    context.estPnj = estPnj;
    context.modeEdition = this.modeEdition;
    context.ongletActif = this.#ongletActif;
    context.sousOngletNotes = this.#sousOngletNotes;
    context.recherche = this.#recherche;
    context.limites = GW.limitesCaracteristiquesRapides;

    const pvMax = system.pv.max || 0;
    const pourcentagePV = pvMax > 0 ? Math.round(Math.min(100, Math.max(0, (system.pv.value / pvMax) * 100))) : 0;
    context.barrePV = { pourcentage: pourcentagePV, etat: pourcentagePV > 50 ? "ok" : pourcentagePV >= 25 ? "blesse" : "critique" };

    context.caracteristiques = Object.entries(GW.caracteristiquesRapides).map(([cle, label]) => ({
      cle,
      label,
      famille: FAMILLES_RAPIDES[cle],
      valeur: system.caracteristiques[cle],
      // Effets actifs (traits, talents) : bonus en pastille, valeur jouée = saisie + bonus.
      bonus: system.bonusCaracteristiques?.[cle] ?? 0,
      total: system.caracteristiquesTotales?.[cle] ?? system.caracteristiques[cle],
      // Traits / talents sources du bonus (v0.20.2) ; un PNJ les compte × 5, en %.
      sources: sourcesEffets(this.actor, `system.effets.caracteristiques.${cle}`, estPnj
        ? { facteur: GW.facteurD20VersPourcentage, unite: " %" } : {})
    }));

    // Traits portés : une variante « classique » (%) n'a aucun effet ici. Un PNJ compte les bonus d20 × 5.
    const facteur = estPnj ? GW.facteurD20VersPourcentage : 1;
    context.traits = this.actor.items.filter((i) => i.type === "talent").sort((a, b) => a.name.localeCompare(b.name))
      .map((i) => ligneTrait(i, "classique", { facteur }));
    context.reduction = await this.actor.reductionDegats();
    context.couverts = Object.entries(GW.couverts).map(([cle, c]) => ({ cle, label: c.label, armure: c.armure, actif: couvertActif(this.actor) === cle }));

    if (this.#ongletActif === "equipements") {
      Object.assign(context, preparerInventaire(this.actor));
      context.vaisseau = preparerVaisseau(this.actor);
      this.#uuidVaisseau = context.vaisseau?.uuid ?? null;
    }
    if (this.#ongletActif === "notes") Object.assign(context, await preparerNotes(this.actor));
    if (this.#ongletActif === "biographie") {
      context.descriptionEnrichie = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        system.description, { relativeTo: this.actor }
      );
    }
    return context;
  }

  /** @override */
  _onFirstRender(context, options) {
    super._onFirstRender(context, options);
    this.#hookVaisseau = Hooks.on("updateActor", (acteur) => {
      if (this.rendered && acteur.type === "vaisseau" && acteur.uuid === this.#uuidVaisseau) this.render();
    });
    menuInventaire(this);
  }

  /** @override */
  _onClose(options) {
    super._onClose(options);
    if (this.#hookVaisseau !== null) Hooks.off("updateActor", this.#hookVaisseau);
    this.#hookVaisseau = null;
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options);
    activerInventaire(this.element, this.actor);
    activerRecherche(this.element, this.#recherche);
  }

  /** @override — note glissée depuis le tchat (carte « Montrer dans le tchat ») : ajoutée aux notes de la fiche. */
  async _onDrop(event) {
    let donnees = null;
    try { donnees = foundry.applications.ux.TextEditor.implementation.getDragEventData(event); } catch { /* rien */ }
    if (donnees?.type !== "GalacticWarsNote") return super._onDrop(event);
    if (!this.isEditable) return null;
    const entree = entreeDepuisGlisser(donnees.note);
    if (!entree) return null;
    if (donnees.note.type === "pnj" && entree.acteurUuid && this.actor.system.pnjs.some((p) => p.acteurUuid === entree.acteurUuid)) {
      ui.notifications.info(game.i18n.format("GALACTICWARS.Notes.PnjDejaPresent", { nom: entree.nom }));
      return null;
    }
    await this.#ajouterNote(donnees.note.type, entree);
    return null;
  }

  async #ajouterNote(type, entree) {
    this.#ongletActif = "notes";
    this.#sousOngletNotes = { resume: "resume", info: "infos", pnj: "pnj", mission: "missions" }[type] ?? "resume";
    await ajouterEntreeNote(this.actor, type, entree);
    ui.notifications.info(game.i18n.format("GALACTICWARS.Notes.Ajoutee", {
      titre: entree.nom ?? entree.titre ?? "", type: game.i18n.localize(`GALACTICWARS.Notes.Type.${type}`)
    }));
  }

  /**
   * @override — comme la fiche classique : un vaisseau du monde déposé devient le vaisseau du personnage (onglet
   * Équipements) ; un personnage ou un PNJ devient un PNJ de l'onglet Notes, relié à sa fiche.
   */
  async _onDropActor(event, actor) {
    if (!this.isEditable || !actor) return null;
    if (["personnage", "personnage-rapide", "personnage-sith", "pnj"].includes(actor.type)) {
      if (actor === this.actor) return null;
      if (this.actor.system.pnjs.some((p) => p.acteurUuid === actor.uuid)) {
        ui.notifications.info(game.i18n.format("GALACTICWARS.Notes.PnjDejaPresent", { nom: actor.name }));
        return null;
      }
      await this.#ajouterNote("pnj", pnjDepuisActeur(actor));
      return actor;
    }
    if (actor.type !== "vaisseau") return null;
    if (actor.pack) {
      ui.notifications.warn(game.i18n.localize("GALACTICWARS.LienVaisseau.DepuisCompendium"));
      return null;
    }
    this.#ongletActif = "equipements";
    await this.actor.update({ "system.vaisseau": { uuid: actor.uuid, nom: actor.name } });
    ui.notifications.info(game.i18n.format("GALACTICWARS.LienVaisseau.Lie", { nom: actor.name, personnage: this.actor.name }));
    return actor;
  }

  /** Objet de la ligne d'inventaire contenant `target`. */
  #objetDeLigne(target) {
    return this.actor.items.get(target.closest("[data-item-id]")?.dataset.itemId);
  }

  static async #onRollCaracteristique(event, target) {
    const cle = target.dataset.cle;
    if (this.actor.type === "pnj") await rollCaracteristiquePourcentage(this.actor, cle);
    else await rollCaracteristiqueD20(this.actor, cle);
  }

  static async #onRollSurvie() {
    await rollSurvie(this.actor);
  }

  static async #onRollChance() {
    await rollChance(this.actor);
  }

  static #onBasculerEdition() {
    this.#modeEdition = !this.modeEdition;
    this.render();
  }

  static #onChangerOnglet(event, target) {
    this.#ongletActif = target.dataset.onglet;
    this.render();
  }

  static async #onApplyRace() {
    if (!this.isEditable) return;
    const race = await choisirItemCompendium("races", { title: game.i18n.localize("GALACTICWARS.Sheet.Race") });
    if (race) await applyRace(this.actor, race);
  }

  static async #onApplyMetier() {
    if (!this.isEditable) return;
    const metier = await choisirMetier();
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

  static async #onCreateItem(event, target) {
    if (!this.isEditable) return;
    await this.actor.createEmbeddedDocuments("Item", [
      { name: game.i18n.localize("GALACTICWARS.Item.NouvelObjet"), type: target.dataset.type }
    ]);
  }

  /** Clic sur une ligne d'inventaire : carte dans le tchat (Datapad / Comlink : leur onglet Holonet / Comlink). */
  static async #onAfficherObjet(event, target) {
    await activerObjet(this.#objetDeLigne(target));
  }

  static #onOuvrirObjet(event, target) {
    event.stopPropagation();
    this.#objetDeLigne(target)?.sheet.render({ force: true });
  }

  static async #onSupprimerObjet(event, target) {
    event.stopPropagation();
    if (!this.isEditable) return;
    await supprimerObjetConfirme(this.#objetDeLigne(target));
  }

  static async #onBasculerPorteObjet(event, target) {
    event.stopPropagation();
    if (!this.isEditable) return;
    await this.#objetDeLigne(target)?.basculerPorte();
  }

  static async #onOuvrirVaisseau(event, target) {
    const vaisseau = await fromUuid(target.closest("[data-uuid]")?.dataset.uuid || this.actor.system.vaisseau.uuid);
    if (!vaisseau) return;
    if (!vaisseau.testUserPermission(game.user, "OBSERVER")) {
      ui.notifications.warn(game.i18n.format("GALACTICWARS.LienVaisseau.AccesRefuse", { nom: vaisseau.name }));
      return;
    }
    vaisseau.sheet.render({ force: true });
  }

  static async #onRetirerVaisseau() {
    if (!this.isEditable) return;
    await this.actor.update({ "system.vaisseau": { uuid: "", nom: "" } });
  }

  static #onChangerSousOnglet(event, target) {
    this.#sousOngletNotes = target.dataset.sousOnglet;
    this.render();
  }

  static async #onAjouterEntreeNote(event, target) {
    if (!this.isEditable) return;
    await editerEntreeNote(this.actor, target.dataset.type);
  }

  static async #onEditerEntreeNote(event, target) {
    if (!this.isEditable) return;
    const carte = target.closest("[data-index]");
    await editerEntreeNote(this.actor, carte.dataset.type, Number(carte.dataset.index));
  }

  static async #onSupprimerEntreeNote(event, target) {
    event.stopPropagation();
    if (!this.isEditable) return;
    const carte = target.closest("[data-index]");
    await supprimerEntreeNote(this.actor, carte.dataset.type, Number(carte.dataset.index));
  }

  static async #onMontrerEntreeNote(event, target) {
    event.stopPropagation();
    const carte = target.closest("[data-type][data-index]");
    await montrerEntreeNote(this.actor, carte.dataset.type, Number(carte.dataset.index));
  }

  static async #onOuvrirActeurPnj(event, target) {
    event.stopPropagation();
    const index = Number(target.closest("[data-index]")?.dataset.index);
    const acteur = await fromUuid(this.actor.system.pnjs[index]?.acteurUuid ?? "");
    if (!acteur) return ui.notifications.warn(game.i18n.localize("GALACTICWARS.Notes.ActeurIntrouvable"));
    if (!acteur.testUserPermission(game.user, "LIMITED")) return;
    acteur.sheet.render({ force: true });
  }

  static async #onEditImage() {
    if (!this.isEditable) return;
    const picker = new foundry.applications.apps.FilePicker.implementation({
      current: this.actor.system.portrait,
      type: "image",
      callback: (path) => this.actor.update({ "system.portrait": path })
    });
    return picker.browse();
  }
}
