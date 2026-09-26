import { GW } from "../config.mjs";
import { COMPETENCE_ARME_VAISSEAU, IMAGE_ARME_VAISSEAU, convertirArmement, emplacementArme } from "../helpers/armement-vaisseau.mjs";

const { HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/** Jauge en arc de 270° (ouverte en bas) : longueur de l'arc visible et de la part remplie, pour un cercle de rayon 40. */
const CIRCONFERENCE = 2 * Math.PI * 40;
const ARC = CIRCONFERENCE * 0.75;

function jauge(valeur, max) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, valeur / max)) : (valeur > 0 ? 1 : 0);
  return { arc: ARC.toFixed(1), rempli: (ARC * ratio).toFixed(1), circonference: CIRCONFERENCE.toFixed(1), ratio };
}

/** Icône d'un aménagement d'après son nom (premier motif trouvé ; par défaut une caisse). */
const ICONES_AMENAGEMENT = [
  [/sanitaire|toilette|douche/i, "fa-toilet"],
  [/navette/i, "fa-shuttle-space"],
  [/pod|capsule|sauvetage/i, "fa-life-ring"],
  [/quartier|cabine|couchette|dortoir|chambre/i, "fa-bed"],
  [/cuisine|réfectoire|mess|repas/i, "fa-utensils"],
  [/infirmerie|médic|medic|bacta|kolto/i, "fa-kit-medical"],
  [/réserve|stock|vivres|provision|nourriture/i, "fa-boxes-stacked"],
  [/droïde|droide|astromech/i, "fa-robot"],
  [/pilotage|passerelle|cockpit/i, "fa-gauge-high"],
  [/machine|moteur|réacteur|reacteur/i, "fa-gears"],
  [/\bsas\b|débarquement|debarquement/i, "fa-door-open"],
  [/hangar|entrepôt|entrepot|cale/i, "fa-warehouse"],
  [/réunion|reunion/i, "fa-people-group"],
  [/\bbar\b/i, "fa-martini-glass"],
  [/salon|séjour|sejour|repos|luxe/i, "fa-couch"],
  [/pont|étage|etage/i, "fa-layer-group"],
  [/passager/i, "fa-person"],
  [/habitacle|selle|ouvert/i, "fa-wind"],
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
      afficherArme: VaisseauSheet.#onAfficherArme,
      editerArme: VaisseauSheet.#onEditerArme,
      supprimerArme: VaisseauSheet.#onSupprimerArme,
      convertirArmement: VaisseauSheet.#onConvertirArmement,
      ajouterPoste: VaisseauSheet.#onAjouterPoste,
      editerPoste: VaisseauSheet.#onEditerPoste,
      supprimerPoste: VaisseauSheet.#onSupprimerPoste,
      ouvrirMembre: VaisseauSheet.#onOuvrirMembre,
      retirerMembre: VaisseauSheet.#onRetirerMembre,
      ajouterAmenagement: VaisseauSheet.#onAjouterAmenagement,
      editerAmenagement: VaisseauSheet.#onEditerAmenagement,
      supprimerAmenagement: VaisseauSheet.#onSupprimerAmenagement,
      basculerEdition: VaisseauSheet.#onBasculerEdition,
      editImage: VaisseauSheet.#onEditImage
    }
  };

  static PARTS = {
    body: { template: "systems/galactic-wars/templates/actor/vaisseau-sheet.hbs", scrollable: [".sheet-body"] }
  };

  /** Mode Édition — état d'affichage de l'instance (comme la fiche de personnage). null = pas encore choisi :
   *  ouvert d'office sur un vaisseau vierge, verrouillé sinon. */
  #modeEdition = null;

  get modeEdition() {
    if (!this.isEditable) return false;
    if (this.#modeEdition === null) {
      const s = this.actor.system;
      this.#modeEdition = !s.classe && !s.pv.max && !this.#armes().length && !s.equipage.length;
    }
    return this.#modeEdition;
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;

    context.actor = this.actor;
    context.system = system;
    context.modeEdition = this.modeEdition;
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
    // Armes = objets « arme » du vaisseau ; tir au taux du token sélectionné (Item#attaquer).
    context.armement = this.#armes().map((arme) => {
      const emplacement = emplacementArme(arme);
      const competence = GW.competences[arme.system.competence];
      return {
        id: arme.id,
        nom: arme.name,
        img: arme.img,
        degats: arme.system.degats,
        quantite: arme.system.quantite,
        competence: competence ? game.i18n.localize(competence.label) : "",
        emplacement,
        emplacements: emplacement.split(/\s*[,;\n]\s*/).filter(Boolean)
      };
    });
    context.ancienArmement = system.armement.length;
    // Places : acteur déposé (image, clic = sa fiche) ou nom saisi à la main.
    context.equipage = system.equipage.map((poste, index) => ({
      ...poste,
      index,
      sieges: Array.from({ length: Math.max(1, poste.places) }, (_, siege) => {
        const uuid = poste.uuids[siege] || "";
        const membre = uuid ? fromUuidSync(uuid) : null;
        return { siege, nom: poste.noms[siege] ?? "", uuid, img: membre?.img ?? null, lie: !!uuid };
      })
    }));
    context.amenagements = system.amenagements.map((a, index) => ({
      ...a,
      index,
      icone: ICONES_AMENAGEMENT.find(([motif]) => motif.test(a.nom))?.[1] ?? "fa-cube"
    }));

    return context;
  }

  #armes() {
    return this.actor.items.filter((i) => i.type === "arme").sort((a, b) => (a.sort - b.sort) || a.name.localeCompare(b.name));
  }

  #armeDeLigne(target) {
    return this.actor.items.get(target.closest("[data-item-id]")?.dataset.itemId);
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options);
    // Ligne d'arme (role="button") : Entrée / Espace = même effet que le clic.
    for (const ligne of this.element.querySelectorAll(".vs-arme[data-action]")) {
      ligne.addEventListener("keydown", (e) => {
        if (e.target !== ligne || (e.key !== "Enter" && e.key !== " ")) return;
        e.preventDefault();
        this.actor.items.get(ligne.dataset.itemId)?.afficherDansTchat();
      });
    }
    // Emplacement d'une arme (mode Édition) : drapeau de l'objet, hors du formulaire du vaisseau.
    for (const champ of this.element.querySelectorAll("input[data-emplacement]")) {
      champ.addEventListener("change", (e) => {
        e.stopPropagation();
        this.actor.items.get(champ.dataset.emplacement)?.setFlag("galactic-wars", "emplacement", champ.value.trim());
      });
    }
    // Surbrillance du poste survolé pendant le glisser-déposer d'un acteur.
    for (const poste of this.element.querySelectorAll(".vs-poste[data-index]")) {
      poste.addEventListener("dragover", () => poste.classList.add("survol-depot"));
      poste.addEventListener("dragleave", (e) => { if (!poste.contains(e.relatedTarget)) poste.classList.remove("survol-depot"); });
      poste.addEventListener("drop", () => poste.classList.remove("survol-depot"));
    }
  }

  /** @override — seuls les noms saisis de l'équipage sont dans le formulaire : ils sont fusionnés place par place dans
   *  le tableau complet (sinon rôle, places, description et acteurs déposés seraient perdus, un ArrayField étant
   *  toujours remplacé en entier). */
  _processFormData(event, form, formData) {
    const data = super._processFormData(event, form, formData);
    const soumis = data.system?.equipage;
    if (soumis) {
      const equipage = this.actor.system.toObject().equipage;
      for (const [index, poste] of Object.entries(soumis)) {
        const cible = equipage[index];
        if (!cible || !poste?.noms) continue;
        for (const [siege, nom] of Object.entries(poste.noms)) {
          if (Number(siege) < cible.places) cible.noms[siege] = String(nom ?? "").trim();
        }
        cible.noms = Array.from({ length: cible.noms.length }, (_, i) => cible.noms[i] ?? "");
      }
      data.system.equipage = equipage;
    }
    return data;
  }

  /** @override — seules les armes s'ajoutent au vaisseau (son armement) ; toujours utilisables (portées). */
  async _onDropItem(event, item) {
    if (!this.isEditable || !item) return null;
    if (item.type !== "arme") {
      ui.notifications.warn(game.i18n.localize("GALACTICWARS.Vaisseau.SeulementArmes"));
      return null;
    }
    if (item.parent === this.actor) return null;
    const donnees = item.toObject();
    delete donnees._id;
    donnees.system.porte = true;
    const [cree] = await this.actor.createEmbeddedDocuments("Item", [donnees]);
    return cree ?? null;
  }

  /**
   * @override — un acteur (personnage, PNJ…) déposé sur un poste d'équipage occupe la place visée, sinon la première
   * place libre du poste ; possible hors mode Édition.
   */
  async _onDropActor(event, actor) {
    if (!actor || !this.isEditable) return null;
    const t = (cle, donnees) => game.i18n.format(`GALACTICWARS.Vaisseau.${cle}`, donnees);
    if (actor.type === "vaisseau") return null;
    const posteEl = event.target.closest?.(".vs-poste[data-index]");
    if (!posteEl) {
      ui.notifications.warn(t("DeposerSurPoste"));
      return null;
    }
    const index = Number(posteEl.dataset.index);
    const equipage = this.actor.system.toObject().equipage;
    const poste = equipage[index];
    if (!poste) return null;
    const occupee = (i) => !!(poste.uuids[i] || poste.noms[i]);
    const visee = event.target.closest?.("[data-siege]")?.dataset.siege;
    let siege = visee !== undefined ? Number(visee) : Array.from({ length: poste.places }, (_, i) => i).find((i) => !occupee(i));
    if (siege === undefined) {
      ui.notifications.warn(t("PosteComplet", { poste: poste.role }));
      return null;
    }
    for (let i = 0; i < poste.places; i++) { poste.noms[i] ??= ""; poste.uuids[i] ??= ""; }
    poste.noms[siege] = actor.name;
    poste.uuids[siege] = actor.uuid;
    await this.actor.update({ "system.equipage": equipage });
    return actor;
  }

  static async #onOuvrirMembre(event, target) {
    const acteur = await fromUuid(target.closest("[data-uuid]")?.dataset.uuid);
    if (!acteur) return ui.notifications.warn(game.i18n.localize("GALACTICWARS.Vaisseau.MembreIntrouvable"));
    if (!acteur.testUserPermission(game.user, "LIMITED")) return;
    acteur.sheet.render({ force: true });
  }

  static async #onRetirerMembre(event, target) {
    const index = Number(target.closest(".vs-poste[data-index]").dataset.index);
    const siege = Number(target.closest("[data-siege]").dataset.siege);
    const equipage = this.actor.system.toObject().equipage;
    if (!equipage[index]) return;
    equipage[index].noms[siege] = "";
    equipage[index].uuids[siege] = "";
    await this.actor.update({ "system.equipage": equipage });
  }

  static async #onBasculerEdition() {
    this.#modeEdition = !this.modeEdition;
    this.render();
  }

  /** Fenêtre d'édition d'un aménagement ; `amenagement` absent = nouvel aménagement. */
  async #fenetreAmenagement(amenagement) {
    const t = (cle) => game.i18n.localize(`GALACTICWARS.Vaisseau.${cle}`);
    const valeur = (v) => foundry.utils.escapeHTML(String(v ?? ""));
    return DialogV2.input({
      window: { title: t(amenagement ? "EditerAmenagement" : "AjouterAmenagement"), icon: "fa-solid fa-couch" },
      position: { width: 440 },
      content: `<div class="gw-vaisseau-dialogue">
        <label>${t("NomAmenagement")}<input type="text" name="nom" value="${valeur(amenagement?.nom)}" placeholder="${t("NomAmenagementExemple")}" autofocus required></label>
        <label>${t("DescriptionAmenagement")}<textarea name="description" rows="4">${valeur(amenagement?.description)}</textarea></label>
      </div>`,
      ok: { label: t("Enregistrer"), icon: "fa-solid fa-floppy-disk" },
      rejectClose: false
    });
  }

  static #nettoyerAmenagement(saisie) {
    return { nom: String(saisie.nom ?? "").trim(), description: String(saisie.description ?? "").trim() };
  }

  static async #onAjouterAmenagement() {
    const saisie = await this.#fenetreAmenagement(null);
    if (!saisie) return;
    const amenagements = this.actor.system.toObject().amenagements;
    amenagements.push(VaisseauSheet.#nettoyerAmenagement(saisie));
    await this.actor.update({ "system.amenagements": amenagements });
  }

  static async #onEditerAmenagement(event, target) {
    const index = Number(target.closest("[data-index]").dataset.index);
    const amenagements = this.actor.system.toObject().amenagements;
    if (!amenagements[index]) return;
    const saisie = await this.#fenetreAmenagement(amenagements[index]);
    if (!saisie) return;
    amenagements[index] = VaisseauSheet.#nettoyerAmenagement(saisie);
    await this.actor.update({ "system.amenagements": amenagements });
  }

  static async #onSupprimerAmenagement(event, target) {
    const index = Number(target.closest("[data-index]").dataset.index);
    const amenagements = this.actor.system.toObject().amenagements;
    if (!amenagements[index] || !(await this.#confirmerSuppression(amenagements[index].nom))) return;
    await this.actor.update({ "system.amenagements": amenagements.filter((_, i) => i !== index) });
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

  /** Nouvelle arme vierge (compétence Canon lourd) : sa fiche s'ouvre pour la compléter. */
  static async #onAjouterArme() {
    const [arme] = await this.actor.createEmbeddedDocuments("Item", [{
      name: game.i18n.localize("GALACTICWARS.Vaisseau.NouvelleArme"),
      type: "arme",
      img: IMAGE_ARME_VAISSEAU,
      system: { degats: "", competence: COMPETENCE_ARME_VAISSEAU, porte: true }
    }]);
    arme?.sheet.render({ force: true });
  }

  /** Clic sur la ligne : carte de l'arme dans le tchat (boutons Attaquer / Dégâts). */
  static async #onAfficherArme(event, target) {
    await this.#armeDeLigne(target)?.afficherDansTchat();
  }

  static async #onEditerArme(event, target) {
    event.stopPropagation();
    this.#armeDeLigne(target)?.sheet.render({ force: true });
  }

  static async #onSupprimerArme(event, target) {
    event.stopPropagation();
    const arme = this.#armeDeLigne(target);
    if (arme && (await this.#confirmerSuppression(arme.name))) await arme.delete();
  }

  static async #onConvertirArmement() {
    const nombre = await convertirArmement(this.actor);
    if (nombre) ui.notifications.info(game.i18n.format("GALACTICWARS.Vaisseau.ArmementConverti", { nombre }));
  }

  static async #onAjouterPoste() {
    const saisie = await this.#fenetrePoste(null);
    if (!saisie) return;
    const equipage = this.actor.system.toObject().equipage;
    equipage.push({ ...VaisseauSheet.#nettoyerPoste(saisie), noms: [], uuids: [], nom: "" });
    await this.actor.update({ "system.equipage": equipage });
  }

  static async #onEditerPoste(event, target) {
    const index = Number(target.closest("[data-index]").dataset.index);
    const equipage = this.actor.system.toObject().equipage;
    if (!equipage[index]) return;
    const saisie = await this.#fenetrePoste(equipage[index]);
    if (!saisie) return;
    const poste = VaisseauSheet.#nettoyerPoste(saisie);
    equipage[index] = {
      ...equipage[index],
      ...poste,
      noms: equipage[index].noms.slice(0, poste.places),
      uuids: equipage[index].uuids.slice(0, poste.places)
    };
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
