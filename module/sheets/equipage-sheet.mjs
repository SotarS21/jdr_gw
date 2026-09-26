import { TYPES_MEMBRES, TYPES_OBJETS_RESERVE, deplacerObjet, pvDe, transfererCredits } from "../helpers/equipage.mjs";

const { HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

const t = (cle, donnees) => (donnees
  ? game.i18n.format(`GALACTICWARS.Equipage.${cle}`, donnees)
  : game.i18n.localize(`GALACTICWARS.Equipage.${cle}`));

/**
 * Fiche d'équipage (sur le modèle de l'acteur « Groupe » de Pathfinder 2) : onglets Membres, Réserve, Notes ; en-tête
 * avec la caisse commune et le vaisseau. On y dépose des personnages (membres), un vaisseau, et des objets (réserve :
 * un objet glissé depuis la fiche d'un membre y est déplacé, pas copié).
 */
export class EquipageSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["galactic-wars", "sheet", "actor", "equipage"],
    position: { width: 820, height: 760 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      changerOnglet: EquipageSheet.#onChangerOnglet,
      editImage: EquipageSheet.#onEditImage,
      ouvrirActeur: EquipageSheet.#onOuvrirActeur,
      retirerMembre: EquipageSheet.#onRetirerMembre,
      creditsMembre: EquipageSheet.#onCreditsMembre,
      retirerVaisseau: EquipageSheet.#onRetirerVaisseau,
      ouvrirObjet: EquipageSheet.#onOuvrirObjet,
      afficherObjet: EquipageSheet.#onAfficherObjet,
      donnerObjet: EquipageSheet.#onDonnerObjet,
      supprimerObjet: EquipageSheet.#onSupprimerObjet
    }
  };

  static PARTS = {
    body: { template: "systems/galactic-wars/templates/actor/equipage-sheet.hbs", scrollable: [".sheet-body"] }
  };

  #onglet = "membres";

  /** Membres résolus (acteur ou null si supprimé), dans l'ordre de system.membres. */
  #membres() {
    return this.actor.system.membres.map((uuid) => ({ uuid, acteur: fromUuidSync(uuid) }));
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.actor.system;
    context.actor = this.actor;
    context.system = system;
    context.onglet = this.#onglet;
    context.portrait = system.portrait && system.portrait !== "icons/svg/mystery-man.svg" ? system.portrait : this.actor.img;

    context.membres = this.#membres().map(({ uuid, acteur }) => {
      if (!acteur) return { uuid, manquant: true };
      const pv = pvDe(acteur);
      const ratio = pv?.max ? Math.max(0, Math.min(1, pv.value / pv.max)) : 0;
      const s = acteur.system;
      return {
        uuid,
        nom: acteur.name,
        img: acteur.img,
        type: game.i18n.localize(`TYPES.Actor.${acteur.type}`),
        details: [s.race?.nom, s.metier?.nom ?? s.ecole?.nom].filter(Boolean).join(" · "),
        niveau: s.niveau ?? null,
        pv,
        pvPourcent: Math.round(ratio * 100),
        pvEtat: ratio > 0.5 ? "ok" : ratio >= 0.25 ? "blesse" : "critique",
        credits: s.credits ?? 0,
        visible: acteur.testUserPermission(game.user, "OBSERVER"),
        modifiable: acteur.isOwner
      };
    });
    context.nombreMembres = context.membres.filter((m) => !m.manquant).length;

    const vaisseau = system.vaisseau?.uuid ? fromUuidSync(system.vaisseau.uuid) : null;
    context.vaisseau = system.vaisseau?.uuid
      ? vaisseau
        ? { nom: vaisseau.name, img: vaisseau.img, classe: vaisseau.system.classe, coque: `${vaisseau.system.pv.actuels} / ${vaisseau.system.pv.max}` }
        : { manquant: true, nom: system.vaisseau.nom }
      : null;

    // Réserve : objets de l'équipage, par catégorie ; « Donner à » propose les membres que l'utilisateur peut modifier.
    const parNom = (a, b) => a.name.localeCompare(b.name, game.i18n.lang);
    const ligne = (i) => ({
      id: i.id, nom: i.name, img: i.img, quantite: i.system.quantite ?? 1,
      valeur: i.type === "arme" ? i.system.degats : i.type === "armure" ? `+${i.system.reduction ?? 0}` : ""
    });
    context.reserve = [
      { cle: "arme", titre: "GALACTICWARS.Sheet.Armes" },
      { cle: "armure", titre: "GALACTICWARS.Objet.ArmuresBoucliers" },
      { cle: "equipement", titre: "GALACTICWARS.Sheet.Equipement" }
    ].map((g) => ({ ...g, objets: this.actor.items.filter((i) => i.type === g.cle).sort(parNom).map(ligne) }));
    context.nombreObjets = this.actor.items.filter((i) => TYPES_OBJETS_RESERVE.includes(i.type)).length;
    context.destinataires = this.#membres().filter((m) => m.acteur?.isOwner).map((m) => ({ uuid: m.uuid, nom: m.acteur.name }));

    if (this.#onglet === "notes") {
      context.descriptionEnrichie = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        system.description ?? "", { relativeTo: this.actor }
      );
    }
    return context;
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options);
    // Liste « Donner à » : ni clic (carte dans le tchat) ni changement (formulaire) ne remontent à la ligne.
    for (const select of this.element.querySelectorAll("select[data-destinataire]")) {
      for (const type of ["click", "change", "keydown"]) select.addEventListener(type, (e) => e.stopPropagation());
    }
    // Lignes de la réserve (role="button") : Entrée / Espace = même effet que le clic.
    for (const ligne of this.element.querySelectorAll(".eq-objet[data-item-id]")) {
      ligne.addEventListener("keydown", (e) => {
        if (e.target !== ligne || (e.key !== "Enter" && e.key !== " ")) return;
        e.preventDefault();
        this.actor.items.get(ligne.dataset.itemId)?.afficherDansTchat?.();
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Glisser-déposer                                                  */
  /* ---------------------------------------------------------------- */

  /** @override — personnage → membre ; vaisseau → vaisseau de l'équipage. */
  async _onDropActor(event, acteur) {
    if (!this.isEditable || !acteur) return null;
    if (acteur.pack) {
      ui.notifications.warn(t("DepuisCompendium"));
      return null;
    }
    if (acteur.type === "vaisseau") {
      await this.actor.update({ "system.vaisseau": { uuid: acteur.uuid, nom: acteur.name } });
      ui.notifications.info(t("VaisseauLie", { nom: acteur.name }));
      return acteur;
    }
    if (!TYPES_MEMBRES.includes(acteur.type)) {
      ui.notifications.warn(t("TypeRefuse"));
      return null;
    }
    const uuid = acteur.isToken ? acteur.token?.baseActor?.uuid ?? acteur.uuid : acteur.uuid;
    if (this.actor.system.membres.includes(uuid)) {
      ui.notifications.info(t("DejaMembre", { nom: acteur.name }));
      return null;
    }
    this.#onglet = "membres";
    await this.actor.update({ "system.membres": [...this.actor.system.membres, uuid] });
    ui.notifications.info(t("MembreAjoute", { nom: acteur.name, equipage: this.actor.name }));
    return acteur;
  }

  /** @override — objet déposé dans la réserve : déplacé depuis un acteur, copié depuis un compendium / le monde. */
  async _onDropItem(event, objet) {
    if (!this.isEditable || !objet) return null;
    if (!TYPES_OBJETS_RESERVE.includes(objet.type)) {
      ui.notifications.warn(t("ObjetRefuse"));
      return null;
    }
    if (objet.parent === this.actor) return null;
    this.#onglet = "reserve";
    if (objet.parent instanceof Actor) return deplacerObjet(objet, this.actor);
    const donnees = objet.toObject();
    delete donnees._id;
    if ("porte" in (donnees.system ?? {})) donnees.system.porte = false;
    const [cree] = await this.actor.createEmbeddedDocuments("Item", [donnees]);
    return cree ?? null;
  }

  /* ---------------------------------------------------------------- */
  /* Actions                                                          */
  /* ---------------------------------------------------------------- */

  static #onChangerOnglet(event, target) {
    this.#onglet = target.dataset.onglet;
    this.render();
  }

  static async #onEditImage() {
    if (!this.isEditable) return;
    const picker = new foundry.applications.apps.FilePicker.implementation({
      current: this.actor.system.portrait,
      type: "image",
      callback: (chemin) => this.actor.update({ img: chemin, "system.portrait": chemin, "prototypeToken.texture.src": chemin })
    });
    return picker.browse();
  }

  static async #onOuvrirActeur(event, target) {
    const acteur = await fromUuid(target.closest("[data-uuid]")?.dataset.uuid);
    if (!acteur) return;
    if (!acteur.testUserPermission(game.user, "LIMITED")) return ui.notifications.warn(t("AccesRefuse", { nom: acteur.name }));
    acteur.sheet.render({ force: true });
  }

  static async #onRetirerMembre(event, target) {
    const uuid = target.closest("[data-uuid]")?.dataset.uuid;
    const nom = fromUuidSync(uuid)?.name ?? t("MembreInconnu");
    const confirme = await DialogV2.confirm({
      window: { title: t("RetirerMembre"), icon: "fa-solid fa-user-minus" },
      content: `<p>${t("RetirerMembreConfirmation", { nom: foundry.utils.escapeHTML(nom), equipage: foundry.utils.escapeHTML(this.actor.name) })}</p>`,
      yes: { label: t("Retirer"), icon: "fa-solid fa-user-minus" },
      no: { default: true }
    });
    if (confirme) await this.actor.update({ "system.membres": this.actor.system.membres.filter((u) => u !== uuid) });
  }

  /** Verser dans la caisse / y prendre : fenêtre avec montant et deux boutons. */
  static async #onCreditsMembre(event, target) {
    const membre = await fromUuid(target.closest("[data-uuid]")?.dataset.uuid);
    if (!membre) return;
    const echapper = foundry.utils.escapeHTML;
    const choix = await DialogV2.wait({
      window: { title: t("CreditsTitre", { nom: membre.name }), icon: "fa-solid fa-coins" },
      position: { width: 380 },
      content: `<div class="gw-equipage-dialogue">
        <p>${t("CreditsSoldes", { nom: echapper(membre.name), solde: membre.system.credits ?? 0, caisse: this.actor.system.credits ?? 0 })}</p>
        <label>${t("Montant")}<input type="number" name="montant" min="1" step="1" value="100" autofocus></label>
      </div>`,
      buttons: [
        { action: "verser", label: t("Verser"), icon: "fa-solid fa-arrow-right-to-bracket", default: true,
          callback: (e, bouton) => ({ sens: 1, montant: bouton.form.elements.montant.valueAsNumber }) },
        { action: "prendre", label: t("Prendre"), icon: "fa-solid fa-arrow-right-from-bracket",
          callback: (e, bouton) => ({ sens: -1, montant: bouton.form.elements.montant.valueAsNumber }) }
      ],
      rejectClose: false
    });
    if (!choix?.montant || choix.montant < 1) return;
    await transfererCredits(this.actor, membre, choix.sens * choix.montant);
  }

  static async #onRetirerVaisseau() {
    await this.actor.update({ "system.vaisseau": { uuid: "", nom: "" } });
  }

  #objetDeLigne(target) {
    return this.actor.items.get(target.closest("[data-item-id]")?.dataset.itemId);
  }

  static async #onOuvrirObjet(event, target) {
    event.stopPropagation();
    this.#objetDeLigne(target)?.sheet.render({ force: true });
  }

  static async #onAfficherObjet(event, target) {
    await this.#objetDeLigne(target)?.afficherDansTchat?.();
  }

  static async #onDonnerObjet(event, target) {
    event.stopPropagation();
    const objet = this.#objetDeLigne(target);
    const select = target.closest("[data-item-id]")?.querySelector("select[data-destinataire]");
    const destinataire = select?.value ? await fromUuid(select.value) : null;
    if (!objet || !destinataire) return ui.notifications.warn(t("ChoisirDestinataire"));
    const cree = await deplacerObjet(objet, destinataire);
    if (cree) ui.notifications.info(t("ObjetDonne", { objet: cree.name, nom: destinataire.name }));
  }

  static async #onSupprimerObjet(event, target) {
    event.stopPropagation();
    const objet = this.#objetDeLigne(target);
    if (!objet) return;
    const confirme = await DialogV2.confirm({
      window: { title: game.i18n.localize("GALACTICWARS.Objet.SupprimerObjet"), icon: "fa-solid fa-trash" },
      content: `<p>${game.i18n.format("GALACTICWARS.Objet.SupprimerConfirmation", { nom: foundry.utils.escapeHTML(objet.name) })}</p>`,
      yes: { label: game.i18n.localize("GALACTICWARS.Objet.Supprimer"), icon: "fa-solid fa-trash" },
      no: { default: true }
    });
    if (confirme) await objet.delete();
  }
}

/**
 * Objet glissé depuis la réserve d'un équipage vers la fiche d'un autre acteur : déplacé (et non copié, comportement
 * par défaut de Foundry qui le dupliquerait). À enregistrer au hook "init".
 */
export function enregistrerHooksEquipage() {
  Hooks.on("dropActorSheetData", (acteur, sheet, donnees) => {
    if (donnees?.type !== "Item" || !donnees.uuid) return true;
    const objet = fromUuidSync(donnees.uuid);
    const source = objet?.parent;
    if (!(source instanceof Actor) || source.type !== "equipage" || source === acteur) return true;
    if (!TYPES_OBJETS_RESERVE.includes(objet.type) || !acteur.isOwner) return true;
    deplacerObjet(objet, acteur).then((cree) => {
      if (cree) ui.notifications.info(t("ObjetDonne", { objet: cree.name, nom: acteur.name }));
    });
    return false;
  });
}
