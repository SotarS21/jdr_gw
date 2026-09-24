import { GW } from "../config.mjs";
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/** Objets d'inventaire (arme, armure/bouclier, équipement) : fiche « datapad » dédiée, un
 *  template par type. Les autres types (race, métier, talent, pouvoir, école) gardent
 *  templates/item/item-sheet.hbs, inchangé. */
const TEMPLATES_OBJET = {
  arme: "systems/galactic-wars/templates/item/arme-sheet.hbs",
  armure: "systems/galactic-wars/templates/item/armure-sheet.hbs",
  equipement: "systems/galactic-wars/templates/item/equipement-sheet.hbs"
};

/** Partiels communs aux trois fiches d'objet (nom du partiel -> chemin). Enregistrés une seule
 *  fois, à la première ouverture d'une fiche d'objet (voir #chargerPartiels) : ça évite de
 *  toucher à l'init de module/galactic-wars.mjs. */
const PARTIELS_OBJET = {
  "gw-objet-entete": "systems/galactic-wars/templates/item/partiels/objet-entete.hbs",
  "gw-objet-onglets": "systems/galactic-wars/templates/item/partiels/objet-onglets.hbs",
  "gw-objet-tags": "systems/galactic-wars/templates/item/partiels/objet-tags.hbs",
  "gw-objet-textes": "systems/galactic-wars/templates/item/partiels/objet-textes.hbs"
};

export class GalacticWarsItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["galactic-wars", "sheet", "item"],
    position: { width: 480, height: 560 },
    window: { resizable: true },
    // Voir personnage-sheet.mjs : sans ça, ItemSheetV2 (submitOnChange:false par défaut)
    // ne sauvegarde aucun champ texte/nombre simple tant qu'aucune action explicite ne
    // force un update().
    form: { submitOnChange: true },
    actions: {
      editImage: GalacticWarsItemSheet.#onEditImage,
      changerOnglet: GalacticWarsItemSheet.#onChangerOnglet,
      basculerPorte: GalacticWarsItemSheet.#onBasculerPorte,
      afficherDansTchat: GalacticWarsItemSheet.#onAfficherDansTchat,
      attaquer: GalacticWarsItemSheet.#onAttaquer,
      lancerDegats: GalacticWarsItemSheet.#onLancerDegats
    }
  };

  static PARTS = {
    body: { template: "systems/galactic-wars/templates/item/item-sheet.hbs", scrollable: [".sheet-body"] }
  };

  /** Promesse partagée d'enregistrement des partiels (une seule fois pour toutes les fiches). */
  static #partielsCharges = null;

  static #chargerPartiels() {
    GalacticWarsItemSheet.#partielsCharges ??= foundry.applications.handlebars.loadTemplates(PARTIELS_OBJET);
    return GalacticWarsItemSheet.#partielsCharges;
  }

  /** Onglet actif des fiches d'objet (details / description / notes) — état d'affichage pur,
   *  gardé sur l'instance comme #ongletActif dans personnage-sheet.mjs. */
  #ongletActif = "details";

  /** Vrai pour arme / armure / équipement (fiche « datapad »). */
  get estObjet() {
    return this.item.type in TEMPLATES_OBJET;
  }

  /**
   * Classes `objet` + `objet-<type>` sur les fiches d'objet : tout styles/objets.css est scopé
   * dessus, pour que les fiches race/métier/talent/pouvoir/école restent strictement inchangées.
   * @override
   */
  _initializeApplicationOptions(options) {
    const applicationOptions = super._initializeApplicationOptions(options);
    const type = applicationOptions.document?.type;
    if (type in TEMPLATES_OBJET) {
      applicationOptions.classes = [...applicationOptions.classes, "objet", `objet-${type}`];
      // Un peu plus haute que 560 px : en-tête + onglets + détails + tags sans défilement.
      applicationOptions.position = { ...applicationOptions.position, height: 620 };
    }
    return applicationOptions;
  }

  /**
   * Template choisi selon le type (même PARTS `body`, seul le chemin change) : pas besoin
   * d'enregistrer une fiche par type dans module/galactic-wars.mjs.
   * @override
   */
  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    const template = TEMPLATES_OBJET[this.item.type];
    if (template) parts.body.template = template;
    return parts;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    // ItemSheetV2 ne fournit pas `item` au contexte : sans ça, nom vide et sections par type absentes
    // dans le template, et toute sauvegarde rejetée (nom vide invalide).
    context.item = this.item;
    context.system = this.item.system;
    context.tags = this.item.system.tags
      ? Object.entries(GW.tagsObjet).map(([cle, t]) => {
        const hint = `GALACTICWARS.Tags.${cle}Hint`;
        return { cle, ...t, actif: !!this.item.system.tags[cle], hint: game.i18n.has(hint) ? hint : "" };
      })
      : null;
    context.descriptionEnrichie = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description ?? "",
      { relativeTo: this.item }
    );
    if (this.estObjet) {
      await GalacticWarsItemSheet.#chargerPartiels();
      Object.assign(context, await this.#preparerObjet());
    }
    return context;
  }

  /** Données propres aux fiches d'objet : en-tête, onglets, notes MJ, détails par type. */
  async #preparerObjet() {
    const item = this.item;
    const system = item.system;
    const isGM = game.user.isGM;
    // Un joueur ne doit jamais rester sur l'onglet Notes du MJ (ex. fiche ouverte par le MJ puis
    // droits changés) : retour aux détails.
    if (this.#ongletActif === "notes" && !isGM) this.#ongletActif = "details";
    const estBouclier = item.type === "armure" && system.emplacement === "bouclier";
    const context = {
      isGM,
      ongletActif: this.#ongletActif,
      proprietaire: item.actor ?? null,
      typeLabel: estBouclier ? "GALACTICWARS.Objet.Emplacement.bouclier" : `TYPES.Item.${item.type}`,
      estBouclier
    };
    if (isGM && this.#ongletActif === "notes") {
      context.notesMJEnrichies = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        system.notesMJ ?? "", { relativeTo: item }
      );
    }
    if (item.type === "arme") context.arme = this.#preparerArme();
    if (item.type === "armure") context.emplacements = this.#preparerEmplacements();
    return context;
  }

  /** Arme : liste des compétences (libellés localisés triés) et taux actuel du porteur. */
  #preparerArme() {
    const system = this.item.system;
    const competences = Object.entries(GW.competences)
      .map(([cle, def]) => ({ cle, label: game.i18n.localize(def.label), selected: cle === system.competence }))
      .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));
    // Clé inconnue (compétence renommée/retirée de GW.competences) : on la garde en option pour
    // ne pas la remplacer silencieusement par la première de la liste à la prochaine sauvegarde.
    if (system.competence && !(system.competence in GW.competences)) {
      competences.unshift({ cle: system.competence, label: system.competence, selected: true });
    }
    const actor = this.item.actor;
    let taux = null;
    // Seul le personnage « classique » a un tableau system.competences préparé (cle, total, bloquee).
    if (actor?.type === "personnage" && system.competence) {
      const entree = Array.isArray(actor.system.competences)
        ? actor.system.competences.find((c) => c.cle === system.competence)
        : null;
      taux = {
        label: game.i18n.localize(GW.competences[system.competence]?.label ?? system.competence),
        total: entree?.total ?? null,
        bloquee: !!entree?.bloquee,
        trouvee: !!entree
      };
    }
    return {
      competences,
      taux,
      porteurPersonnage: actor?.type === "personnage",
      // Attaquer/Dégâts n'ont de sens que pour une arme portée par un personnage.
      actionsPossibles: actor?.type === "personnage" && !!system.porte
    };
  }

  /** Armure : emplacements (GW.emplacementsArmure), en gardant une valeur hors liste le cas échéant. */
  #preparerEmplacements() {
    const actuel = this.item.system.emplacement;
    const emplacements = Object.entries(GW.emplacementsArmure)
      .map(([cle, label]) => ({ cle, label, selected: cle === actuel }));
    if (actuel && !(actuel in GW.emplacementsArmure)) emplacements.unshift({ cle: actuel, label: actuel, selected: true });
    return emplacements;
  }

  /* -------------------------------------------- */
  /*  Actions                                     */
  /* -------------------------------------------- */

  /** Image de l'objet : data-edit ne fonctionne pas en ApplicationV2, on ouvre un FilePicker
   *  (même principe que #onEditImage de personnage-sheet.mjs). */
  static async #onEditImage(event, target) {
    if (!this.isEditable) return;
    const picker = new foundry.applications.apps.FilePicker.implementation({
      current: this.item.img,
      type: "image",
      callback: (path) => this.item.update({ img: path })
    });
    return picker.browse();
  }

  static async #onChangerOnglet(event, target) {
    this.#ongletActif = target.dataset.onglet;
    this.render();
  }

  /** Porté / Rangé — méthode du document (module/documents/item.mjs). */
  static async #onBasculerPorte(event, target) {
    await this.item.basculerPorte();
  }

  static async #onAfficherDansTchat(event, target) {
    await this.item.afficherDansTchat();
  }

  static async #onAttaquer(event, target) {
    await this.item.attaquer();
  }

  static async #onLancerDegats(event, target) {
    await this.item.lancerDegats();
  }
}
