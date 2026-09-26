const { HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/** Jauge en arc de 270° (ouverte en bas) : longueur de l'arc visible et de la part remplie, pour un cercle de rayon 40. */
const CIRCONFERENCE = 2 * Math.PI * 40;
const ARC = CIRCONFERENCE * 0.75;

function jauge(valeur, max) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, valeur / max)) : (valeur > 0 ? 1 : 0);
  return { arc: ARC.toFixed(1), rempli: (ARC * ratio).toFixed(1), circonference: CIRCONFERENCE.toFixed(1), ratio };
}

/** Icône d'un équipement embarqué d'après son libellé (texte libre de system.equipementsEmbarques). */
const ICONES_AMENAGEMENT = [
  [/sanitaire|toilette|douche/i, "fa-toilet"],
  [/navette/i, "fa-shuttle-space"],
  [/pod|capsule|sauvetage/i, "fa-life-ring"],
  [/quartier|cabine|couchette|dortoir|chambre/i, "fa-bed"],
  [/cuisine|réfectoire|mess|repas/i, "fa-utensils"],
  [/infirmerie|médic|medic|bacta|kolto/i, "fa-kit-medical"],
  [/réserve|stock|vivres|provision/i, "fa-boxes-stacked"],
  [/droïde|droide/i, "fa-robot"],
  [/hangar|chasseur|speeder/i, "fa-warehouse"],
  [/salon|bar|luxe/i, "fa-martini-glass"],
  [/prison|cellule|carbonite/i, "fa-lock"],
  [/communication|antenne|holo/i, "fa-tower-broadcast"]
];

export class VaisseauSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["galactic-wars", "sheet", "actor", "vaisseau"],
    position: { width: 840, height: 880 },
    window: { resizable: true },
    // Voir personnage-sheet.mjs : sans ça, ActorSheetV2 (submitOnChange:false par défaut)
    // ne sauvegarde aucun champ texte/nombre simple tant qu'aucune action explicite ne
    // force un update().
    form: { submitOnChange: true },
    actions: {
      ajouterArme: VaisseauSheet.#onAjouterArme,
      editerArme: VaisseauSheet.#onEditerArme,
      supprimerArme: VaisseauSheet.#onSupprimerArme,
      ajouterPoste: VaisseauSheet.#onAjouterPoste,
      editerPoste: VaisseauSheet.#onEditerPoste,
      supprimerPoste: VaisseauSheet.#onSupprimerPoste,
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

    context.actor = this.actor;
    context.system = system;
    context.descriptionEnrichie = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      system.description,
      { relativeTo: this.actor }
    );

    // Grande image de la fiche : le portrait, sinon l'image de l'acteur (tant que le portrait est celui par défaut).
    const portraitParDefaut = !system.portrait || system.portrait === "icons/svg/mystery-man.svg";
    context.plan = portraitParDefaut ? this.actor.img : system.portrait;

    const coque = jauge(system.pv.actuels, system.pv.max);
    context.jauges = {
      coque: { ...coque, etat: coque.ratio > 0.5 ? "ok" : coque.ratio >= 0.25 ? "blesse" : "critique" },
      bouclier: jauge(system.bouclier.points, system.bouclier.max),
      reduction: jauge(system.bouclier.reduction > 0 ? 1 : 0, 1)
    };
    context.bouclierInactif = !system.bouclier.actif;
    context.armement = system.armement.map((arme, index) => ({
      ...arme,
      index,
      emplacements: arme.emplacement.split(/\s*[,;\n]\s*/).filter(Boolean)
    }));
    context.equipage = system.equipage.map((poste, index) => ({
      ...poste,
      index,
      sieges: Array.from({ length: Math.max(1, poste.places) }, (_, siege) => ({ siege, nom: poste.noms[siege] ?? "" }))
    }));
    context.amenagements = system.equipementsEmbarques
      .split(/\s*[,;.\n]\s*/)
      .filter(Boolean)
      .map((libelle) => ({ libelle, icone: ICONES_AMENAGEMENT.find(([motif]) => motif.test(libelle))?.[1] ?? "fa-cube" }));

    return context;
  }

  /** @override — seuls les noms de l'équipage sont dans le formulaire : ils sont fusionnés dans le tableau complet
   *  (sinon rôle, places et description seraient perdus, un ArrayField étant toujours remplacé en entier). */
  _processFormData(event, form, formData) {
    const data = super._processFormData(event, form, formData);
    const soumis = data.system?.equipage;
    if (soumis) {
      const equipage = this.actor.system.toObject().equipage;
      for (const [index, poste] of Object.entries(soumis)) {
        if (!equipage[index] || !poste?.noms) continue;
        const noms = Object.values(poste.noms).map((n) => String(n ?? "").trim());
        equipage[index].noms = noms.slice(0, equipage[index].places);
      }
      data.system.equipage = equipage;
    }
    return data;
  }

  /** Fenêtre d'édition d'une arme ; `arme` absent = nouvelle arme. Renvoie les valeurs saisies, ou null. */
  async #fenetreArme(arme) {
    const t = (cle) => game.i18n.localize(`GALACTICWARS.Vaisseau.${cle}`);
    const valeur = (v) => foundry.utils.escapeHTML(String(v ?? ""));
    return DialogV2.input({
      window: { title: t(arme ? "EditerArme" : "AjouterArme"), icon: "fa-solid fa-crosshairs" },
      position: { width: 420 },
      content: `<div class="gw-vaisseau-dialogue">
        <label>${t("NomArme")}<input type="text" name="nom" value="${valeur(arme?.nom)}" autofocus required></label>
        <label>${t("Degats")}<input type="text" name="degats" value="${valeur(arme?.degats)}" placeholder="4d6"></label>
        <label>${t("Quantite")}<input type="number" name="quantite" min="1" step="1" value="${arme?.quantite ?? 1}"></label>
        <label>${t("Emplacement")}<input type="text" name="emplacement" value="${valeur(arme?.emplacement)}" placeholder="${t("EmplacementExemple")}"></label>
      </div>`,
      ok: { label: t("Enregistrer"), icon: "fa-solid fa-floppy-disk" },
      rejectClose: false
    });
  }

  /** Fenêtre d'édition d'un poste d'équipage ; `poste` absent = nouveau poste. */
  async #fenetrePoste(poste) {
    const t = (cle) => game.i18n.localize(`GALACTICWARS.Vaisseau.${cle}`);
    const valeur = (v) => foundry.utils.escapeHTML(String(v ?? ""));
    return DialogV2.input({
      window: { title: t(poste ? "EditerPoste" : "AjouterPoste"), icon: "fa-solid fa-user-astronaut" },
      position: { width: 420 },
      content: `<div class="gw-vaisseau-dialogue">
        <label>${t("Poste")}<input type="text" name="role" value="${valeur(poste?.role)}" autofocus required></label>
        <label>${t("Places")}<input type="number" name="places" min="1" max="20" step="1" value="${poste?.places ?? 1}"></label>
        <label>${t("DescriptionPoste")}<textarea name="description" rows="3">${valeur(poste?.description)}</textarea></label>
      </div>`,
      ok: { label: t("Enregistrer"), icon: "fa-solid fa-floppy-disk" },
      rejectClose: false
    });
  }

  async #confirmerSuppression(nom) {
    return DialogV2.confirm({
      window: { title: game.i18n.localize("GALACTICWARS.Vaisseau.Supprimer"), icon: "fa-solid fa-trash" },
      content: `<p>${game.i18n.format("GALACTICWARS.Vaisseau.SupprimerConfirmation", { nom: foundry.utils.escapeHTML(nom) })}</p>`,
      yes: { label: game.i18n.localize("GALACTICWARS.Vaisseau.Supprimer"), icon: "fa-solid fa-trash" },
      no: { default: true }
    });
  }

  static #nettoyerArme(saisie) {
    return {
      nom: String(saisie.nom ?? "").trim(),
      degats: String(saisie.degats ?? "").trim(),
      quantite: Math.max(1, Math.round(Number(saisie.quantite) || 1)),
      emplacement: String(saisie.emplacement ?? "").trim()
    };
  }

  static async #onAjouterArme() {
    const saisie = await this.#fenetreArme(null);
    if (!saisie) return;
    const armement = this.actor.system.toObject().armement;
    armement.push(VaisseauSheet.#nettoyerArme(saisie));
    await this.actor.update({ "system.armement": armement });
  }

  static async #onEditerArme(event, target) {
    const index = Number(target.closest("[data-index]").dataset.index);
    const armement = this.actor.system.toObject().armement;
    if (!armement[index]) return;
    const saisie = await this.#fenetreArme(armement[index]);
    if (!saisie) return;
    armement[index] = VaisseauSheet.#nettoyerArme(saisie);
    await this.actor.update({ "system.armement": armement });
  }

  static async #onSupprimerArme(event, target) {
    const index = Number(target.closest("[data-index]").dataset.index);
    const armement = this.actor.system.toObject().armement;
    if (!armement[index] || !(await this.#confirmerSuppression(armement[index].nom))) return;
    await this.actor.update({ "system.armement": armement.filter((_, i) => i !== index) });
  }

  static async #onAjouterPoste() {
    const saisie = await this.#fenetrePoste(null);
    if (!saisie) return;
    const equipage = this.actor.system.toObject().equipage;
    equipage.push({ ...VaisseauSheet.#nettoyerPoste(saisie), noms: [], nom: "" });
    await this.actor.update({ "system.equipage": equipage });
  }

  static async #onEditerPoste(event, target) {
    const index = Number(target.closest("[data-index]").dataset.index);
    const equipage = this.actor.system.toObject().equipage;
    if (!equipage[index]) return;
    const saisie = await this.#fenetrePoste(equipage[index]);
    if (!saisie) return;
    const poste = VaisseauSheet.#nettoyerPoste(saisie);
    equipage[index] = { ...equipage[index], ...poste, noms: equipage[index].noms.slice(0, poste.places) };
    await this.actor.update({ "system.equipage": equipage });
  }

  static async #onSupprimerPoste(event, target) {
    const index = Number(target.closest("[data-index]").dataset.index);
    const equipage = this.actor.system.toObject().equipage;
    if (!equipage[index] || !(await this.#confirmerSuppression(equipage[index].role))) return;
    await this.actor.update({ "system.equipage": equipage.filter((_, i) => i !== index) });
  }

  static #nettoyerPoste(saisie) {
    return {
      role: String(saisie.role ?? "").trim(),
      places: Math.min(20, Math.max(1, Math.round(Number(saisie.places) || 1))),
      description: String(saisie.description ?? "").trim()
    };
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
