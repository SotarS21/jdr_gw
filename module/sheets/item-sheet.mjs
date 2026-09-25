import { GW } from "../config.mjs";
import { editerEntreeNote, supprimerEntreeNote } from "../helpers/notes.mjs";
import * as Comlink from "../helpers/comlink.mjs";
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
  "gw-objet-textes": "systems/galactic-wars/templates/item/partiels/objet-textes.hbs",
  "gw-holonet": "systems/galactic-wars/templates/item/partiels/holonet.hbs",
  "gw-comlink": "systems/galactic-wars/templates/item/partiels/comlink.hbs"
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
      lancerDegats: GalacticWarsItemSheet.#onLancerDegats,
      holonetAccueil: GalacticWarsItemSheet.#onHolonetAccueil,
      holonetPrecedent: GalacticWarsItemSheet.#onHolonetPrecedent,
      holonetSuivant: GalacticWarsItemSheet.#onHolonetSuivant,
      holonetOuvrir: GalacticWarsItemSheet.#onHolonetOuvrir,
      holonetMotCle: GalacticWarsItemSheet.#onHolonetMotCle,
      holonetNouvelle: GalacticWarsItemSheet.#onHolonetNouvelle,
      holonetModifier: GalacticWarsItemSheet.#onHolonetModifier,
      holonetSupprimer: GalacticWarsItemSheet.#onHolonetSupprimer,
      comlinkConfigurer: GalacticWarsItemSheet.#onComlinkConfigurer,
      comlinkNouveauCanal: GalacticWarsItemSheet.#onComlinkNouveauCanal,
      comlinkModifier: GalacticWarsItemSheet.#onComlinkModifier,
      comlinkArchiver: GalacticWarsItemSheet.#onComlinkArchiver,
      comlinkVoirArchives: GalacticWarsItemSheet.#onComlinkVoirArchives,
      comlinkOuvrirCanal: GalacticWarsItemSheet.#onComlinkOuvrirCanal,
      comlinkRetour: GalacticWarsItemSheet.#onComlinkRetour,
      comlinkEnvoyer: GalacticWarsItemSheet.#onComlinkEnvoyer,
      comlinkVu: GalacticWarsItemSheet.#onComlinkVu
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

  /** Onglet choisi explicitement : sinon un datapad porté par un personnage s'ouvre sur l'Holonet. */
  #ongletChoisi = false;

  /**
   * Navigation de l'Holonet (datapad) : historique de pages, null = accueil, sinon index dans
   * system.notes du porteur ; recherche et mot-clé filtrent l'accueil. État d'affichage pur.
   */
  #holonet = { historique: [null], position: 0, recherche: "", motCle: "" };

  /** Comlink : canal ouvert (numéro, null = liste), archives affichées, brouillon du message. */
  #comlink = { canal: null, voirArchives: false, brouillon: "" };

  /** Hook updateActor : l'Holonet se rafraîchit quand les Infos du porteur changent (onglet Notes). */
  #hookActeur = null;

  get estDatapad() {
    return this.item.type === "equipement" && this.item.system.appareil === "datapad";
  }

  get estComlink() {
    return this.item.type === "equipement" && this.item.system.appareil === "comlink";
  }

  /** Ouvre la fiche sur l'onglet Comlink, sur le canal `numero` s'il est donné (alertes du tchat). */
  ouvrirComlink(numero = null) {
    this.#ongletActif = "comlink";
    this.#ongletChoisi = true;
    const canal = this.item.system.comlink?.canaux?.find((c) => c.numero === numero);
    if (canal) {
      this.#comlink.canal = numero;
      if (canal.archive) this.#comlink.voirArchives = true;
    }
    return this.render({ force: true });
  }

  /** Ouvre (ou ramène au premier plan) la fiche sur l'onglet Holonet — bouton de l'inventaire. */
  ouvrirHolonet() {
    this.#ongletActif = "holonet";
    this.#ongletChoisi = true;
    return this.render({ force: true });
  }

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
    if (this.estDatapad && item.actor && !this.#ongletChoisi) this.#ongletActif = "holonet";
    if (this.#ongletActif === "holonet" && !this.estDatapad) this.#ongletActif = "details";
    if (this.estComlink && item.actor && !this.#ongletChoisi) this.#ongletActif = "comlink";
    if (this.#ongletActif === "comlink" && !this.estComlink) this.#ongletActif = "details";
    const estBouclier = item.type === "armure" && system.emplacement === "bouclier";
    const context = {
      isGM,
      ongletActif: this.#ongletActif,
      proprietaire: item.actor ?? null,
      // Badge de type : Bouclier pour une armure d'emplacement bouclier, nom de l'appareil (Datapad…) pour un équipement.
      typeLabel: estBouclier ? "GALACTICWARS.Objet.Emplacement.bouclier"
        : (item.type === "equipement" && GW.appareils[system.appareil]) || `TYPES.Item.${item.type}`,
      estBouclier
    };
    if (isGM && this.#ongletActif === "notes") {
      context.notesMJEnrichies = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        system.notesMJ ?? "", { relativeTo: item }
      );
    }
    if (item.type === "arme") context.arme = this.#preparerArme();
    if (item.type === "armure") context.emplacements = this.#preparerEmplacements();
    if (item.type === "equipement") {
      context.appareils = [
        { cle: "", label: game.i18n.localize("GALACTICWARS.Appareil.aucun"), selected: !system.appareil },
        ...Object.entries(GW.appareils).map(([cle, label]) => ({ cle, label: game.i18n.localize(label), selected: cle === system.appareil }))
      ];
      context.estDatapad = this.estDatapad;
      if (this.estDatapad && this.#ongletActif === "holonet") context.holonet = await this.#preparerHolonet();
      context.estComlink = this.estComlink;
      if (this.estComlink && this.#ongletActif === "comlink") context.comlink = this.#preparerComlink();
    }
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

  /** Holonet : accueil (liste filtrée + mots-clés) ou page d'une info, avec barre d'adresse. */
  async #preparerHolonet() {
    const actor = this.item.actor;
    const h = this.#holonet;
    if (!actor || !Array.isArray(actor.system.notes)) return { connecte: false };
    const infos = actor.system.notes;
    let page = h.historique[h.position];
    // Info supprimée entre-temps : retour à l'accueil.
    if (page !== null && !infos[page]) {
      h.historique = [null];
      h.position = 0;
      page = null;
    }
    const slug = (texte) => String(texte ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sans-titre";
    const texteBrut = (html) => String(html ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    const hote = slug(actor.name);
    const sansTitre = game.i18n.localize("GALACTICWARS.Holonet.SansTitre");
    const base = {
      connecte: true,
      editable: actor.isOwner,
      peutReculer: h.position > 0,
      peutAvancer: h.position < h.historique.length - 1,
      recherche: h.recherche,
      motCle: h.motCle
    };
    if (page !== null) {
      const info = infos[page];
      return {
        ...base,
        page: {
          index: page,
          titre: info.titre || sansTitre,
          motsCles: info.motsCles ?? [],
          contenu: await foundry.applications.ux.TextEditor.implementation.enrichHTML(info.contenu ?? "", { relativeTo: actor })
        },
        adresse: `holonet://${hote}/infos/${slug(info.titre)}`
      };
    }
    const resultats = infos
      .map((info, index) => {
        const texte = texteBrut(info.contenu);
        const motsCles = info.motsCles ?? [];
        return {
          index,
          titre: info.titre || sansTitre,
          motsCles,
          extrait: texte.length > 180 ? `${texte.slice(0, 180)}…` : texte,
          // Texte de recherche (titre + mots-clés + contenu), filtré dans le DOM par _onRender.
          recherche: [info.titre, ...motsCles, texte].join(" ").toLowerCase()
        };
      })
      .filter((r) => !h.motCle || r.motsCles.includes(h.motCle));
    const tousMotsCles = [...new Set(infos.flatMap((i) => i.motsCles ?? []))].sort((a, b) => a.localeCompare(b, game.i18n.lang));
    return {
      ...base,
      accueil: true,
      motsCles: tousMotsCles.map((mot) => ({ mot, actif: mot === h.motCle })),
      resultats,
      total: infos.length,
      adresse: `holonet://${hote}/infos${h.motCle ? `?mot=${encodeURIComponent(h.motCle)}` : ""}`
    };
  }

  /** Comlink : liste des canaux (archives à part) ou conversation du canal ouvert. */
  #preparerComlink() {
    const system = this.item.system;
    const c = this.#comlink;
    const canaux = (system.comlink?.canaux ?? []).map((canal, index) => ({ ...canal, index }));
    const messagerie = !!system.comlink?.messagerie;
    const base = {
      editable: this.item.isOwner,
      isGM: game.user.isGM,
      messagerie,
      porteur: this.item.actor?.name ?? "",
      voirArchives: c.voirArchives,
      nbArchives: canaux.filter((k) => k.archive).length
    };
    const ouvert = messagerie && c.canal !== null ? canaux.find((k) => k.numero === c.canal) : null;
    if (!ouvert) c.canal = null;
    if (ouvert) {
      return {
        ...base,
        canal: {
          ...ouvert,
          messages: ouvert.messages.map((m, indexMessage) => ({ ...m, indexMessage, mj: m.auteur === "mj" }))
        },
        brouillon: c.brouillon
      };
    }
    const tri = (a, b) => a.numero - b.numero;
    return {
      ...base,
      actifs: canaux.filter((k) => !k.archive).sort(tri),
      archives: c.voirArchives ? canaux.filter((k) => k.archive).sort(tri) : []
    };
  }

  /** Navigue vers une page (null = accueil) en tronquant l'historique « suivant ». */
  #naviguer(page) {
    const h = this.#holonet;
    if (h.historique[h.position] !== page) {
      h.historique = h.historique.slice(0, h.position + 1);
      h.historique.push(page);
      h.position = h.historique.length - 1;
    }
    return this.render();
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    this.#activerComlink();
    // Recherche de l'accueil : filtrage direct dans le DOM (pas de re-rendu : le focus reste dans le champ).
    const champ = this.element.querySelector(".holonet-recherche");
    if (!champ) return;
    const filtrer = () => {
      const terme = champ.value.trim().toLowerCase();
      this.#holonet.recherche = champ.value;
      let visibles = 0;
      for (const carte of this.element.querySelectorAll(".holonet-resultat")) {
        const ok = !terme || carte.dataset.recherche.includes(terme);
        carte.hidden = !ok;
        if (ok) visibles++;
      }
      const vide = this.element.querySelector(".holonet-aucun-resultat");
      if (vide) vide.hidden = visibles > 0;
    };
    champ.addEventListener("input", filtrer);
    // Entrée ne doit pas soumettre le formulaire de la fiche.
    champ.addEventListener("keydown", (e) => { if (e.key === "Enter") e.preventDefault(); });
    filtrer();
  }

  /** Conversation : défilement en bas, brouillon conservé, Entrée = envoyer (Maj+Entrée = retour à la ligne). */
  #activerComlink() {
    const fil = this.element.querySelector(".comlink-fil");
    if (fil) fil.scrollTop = fil.scrollHeight;
    const saisie = this.element.querySelector(".comlink-saisie");
    if (!saisie) return;
    saisie.addEventListener("input", () => { this.#comlink.brouillon = saisie.value; });
    saisie.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      e.preventDefault();
      this.#envoyerComlink();
    });
    if (this.#comlink.brouillon) {
      saisie.focus();
      saisie.setSelectionRange(saisie.value.length, saisie.value.length);
    }
  }

  async #envoyerComlink() {
    const saisie = this.element.querySelector(".comlink-saisie");
    const canal = this.item.system.comlink?.canaux?.findIndex((k) => k.numero === this.#comlink.canal) ?? -1;
    if (!saisie || canal < 0 || !saisie.value.trim()) return;
    const texte = saisie.value;
    this.#comlink.brouillon = "";
    saisie.value = "";
    await Comlink.envoyerMessage(this.item, canal, texte);
  }

  /** @override */
  _onFirstRender(context, options) {
    super._onFirstRender(context, options);
    this.#hookActeur = Hooks.on("updateActor", (actor, changes) => {
      if (actor !== this.item.actor || !this.estDatapad || this.#ongletActif !== "holonet") return;
      if (foundry.utils.hasProperty(changes, "system.notes") || "name" in changes) this.render();
    });
  }

  /** @override */
  _onClose(options) {
    super._onClose(options);
    if (this.#hookActeur !== null) Hooks.off("updateActor", this.#hookActeur);
    this.#hookActeur = null;
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
    this.#ongletChoisi = true;
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

  static #onHolonetAccueil() {
    this.#holonet.motCle = "";
    return this.#naviguer(null);
  }

  static #onHolonetPrecedent() {
    if (this.#holonet.position > 0) this.#holonet.position--;
    return this.render();
  }

  static #onHolonetSuivant() {
    if (this.#holonet.position < this.#holonet.historique.length - 1) this.#holonet.position++;
    return this.render();
  }

  static #onHolonetOuvrir(event, target) {
    return this.#naviguer(Number(target.closest("[data-index]").dataset.index));
  }

  /** Filtre de l'accueil par mot-clé (second clic sur le même mot = retrait du filtre). */
  static #onHolonetMotCle(event, target) {
    event.stopPropagation();
    const mot = target.dataset.mot;
    this.#holonet.motCle = this.#holonet.motCle === mot ? "" : mot;
    return this.#naviguer(null);
  }

  /** Mêmes fenêtres d'édition que l'onglet Notes → Infos : mêmes données (system.notes), donc synchronisées. */
  static async #onHolonetNouvelle() {
    const actor = this.item.actor;
    if (!actor?.isOwner) return;
    const avant = actor.system.notes.length;
    await editerEntreeNote(actor, "info");
    // Nouvelle info créée : on l'ouvre directement.
    if (actor.system.notes.length > avant) this.#naviguer(actor.system.notes.length - 1);
  }

  static async #onHolonetModifier(event, target) {
    const actor = this.item.actor;
    if (!actor?.isOwner) return;
    await editerEntreeNote(actor, "info", Number(target.closest("[data-index]").dataset.index));
  }

  static async #onHolonetSupprimer(event, target) {
    event.stopPropagation();
    const actor = this.item.actor;
    if (!actor?.isOwner) return;
    await supprimerEntreeNote(actor, "info", Number(target.closest("[data-index]").dataset.index));
  }

  /* ---- Comlink ---- */

  /** Index (dans system.comlink.canaux) de la ligne / du canal ciblé. */
  static #indexCanal(target) {
    return Number(target.closest("[data-index]")?.dataset.index);
  }

  static async #onComlinkConfigurer() {
    if (this.item.isOwner) await Comlink.configurerComlink(this.item);
  }

  static async #onComlinkNouveauCanal() {
    if (!this.item.isOwner) return;
    const index = await Comlink.ajouterCanal(this.item);
    await Comlink.modifierCanal(this.item, index);
  }

  static async #onComlinkModifier(event, target) {
    event.stopPropagation();
    if (this.item.isOwner) await Comlink.modifierCanal(this.item, GalacticWarsItemSheet.#indexCanal(target));
  }

  static async #onComlinkArchiver(event, target) {
    event.stopPropagation();
    if (!this.item.isOwner) return;
    await Comlink.archiverCanal(this.item, GalacticWarsItemSheet.#indexCanal(target), target.dataset.archive === "true");
  }

  static #onComlinkVoirArchives() {
    this.#comlink.voirArchives = !this.#comlink.voirArchives;
    return this.render();
  }

  /** Clic sur un canal : conversation, si la messagerie est activée (comlink ++). */
  static #onComlinkOuvrirCanal(event, target) {
    if (!this.item.system.comlink?.messagerie) return;
    const canal = this.item.system.comlink.canaux[GalacticWarsItemSheet.#indexCanal(target)];
    if (!canal) return;
    this.#comlink.canal = canal.numero;
    this.#comlink.brouillon = "";
    return this.render();
  }

  static #onComlinkRetour() {
    this.#comlink.canal = null;
    return this.render();
  }

  static async #onComlinkEnvoyer() {
    await this.#envoyerComlink();
  }

  /** MJ : clic sur un message du joueur = marque « vu » (second clic = retrait). */
  static async #onComlinkVu(event, target) {
    if (!game.user.isGM) return;
    const canal = this.item.system.comlink?.canaux?.findIndex((k) => k.numero === this.#comlink.canal) ?? -1;
    if (canal < 0) return;
    await Comlink.basculerVu(this.item, canal, Number(target.closest("[data-message]").dataset.message));
  }
}
