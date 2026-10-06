import { GW } from "../config.mjs";
import { rollCompetence } from "../helpers/rolls.mjs";
import { IMAGE_AMENAGEMENT, TYPES_SOUTE, convertirAmenagements, modulesUtilises } from "../helpers/amenagements-vaisseau.mjs";
import { deplacerObjet } from "../helpers/equipage.mjs";

/** Compétence (clé de GW.competences) d'un poste : celle choisie, sinon déduite de son nom, sinon "". */
export function competencePoste(poste) {
  if (poste?.competence && GW.competences[poste.competence]) return poste.competence;
  return GW.competencesPostes.find(([motif]) => motif.test(poste?.role ?? ""))?.[1] ?? "";
}
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
      jetPoste: VaisseauSheet.#onJetPoste,
      ajouterAmenagement: VaisseauSheet.#onAjouterAmenagement,
      editerAmenagement: VaisseauSheet.#onEditerAmenagement,
      supprimerAmenagement: VaisseauSheet.#onSupprimerAmenagement,
      afficherObjet: VaisseauSheet.#onAfficherObjet,
      convertirAmenagements: VaisseauSheet.#onConvertirAmenagements,
      donnerObjetSoute: VaisseauSheet.#onDonnerObjetSoute,
      ouvrirObjetSoute: VaisseauSheet.#onOuvrirObjetSoute,
      supprimerObjetSoute: VaisseauSheet.#onSupprimerObjetSoute,
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
      bouclier: jauge(system.bouclier.points, system.bouclier.max)
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
    context.equipage = system.equipage.map((poste, index) => {
      const cle = competencePoste(poste);
      return {
        ...poste,
        index,
        competenceCle: cle,
        competenceLabel: cle ? game.i18n.localize(GW.competences[cle].label) : "",
        sieges: Array.from({ length: Math.max(1, poste.places) }, (_, siege) => {
          const uuid = poste.uuids[siege] || "";
          const membre = uuid ? fromUuidSync(uuid) : null;
          // Jet possible : place occupée par un acteur à compétences que l'utilisateur peut faire agir.
          const competence = cle ? membre?.system?.competences?.find?.((c) => c.cle === cle) : null;
          const jet = !!competence && !competence.bloquee && (membre.isOwner || game.user.isGM);
          return { siege, nom: poste.noms[siege] ?? "", uuid, img: membre?.img ?? null, lie: !!uuid, jet };
        })
      };
    });
    // Aménagements = objets « amenagement » ; icône déduite du nom tant qu'ils n'ont pas d'image propre.
    const texte = (html) => String(html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const parNom = (a, b) => a.name.localeCompare(b.name, game.i18n.lang);
    context.amenagements = this.actor.items.filter((i) => i.type === "amenagement").sort(parNom).map((a) => ({
      id: a.id,
      nom: a.name,
      img: a.img !== IMAGE_AMENAGEMENT ? a.img : null,
      icone: ICONES_AMENAGEMENT.find(([motif]) => motif.test(a.name))?.[1] ?? "fa-cube",
      // Premier paragraphe seulement (la mention « prix estimés » reste dans la fiche de l'aménagement).
      description: texte(String(a.system.description ?? "").split("</p>")[0]),
      modules: a.system.modules ?? 0,
      prix: a.system.prix
    }));
    const utilises = modulesUtilises(this.actor);
    context.modules = { utilises, max: system.modules ?? 0, depasse: utilises > (system.modules ?? 0) };
    context.ancienAmenagements = system.amenagements.length;
    // Soute : équipements et armures du vaisseau ; « Donner à » propose les membres assis que l'utilisateur possède.
    context.soute = this.actor.items.filter((i) => TYPES_SOUTE.includes(i.type)).sort(parNom)
      .map((i) => ({ id: i.id, nom: i.name, img: i.img, quantite: i.system.quantite ?? 1 }));
    const assis = [...new Set(system.equipage.flatMap((p) => p.uuids).filter(Boolean))];
    context.destinataires = assis.map((uuid) => fromUuidSync(uuid)).filter((a) => a?.isOwner)
      .map((a) => ({ uuid: a.uuid, nom: a.name }));

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
    for (const select of this.element.querySelectorAll("select[data-destinataire]")) {
      for (const type of ["click", "change", "keydown"]) select.addEventListener(type, (e) => e.stopPropagation());
    }
    // Ligne d'arme (role="button") : Entrée / Espace = même effet que le clic.
    for (const ligne of this.element.querySelectorAll(".vs-arme[data-action], .vs-amenagement[data-action], .vs-objet-soute[data-action]")) {
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
    // Places occupées glissables (vers une autre place, un autre poste, ou une autre fiche) : on emporte l'acteur et
    // la place d'origine, pour un déplacement plutôt qu'une copie (suivi de l'auteur n° 15).
    if (this.isEditable) {
      for (const membre of this.element.querySelectorAll(".vs-membre[data-uuid]")) {
        membre.draggable = true;
        membre.addEventListener("dragstart", (e) => {
          const index = Number(membre.closest(".vs-poste[data-index]")?.dataset.index);
          const siege = Number(membre.dataset.siege);
          e.dataTransfer.setData("text/plain", JSON.stringify({
            type: "Actor", uuid: membre.dataset.uuid, gwSiege: { vaisseau: this.actor.uuid, index, siege }
          }));
          e.stopPropagation();
        });
      }
    }
    // Fiche seulement observée : Foundry désactive tous les boutons, mais un joueur doit pouvoir ouvrir la fiche
    // d'un membre et lancer le jet de poste de SON personnage (même principe que l'avantage d'équipage, v0.19.5).
    if (!this.isEditable) {
      for (const lien of this.element.querySelectorAll("button.vs-membre-lien")) lien.disabled = false;
      for (const jet of this.element.querySelectorAll("button.vs-membre-jet")) {
        const acteur = fromUuidSync(jet.closest("[data-uuid]")?.dataset.uuid ?? "");
        jet.disabled = !acteur?.isOwner;
      }
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

  /**
   * @override — arme → armement (toujours portée) ; aménagement → aménagements ; équipement / armure → soute. Un objet
   * venu d'un autre acteur (membre, équipage…) est déplacé ; depuis un compendium ou le monde, il est copié.
   */
  async _onDropItem(event, item) {
    if (!this.isEditable || !item) return null;
    if (item.type !== "arme" && item.type !== "amenagement" && !TYPES_SOUTE.includes(item.type)) {
      ui.notifications.warn(game.i18n.localize("GALACTICWARS.Vaisseau.ObjetRefuse"));
      return null;
    }
    if (item.parent === this.actor) return null;
    if (item.parent instanceof Actor && item.type !== "amenagement") {
      const deplace = await deplacerObjet(item, this.actor);
      if (deplace?.type === "arme") await deplace.update({ "system.porte": true });
      return deplace;
    }
    const donnees = item.toObject();
    delete donnees._id;
    if (item.type === "arme") donnees.system.porte = true;
    else if ("porte" in (donnees.system ?? {})) donnees.system.porte = false;
    const [cree] = await this.actor.createEmbeddedDocuments("Item", [donnees]);
    if (cree?.type === "amenagement") this.#avertirModules();
    return cree ?? null;
  }

  /** Avertit quand les aménagements dépassent les modules disponibles (l'ajout reste permis : le MJ tranche). */
  #avertirModules() {
    const utilises = modulesUtilises(this.actor);
    const max = this.actor.system.modules ?? 0;
    if (utilises > max) {
      ui.notifications.warn(game.i18n.format("GALACTICWARS.Amenagement.Depassement", { utilises, max, nom: this.actor.name }));
    }
  }

  /**
   * @override — un acteur (personnage, PNJ…) déposé sur un poste d'équipage occupe la place visée, sinon la première
   * place libre du poste ; possible hors mode Édition.
   */
  async _onDropActor(event, actor) {
    if (!actor || !this.isEditable) return null;
    const t = (cle, donnees) => game.i18n.format(`GALACTICWARS.Vaisseau.${cle}`, donnees);
    if (actor.type === "vaisseau") return null;
    if (actor.type === "equipage" || actor.pack) {
      ui.notifications.warn(t(actor.pack ? "PosteActeurCompendium" : "PosteEquipage", { nom: actor.name }));
      return null;
    }
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
    for (const p of equipage) for (let i = 0; i < p.places; i++) { p.noms[i] ??= ""; p.uuids[i] ??= ""; }
    // Place d'origine : celle d'où la carte a été glissée sur cette fiche, sinon la place où l'acteur est déjà assis.
    let origine = null;
    let origineAilleurs = null;
    try {
      const donnees = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
      if (donnees?.gwSiege?.vaisseau === this.actor.uuid) origine = donnees.gwSiege;
      else if (donnees?.gwSiege?.vaisseau) origineAilleurs = donnees.gwSiege;
    } catch { /* dépôt simulé ou sans données */ }
    if (!origine) {
      equipage.forEach((p, i) => p.uuids.forEach((u, s) => { if (u === actor.uuid && !origine) origine = { index: i, siege: s }; }));
    }
    if (origine && origine.index === index && origine.siege === siege) return null;
    // Occupant de la place visée : échangé vers la place d'origine si l'acteur vient d'une autre place.
    const occupant = { nom: poste.noms[siege], uuid: poste.uuids[siege] };
    if (origine) {
      const depart = equipage[origine.index];
      depart.noms[origine.siege] = origine && (occupant.uuid || occupant.nom) ? occupant.nom : "";
      depart.uuids[origine.siege] = occupant.uuid || "";
    }
    poste.noms[siege] = actor.name;
    poste.uuids[siege] = actor.uuid;
    await this.actor.update({ "system.equipage": equipage });
    if (origineAilleurs) await this.#libererSiege(origineAilleurs, actor);
    return actor;
  }

  /**
   * Siège quitté sur un autre vaisseau (glisser-déposer d'une fiche à l'autre) : vidé, tableau complet réécrit, si
   * l'utilisateur peut modifier ce vaisseau et que le siège porte toujours cet acteur ; sinon un avertissement.
   */
  async #libererSiege({ vaisseau: uuid, index, siege }, actor) {
    const source = await fromUuid(uuid);
    if (!source || source.type !== "vaisseau") return;
    const equipage = source.system.toObject().equipage;
    if (equipage[index]?.uuids?.[siege] !== actor.uuid) return;
    if (!source.isOwner) {
      ui.notifications.warn(game.i18n.format("GALACTICWARS.Vaisseau.SiegeNonLibere", { nom: actor.name, vaisseau: source.name }));
      return;
    }
    equipage[index].uuids[siege] = "";
    equipage[index].noms[siege] = "";
    await source.update({ "system.equipage": equipage });
  }

  /** Jet de la compétence du poste par l'acteur assis à cette place (sa propre compétence et son taux). */
  static async #onJetPoste(event, target) {
    event.stopPropagation();
    const index = Number(target.closest(".vs-poste[data-index]")?.dataset.index);
    const poste = this.actor.system.equipage[index];
    const acteur = await fromUuid(target.closest("[data-uuid]")?.dataset.uuid);
    const cle = competencePoste(poste);
    if (!acteur || !cle) return;
    if (!acteur.isOwner && !game.user.isGM) {
      return ui.notifications.warn(game.i18n.format("GALACTICWARS.Vaisseau.JetInterdit", { nom: acteur.name }));
    }
    return rollCompetence(acteur, cle, { titre: `${poste.role} — ${this.actor.name}` });
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

  /** Nouvel aménagement vierge (1 module) : sa fiche s'ouvre pour le compléter. */
  static async #onAjouterAmenagement() {
    const [a] = await this.actor.createEmbeddedDocuments("Item", [{
      name: game.i18n.localize("GALACTICWARS.Amenagement.Nouveau"), type: "amenagement", img: IMAGE_AMENAGEMENT,
      system: { modules: 1 }
    }]);
    a?.sheet.render({ force: true });
    this.#avertirModules();
  }

  #objetDeLigne(target) {
    return this.actor.items.get(target.closest("[data-item-id]")?.dataset.itemId);
  }

  static async #onEditerAmenagement(event, target) {
    event.stopPropagation();
    this.#objetDeLigne(target)?.sheet.render({ force: true });
  }

  static async #onSupprimerAmenagement(event, target) {
    event.stopPropagation();
    const objet = this.#objetDeLigne(target);
    if (objet && (await this.#confirmerSuppression(objet.name))) await objet.delete();
  }

  static async #onAfficherObjet(event, target) {
    await this.#objetDeLigne(target)?.afficherDansTchat?.();
  }

  static async #onConvertirAmenagements() {
    const nombre = await convertirAmenagements(this.actor);
    if (nombre) ui.notifications.info(game.i18n.format("GALACTICWARS.Amenagement.Converti", { nombre }));
  }

  static async #onOuvrirObjetSoute(event, target) {
    event.stopPropagation();
    this.#objetDeLigne(target)?.sheet.render({ force: true });
  }

  static async #onSupprimerObjetSoute(event, target) {
    event.stopPropagation();
    const objet = this.#objetDeLigne(target);
    if (objet && (await this.#confirmerSuppression(objet.name))) await objet.delete();
  }

  static async #onDonnerObjetSoute(event, target) {
    event.stopPropagation();
    const objet = this.#objetDeLigne(target);
    const select = target.closest("[data-item-id]")?.querySelector("select[data-destinataire]");
    const destinataire = select?.value ? await fromUuid(select.value) : null;
    if (!objet || !destinataire) return ui.notifications.warn(game.i18n.localize("GALACTICWARS.Equipage.ChoisirDestinataire"));
    const cree = await deplacerObjet(objet, destinataire);
    if (cree) ui.notifications.info(game.i18n.format("GALACTICWARS.Equipage.ObjetDonne", { objet: cree.name, nom: destinataire.name }));
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
        <label>${t("CompetencePoste")}<select name="competence">
          <option value="">${t("CompetenceAuto")}</option>
          ${Object.entries(GW.competences)
            .map(([cle, c]) => ({ cle, label: game.i18n.localize(c.label) }))
            .sort((a, b) => a.label.localeCompare(b.label))
            .map(({ cle, label }) => `<option value="${cle}" ${poste?.competence === cle ? "selected" : ""}>${label}</option>`).join("")}
        </select></label>
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
      competence: GW.competences[saisie.competence] ? saisie.competence : "",
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
