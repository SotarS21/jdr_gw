import { GW } from "../config.mjs";
import { rollCompetence } from "../helpers/rolls.mjs";
import { applyRace } from "../helpers/race.mjs";
import { applyMetier } from "../helpers/metier.mjs";
import { choisirItemCompendium } from "../helpers/compendium-picker.mjs";
import { editerEntreeNote, supprimerEntreeNote } from "../helpers/notes.mjs";

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
      repos: PersonnageSheet.#onRepos,
      ajusterLumiere: PersonnageSheet.#onAjusterLumiere,
      ajusterObscurite: PersonnageSheet.#onAjusterObscurite,
      changerSousOnglet: PersonnageSheet.#onChangerSousOnglet,
      ajouterEntreeNote: PersonnageSheet.#onAjouterEntreeNote,
      editerEntreeNote: PersonnageSheet.#onEditerEntreeNote,
      supprimerEntreeNote: PersonnageSheet.#onSupprimerEntreeNote,
      ajouterTrait: PersonnageSheet.#onAjouterTrait,
      basculerFavori: PersonnageSheet.#onBasculerFavori,
      gainExperience: PersonnageSheet.#onGainExperience,
      gainNiveau: PersonnageSheet.#onGainNiveau,
      ouvrirObjet: PersonnageSheet.#onOuvrirObjet,
      afficherObjet: PersonnageSheet.#onAfficherObjet,
      basculerPorteObjet: PersonnageSheet.#onBasculerPorteObjet,
      attaquerObjet: PersonnageSheet.#onAttaquerObjet,
      degatsObjet: PersonnageSheet.#onDegatsObjet,
      lancerInitiative: PersonnageSheet.#onLancerInitiative,
      ouvrirHolonet: PersonnageSheet.#onOuvrirHolonet,
      ouvrirComlink: PersonnageSheet.#onOuvrirComlink
    }
  };

  static PARTS = {
    body: { template: "systems/galactic-wars/templates/actor/personnage-sheet.hbs", scrollable: [".sheet-body"] }
  };

  /** Onglet actif — état d'affichage pur, pas de persistance sur l'Actor (survit aux re-rendus
   *  puisque l'instance de sheet, elle, persiste entre deux rendus). */
  #ongletActif = "personnage";

  /** Sous-onglet actif de l'onglet Notes (résumé / infos / pnj / missions) — même principe. */
  #sousOngletNotes = "resume";

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
    context.sousOngletNotes = this.#sousOngletNotes;
    context.modeEdition = this.modeEdition;
    context.isGM = game.user.isGM;
    context.bonusAlignement = GW.bonusAlignement;
    // Barre de PV : vert > 50 %, orange de 25 à 50 %, rouge < 25 % (le PJ voit quand il est « dans le rouge »).
    const pvMax = system.pv.max || 0;
    const pourcentagePV = pvMax > 0 ? Math.round(Math.min(100, Math.max(0, (system.pv.value / pvMax) * 100))) : 0;
    context.barrePV = {
      pourcentage: pourcentagePV,
      etat: pourcentagePV > 50 ? "ok" : pourcentagePV >= 25 ? "blesse" : "critique"
    };
    // Somme des seules bases saisies (hors bonus raciaux), comparée à GW.pointsCaracteristiques :
    // indicateur coloré comme dans l'Excel (jaune en dessous, vert à l'égalité, rouge au-dessus).
    const pointsCaracteristiques = Object.values(system.caracteristiques).reduce((s, c) => s + (c.base ?? 0), 0);
    context.pointsCaracteristiques = {
      valeur: pointsCaracteristiques,
      attendu: GW.pointsCaracteristiques,
      etat: pointsCaracteristiques === GW.pointsCaracteristiques ? "ok"
        : pointsCaracteristiques < GW.pointsCaracteristiques ? "manque" : "exces"
    };
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
    context.favoris = competencesIndexees
      .filter((c) => c.favori)
      .sort((a, b) => game.i18n.localize(a.label).localeCompare(game.i18n.localize(b.label)));
    Object.assign(context, this.#preparerInventaire());
    context.pouvoirs = this.actor.items.filter((i) => i.type === "pouvoir");
    context.traits = this.actor.items.filter((i) => i.type === "talent").sort((a, b) => a.name.localeCompare(b.name));
    context.afficherTraits = context.traits.length > 0 || context.modeEdition;
    if (this.#ongletActif === "notes") Object.assign(context, await this.#preparerNotes(system));
    if (this.#ongletActif === "combat") context.combat = await this.#preparerCombat(competencesIndexees, context);
    if (this.#ongletActif === "informations") {
      context.ethnie = await this.#preparerEthnie(system);
      context.descriptionEnrichie = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        system.description ?? "", { relativeTo: this.actor }
      );
      context.champsIdentite = ["age", "taille", "sexe", "couleurCheveux", "couleurPeau", "couleurYeux"].map((cle) => ({
        cle, valeur: system.infos[cle], label: `GALACTICWARS.Notes.Identite.${cle}`
      }));
    }
    // Pips d'affichage pour les jauges Lumière/Obscurité (voir styles/galactic-wars.css) —
    // purement visuel, la valeur réelle reste system.lumiere/system.obscurite.
    context.pipsLumiere = Array.from({ length: 10 }, (_, i) => i < system.lumiere);
    context.pipsObscurite = Array.from({ length: 10 }, (_, i) => i < system.obscurite);
    context.equilibre = this.#preparerEquilibre(system.lumiere ?? 0, system.obscurite ?? 0);
    // Espace fine (U+2009, sécable) tous les 3 chiffres : autorise le retour à la ligne entre
    // deux groupes, contrairement à toLocaleString("fr") qui insère une espace insécable.
    context.creditsFormates = String(system.credits ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return context;
  }

  /** @override — au plafond (GW.plafondCompetence), l'ajustement ne peut que baisser : une hausse
   *  saisie au clavier (l'attribut max ne bloque que les flèches) est ramenée à la valeur actuelle. */
  _processFormData(event, form, formData) {
    const data = super._processFormData(event, form, formData);
    const soumises = data.system?.competences;
    if (soumises) {
      for (const [index, competence] of Object.entries(soumises)) {
        const actuelle = this.actor.system.competences[index];
        if (actuelle?.atteintPlafond && competence.ajustement > actuelle.ajustement) {
          competence.ajustement = actuelle.ajustement;
        }
      }
    }
    return data;
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.#activerCredits();
    this.#activerInventaire();
  }

  /** Lignes d'inventaire (role="button") : Entrée / Espace = même effet que le clic. */
  #activerInventaire() {
    for (const ligne of this.element.querySelectorAll(".inventaire-ligne[data-item-id]")) {
      ligne.addEventListener("keydown", (e) => {
        if (e.target !== ligne || (e.key !== "Enter" && e.key !== " ")) return;
        e.preventDefault();
        this.#activerObjet(this.actor.items.get(ligne.dataset.itemId));
      });
    }
  }

  /** Box Crédits : clic sur le texte formaté → saisie ; sortie sans changement → retour au texte
   *  (un changement, lui, déclenche submitOnChange puis un re-rendu). */
  #activerCredits() {
    const affichage = this.element.querySelector(".stat-credits .credits-affichage");
    const saisie = this.element.querySelector(".stat-credits .credits-saisie");
    if (!affichage || !saisie) return;
    const basculer = (enSaisie) => {
      affichage.hidden = enSaisie;
      saisie.hidden = !enSaisie;
      if (enSaisie) { saisie.focus(); saisie.select(); }
      else this.#ajusterPoliceCredits(affichage);
    };
    affichage.addEventListener("click", () => basculer(true));
    affichage.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); basculer(true); } });
    saisie.addEventListener("blur", () => basculer(false));
    saisie.addEventListener("keydown", (e) => { if (e.key === "Enter") saisie.blur(); });
    this.#ajusterPoliceCredits(affichage);
  }

  /** Réduit la police jusqu'à ce que le nombre tienne (2 lignes max) dans la box. */
  #ajusterPoliceCredits(el) {
    el.style.fontSize = "";
    let taille = parseFloat(getComputedStyle(el).fontSize);
    const tailleMin = 8;
    const hauteurMax = () => parseFloat(getComputedStyle(el).lineHeight) * 2 + 1;
    while (taille > tailleMin && (el.scrollHeight > hauteurMax() || el.scrollWidth > el.clientWidth)) {
      taille -= 0.5;
      el.style.fontSize = `${taille}px`;
    }
  }

  /** Jauge Lumière/Obscurité : position du curseur (0 % = tout Lumière, 100 % = tout Obscurité),
   *  part de rouge dans la teinte de la carte, intensité (réserve la plus haute / 10) et tendance. */
  #preparerEquilibre(lumiere, obscurite) {
    const total = lumiere + obscurite;
    const ecart = obscurite - lumiere;
    const tendance = ecart === 0 ? "neutre"
      : Math.abs(ecart) >= 4 ? (ecart > 0 ? "obscurite-dominante" : "lumiere-dominante")
      : (ecart > 0 ? "penche-obscurite" : "penche-lumiere");
    return {
      curseur: 50 + ecart * 5,
      rouge: total ? Math.round((obscurite / total) * 100) : 50,
      intensite: total ? (Math.max(lumiere, obscurite) / 10).toFixed(2) : 0,
      cote: total === 0 ? "vide" : ecart > 0 ? "obscurite" : ecart < 0 ? "lumiere" : "neutre",
      tendance: `GALACTICWARS.Alignement.Tendance.${tendance}`
    };
  }

  /**
   * Onglet Équipements : lignes d'inventaire (armes, armures/boucliers, équipement) triées
   * par nom, avec badges et valeur clé, et réduction totale des seules armures PORTÉES.
   */
  #preparerInventaire() {
    const parNom = (a, b) => a.name.localeCompare(b.name, game.i18n.lang);
    const ligne = (item, valeur) => {
      const system = item.system;
      const badges = [];
      for (const [cle, tag] of Object.entries(GW.tagsObjet)) {
        if (system.tags?.[cle]) badges.push({ cle, label: tag.label, icone: tag.icone, hint: `GALACTICWARS.Tags.${cle}Hint` });
      }
      if (item.type === "armure" && system.emplacement === "bouclier") {
        badges.push({ cle: "bouclier", label: "GALACTICWARS.Objet.Emplacement.bouclier", icone: "fa-solid fa-shield-halved" });
      }
      if (item.type === "arme" && system.instable) {
        badges.push({ cle: "instable", label: "GALACTICWARS.Objet.Instable", icone: "fa-solid fa-bolt" });
      }
      return {
        id: item.id,
        name: item.name,
        img: item.img,
        porte: !!system.porte,
        cache: !!system.tags?.cache,
        badges,
        valeur,
        // Attaque rapide : arme portée ET dotée d'une compétence (sinon attaquer() refuserait).
        attaqueRapide: item.type === "arme" && !!system.porte && !!system.competence,
        datapad: item.type === "equipement" && system.appareil === "datapad",
        comlink: item.type === "equipement" && system.appareil === "comlink"
      };
    };
    const objets = (type) => this.actor.items.filter((i) => i.type === type).sort(parNom);

    const armures = objets("armure");
    return {
      armes: objets("arme").map((i) => ligne(i, i.system.degats)),
      armures: armures.map((i) => ligne(i, `+${i.system.reduction ?? 0}`)),
      equipements: objets("equipement").map((i) => ligne(i, `×${i.system.quantite ?? 0}`)),
      reductionTotale: armures.filter((i) => i.system.porte).reduce((s, i) => s + (i.system.reduction ?? 0), 0)
    };
  }

  /**
   * Onglet Combat : armes et protections portées (lignes de l'inventaire), réduction totale
   * (armures + armure naturelle de l'ethnie), compétences de combat et, pour un personnage
   * sensible à la Force, ses compétences liées à la Force accessibles (non bloquées).
   */
  async #preparerCombat(competencesIndexees, context) {
    const parLibelle = (a, b) => game.i18n.localize(a.label).localeCompare(game.i18n.localize(b.label));
    const accessibles = competencesIndexees.filter((c) => !c.bloquee);
    const reduction = await this.actor.reductionDegats();
    return {
      // Onglet Combat (demande de l'auteur) : pas de bouton d'attaque sur la ligne (l'attaque passe par la
      // carte de tchat, au clic sur l'arme) ; valeur libellée « Dégâts ».
      armes: context.armes.filter((l) => l.porte)
        .map((l) => ({ ...l, attaqueRapide: false, degatsRapide: true, libelleValeur: "GALACTICWARS.Objet.Degats" })),
      armures: context.armures.filter((l) => l.porte),
      reduction,
      competences: GW.competencesCombat
        .map((cle) => accessibles.find((c) => c.cle === cle))
        .filter(Boolean),
      competencesForce: this.actor.system.sensibleForce
        ? accessibles.filter((c) => c.estCompetenceForce).sort(parLibelle)
        : [],
      enCombat: !!game.combat?.combatants.some((c) => c.actor === this.actor || c.actorId === this.actor.id)
    };
  }

  /** Données d'affichage de l'onglet Notes (listes enrichies, libellés de statut). */
  async #preparerNotes(system) {
    const enrichir = (html) =>
      foundry.applications.ux.TextEditor.implementation.enrichHTML(html ?? "", { relativeTo: this.actor });
    const libelle = (table, cle) => game.i18n.localize(table[cle] ?? cle);
    return {
      // Plus récent en premier ; `index` garde la position réelle dans le tableau.
      resumes: (await Promise.all(system.resumes.map(async (resume, index) => ({
        ...resume, index,
        dateLabel: resume.date
          ? new Date(resume.date).toLocaleString(game.i18n.lang, { dateStyle: "short", timeStyle: "short" })
          : "",
        descriptionEnrichie: await enrichir(resume.description)
      })))).sort((a, b) => b.date - a.date),
      infos: await Promise.all(system.notes.map(async (note, index) => ({
        ...note, index, contenuEnrichi: await enrichir(note.contenu)
      }))),
      pnjs: await Promise.all(system.pnjs.map(async (pnj, index) => ({
        ...pnj, index, statutLabel: libelle(GW.statutsPnj, pnj.statut), descriptionEnrichie: await enrichir(pnj.description)
      }))),
      missions: await Promise.all(system.missions.map(async (mission, index) => ({
        ...mission, index,
        statutLabel: libelle(GW.statutsMission, mission.statut),
        importanceLabel: libelle(GW.importancesMission, mission.importance),
        descriptionEnrichie: await enrichir(mission.description)
      })))
    };
  }

  /** Onglet Informations : ethnie liée (portrait, description, modificateurs, armure naturelle). */
  async #preparerEthnie(system) {
    const race = system.race?.uuid ? await fromUuid(system.race.uuid).catch(() => null) : null;
    if (race?.type !== "race") return { nom: system.race?.nom || "", trouvee: false };
    const signe = (v) => (v > 0 ? `+${v}` : `${v}`);
    return {
      trouvee: true,
      nom: race.name,
      img: race.img,
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(race.system.description ?? "", { relativeTo: race }),
      caracteristiques: Object.entries(race.system.modificateursCaracteristiques)
        .filter(([, v]) => v)
        .map(([cle, v]) => ({ label: game.i18n.localize(GW.caracteristiques[cle]), valeur: signe(v), sens: v > 0 ? "bonus" : "malus" })),
      competences: Object.entries(race.system.modificateursCompetences ?? {})
        .filter(([, v]) => v)
        .map(([cle, v]) => ({ label: game.i18n.localize(GW.competences[cle]?.label ?? cle), valeur: `${signe(v)} %`, sens: v > 0 ? "bonus" : "malus" })),
      armureNaturelle: race.system.armureNaturelle
    };
  }

  static async #onChangerSousOnglet(event, target) {
    this.#sousOngletNotes = target.dataset.sousOnglet;
    this.render();
  }

  static async #onAjouterEntreeNote(event, target) {
    await editerEntreeNote(this.actor, target.dataset.type);
  }

  static async #onEditerEntreeNote(event, target) {
    const carte = target.closest("[data-index]");
    await editerEntreeNote(this.actor, carte.dataset.type, Number(carte.dataset.index));
  }

  static async #onSupprimerEntreeNote(event, target) {
    event.stopPropagation();
    const carte = target.closest("[data-index]");
    await supprimerEntreeNote(this.actor, carte.dataset.type, Number(carte.dataset.index));
  }

  static async #onChangerOnglet(event, target) {
    this.#ongletActif = target.dataset.onglet;
    this.render();
  }

  /**
   * Menu clic droit (MJ uniquement) sur une compétence réservée que le métier actuel n'accorde
   * pas : débloquer / rebloquer pour ce personnage (champ `debloquee`).
   * @override
   */
  _onFirstRender(context, options) {
    super._onFirstRender(context, options);
    const competence = (li) => this.actor.system.competences[Number(li.dataset.index)];
    new foundry.applications.ux.ContextMenu.implementation(this.element, ".competence-row.reservee", [
      {
        label: "GALACTICWARS.Sheet.Debloquer",
        icon: '<i class="fa-solid fa-lock-open"></i>',
        visible: (li) => game.user.isGM && !!competence(li)?.bloquee,
        onClick: (event, li) => this.#definirDeblocage(Number(li.dataset.index), true)
      },
      {
        label: "GALACTICWARS.Sheet.Rebloquer",
        icon: '<i class="fa-solid fa-lock"></i>',
        visible: (li) => game.user.isGM && !!competence(li)?.debloquee && !competence(li)?.acquiseParMetier,
        onClick: (event, li) => this.#definirDeblocage(Number(li.dataset.index), false)
      }
    ], { jQuery: false, fixed: true });

    // Clic droit sur une ligne d'inventaire (onglet Équipements) : porter/ranger, tags
    // (Caché…), tchat, fiche, suppression. Limité à .inventaire-ligne : les pouvoirs, aussi en
    // .objet-row, n'ont ni porté ni tags.
    const objet = (li) => this.actor.items.get(li.dataset.itemId);
    const editable = () => this.isEditable;
    new foundry.applications.ux.ContextMenu.implementation(this.element, ".inventaire-ligne[data-item-id]", [
      {
        label: "GALACTICWARS.Objet.Porter",
        icon: '<i class="fa-solid fa-hand-fist"></i>',
        visible: (li) => editable() && objet(li)?.estObjetInventaire && !objet(li).system.porte,
        onClick: (event, li) => objet(li)?.basculerPorte()
      },
      {
        label: "GALACTICWARS.Objet.Ranger",
        icon: '<i class="fa-solid fa-box-archive"></i>',
        visible: (li) => editable() && objet(li)?.estObjetInventaire && !!objet(li).system.porte,
        onClick: (event, li) => objet(li)?.basculerPorte()
      },
      ...Object.entries(GW.tagsObjet).flatMap(([cle, tag]) => [
        {
          label: game.i18n.format("GALACTICWARS.Tags.Activer", { tag: game.i18n.localize(tag.label) }),
          icon: `<i class="${tag.icone}"></i>`,
          visible: (li) => editable() && objet(li)?.system.tags && !objet(li).system.tags[cle],
          onClick: (event, li) => objet(li)?.update({ [`system.tags.${cle}`]: true })
        },
        {
          label: game.i18n.format("GALACTICWARS.Tags.Desactiver", { tag: game.i18n.localize(tag.label) }),
          icon: `<i class="${tag.icone}"></i>`,
          visible: (li) => editable() && !!objet(li)?.system.tags?.[cle],
          onClick: (event, li) => objet(li)?.update({ [`system.tags.${cle}`]: false })
        }
      ]),
      {
        label: "GALACTICWARS.Objet.EnvoyerTchat",
        icon: '<i class="fa-solid fa-comment"></i>',
        onClick: (event, li) => objet(li)?.afficherDansTchat()
      },
      {
        label: "GALACTICWARS.Objet.Ouvrir",
        icon: '<i class="fa-solid fa-up-right-from-square"></i>',
        onClick: (event, li) => objet(li)?.sheet.render({ force: true })
      },
      {
        label: "GALACTICWARS.Objet.Supprimer",
        icon: '<i class="fa-solid fa-trash"></i>',
        visible: () => editable(),
        onClick: (event, li) => this.#supprimerObjet(objet(li))
      }
    ], { jQuery: false, fixed: true });
  }

  /** Suppression d'un objet d'inventaire après confirmation (plus de corbeille sur la ligne). */
  async #supprimerObjet(item) {
    if (!item) return;
    const confirme = await foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.localize("GALACTICWARS.Objet.Supprimer") },
      content: `<p>${game.i18n.format("GALACTICWARS.Objet.SupprimerConfirmation", { nom: foundry.utils.escapeHTML(item.name) })}</p>`
    });
    if (confirme) await item.delete();
  }

  /** Objet de la ligne d'inventaire contenant `target`. */
  #objetDeLigne(target) {
    return this.actor.items.get(target.closest("[data-item-id]")?.dataset.itemId);
  }

  /** Réserve Lumière/Obscurité choisie (boutons radio « bonusAlignement ») si elle n'est pas vide — aussi lue
   *  par GalacticWarsItem#attaquer quand l'attaque part de la carte de tchat, fiche ouverte. */
  reserveChoisie() {
    const choix = this.element.querySelector('input[name="bonusAlignement"]:checked')?.value;
    return (choix === "lumiere" || choix === "obscurite") && this.actor.system[choix] > 0 ? choix : null;
  }

  /** Clic sur une ligne d'inventaire : carte de l'objet dans le tchat. */
  static async #onAfficherObjet(event, target) {
    await this.#activerObjet(this.#objetDeLigne(target));
  }

  /**
   * Action principale d'une ligne d'inventaire : un Datapad ou un Comlink s'ouvre sur son onglet Holonet /
   * Comlink (bug remonté par l'auteur, ils partaient dans le tchat) ; les autres objets vont dans le tchat
   * (le menu clic droit garde « Montrer dans le tchat » pour tous).
   */
  async #activerObjet(item) {
    if (!item) return;
    const appareil = item.type === "equipement" ? item.system.appareil : "";
    if (appareil === "datapad" && item.sheet.ouvrirHolonet) return item.sheet.ouvrirHolonet();
    if (appareil === "comlink" && item.sheet.ouvrirComlink) return item.sheet.ouvrirComlink();
    return item.afficherDansTchat();
  }

  static async #onBasculerPorteObjet(event, target) {
    event.stopPropagation();
    if (!this.isEditable) return;
    await this.#objetDeLigne(target)?.basculerPorte();
  }

  /** Datapad : ouvre sa fiche directement sur l'onglet Holonet. */
  static async #onOuvrirHolonet(event, target) {
    event.stopPropagation();
    const item = this.#objetDeLigne(target);
    if (item?.sheet.ouvrirHolonet) await item.sheet.ouvrirHolonet();
    else item?.sheet.render({ force: true });
  }

  /** Comlink : ouvre sa fiche directement sur l'onglet Comlink. */
  static async #onOuvrirComlink(event, target) {
    event.stopPropagation();
    const item = this.#objetDeLigne(target);
    if (item?.sheet.ouvrirComlink) await item.sheet.ouvrirComlink();
    else item?.sheet.render({ force: true });
  }

  /** Attaque rapide : même réserve que #onRollCompetence, décrémentée par item.attaquer(). */
  static async #onAttaquerObjet(event, target) {
    event.stopPropagation();
    await this.#objetDeLigne(target)?.attaquer({ pool: this.reserveChoisie() });
  }

  /** Onglet Combat : jet de dégâts de l'arme de la ligne (carte de tchat avec « Appliquer » pour le MJ). */
  static async #onDegatsObjet(event, target) {
    event.stopPropagation();
    await this.#objetDeLigne(target)?.lancerDegats();
  }

  /** Initiative (1d20, CONFIG.Combat.initiative) dans le combat actif ; ajoute le personnage si besoin. */
  static async #onLancerInitiative() {
    if (!game.combat) {
      ui.notifications.warn(game.i18n.localize("GALACTICWARS.Combat.AucunCombat"));
      return;
    }
    await this.actor.rollInitiative({ createCombatants: true });
  }

  /** Mise à jour du tableau complet (jamais d'update sur un seul index d'ArrayField). */
  async #definirDeblocage(index, debloquee) {
    const competences = this.actor.system.toObject().competences;
    if (!competences[index]) return;
    competences[index].debloquee = debloquee;
    await this.actor.update({ "system.competences": competences });
  }

  /** Étoile d'une compétence : tableau complet réécrit (jamais un seul index d'ArrayField). */
  static async #onBasculerFavori(event, target) {
    event.stopPropagation();
    const index = Number(target.dataset.index);
    const competences = this.actor.system.toObject().competences;
    if (!competences[index]) return;
    competences[index].favori = !competences[index].favori;
    await this.actor.update({ "system.competences": competences });
  }

  /**
   * Gain d'expérience : passe la fiche en édition, puis propose +GW.gainExperience % sur une compétence
   * (ajouté à son ajustement), sans dépasser GW.plafondCompetence. Compétences bloquées ou déjà au
   * plafond exclues. Un message dans le tchat garde la trace du gain pour le MJ.
   */
  static async #onGainExperience() {
    if (!this.actor.isOwner) return;
    if (!this.modeEdition) {
      this.#modeEdition = true;
      await this.render();
    }
    const plafond = GW.plafondCompetence;
    const eligibles = this.actor.system.competences
      .map((c, index) => ({ c, index }))
      .filter(({ c }) => !c.bloquee && c.total < plafond)
      .map(({ c, index }) => {
        const gain = Math.min(GW.gainExperience, plafond - c.total);
        return { index, gain, label: game.i18n.localize(c.label), avant: c.total, apres: c.total + gain };
      })
      .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));
    if (!eligibles.length) return ui.notifications.info(game.i18n.localize("GALACTICWARS.Experience.AucuneEligible"));

    const options = eligibles
      .map((e) => `<option value="${e.index}">${foundry.utils.escapeHTML(e.label)} — ${e.avant} % → ${e.apres} %</option>`)
      .join("");
    const content = `<div class="galactic-wars-experience">
      <p>${game.i18n.format("GALACTICWARS.Experience.Texte", { gain: GW.gainExperience, plafond })}</p>
      <p class="hint">${game.i18n.format("GALACTICWARS.Experience.Note", { plafond })}</p>
      <div class="form-group"><label>${game.i18n.localize("GALACTICWARS.Experience.Competence")}</label>
        <select name="competence" autofocus>${options}</select></div>
    </div>`;
    const choix = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("GALACTICWARS.Experience.Titre"), icon: "fa-solid fa-arrow-trend-up" },
      position: { width: 480 },
      content,
      buttons: [
        { action: "ok", label: game.i18n.localize("GALACTICWARS.Experience.Appliquer"), icon: "fa-solid fa-check", default: true,
          callback: (event, button) => Number(button.form.elements.competence.value) },
        { action: "annuler", label: game.i18n.localize("GALACTICWARS.Experience.Annuler"), icon: "fa-solid fa-xmark" }
      ],
      rejectClose: false
    });
    const retenue = eligibles.find((e) => e.index === choix);
    if (!retenue) return;

    // Tableau complet réécrit (jamais un seul index d'ArrayField).
    const competences = this.actor.system.toObject().competences;
    competences[retenue.index].ajustement += retenue.gain;
    await this.actor.update({ "system.competences": competences });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: `<p><i class="fa-solid fa-arrow-trend-up"></i> ${game.i18n.format("GALACTICWARS.Experience.Message", {
        nom: foundry.utils.escapeHTML(this.actor.name), gain: retenue.gain,
        competence: foundry.utils.escapeHTML(retenue.label), avant: retenue.avant, apres: retenue.apres
      })}</p>`
    });
  }

  /**
   * Gain de niveau (mode Édition, demande de l'auteur) : +1 niveau sur trois compétences différentes
   * (non bloquées, niveau < 3) ; le niveau du personnage gagne aussi 1 (GW.gainNiveauPersonnage).
   */
  static async #onGainNiveau() {
    if (!this.actor.isOwner || !this.modeEdition) return;
    const max = GW.niveauMaxCompetence;
    const eligibles = this.actor.system.competences
      .map((c, index) => ({ c, index }))
      .filter(({ c }) => !c.bloquee && c.niveau < max)
      .map(({ c, index }) => ({ index, label: game.i18n.localize(c.label), niveau: c.niveau }))
      .sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));
    const nombre = Math.min(GW.competencesParNiveau, eligibles.length);
    if (!nombre) return ui.notifications.info(game.i18n.localize("GALACTICWARS.GainNiveau.AucuneEligible"));

    const options = [`<option value="">—</option>`, ...eligibles.map((e) =>
      `<option value="${e.index}">${foundry.utils.escapeHTML(e.label)} — ${e.niveau} → ${e.niveau + 1}</option>`)].join("");
    const selects = Array.from({ length: nombre }, (_, i) => `<div class="form-group">
        <label>${game.i18n.format("GALACTICWARS.GainNiveau.Choix", { numero: i + 1 })}</label>
        <select name="competence${i}" ${i === 0 ? "autofocus" : ""}>${options}</select></div>`).join("");
    const content = `<div class="galactic-wars-experience">
      <p>${game.i18n.format("GALACTICWARS.GainNiveau.Texte", { nombre, max })}</p>
      ${selects}
      ${GW.gainNiveauPersonnage ? `<p class="hint">${game.i18n.format("GALACTICWARS.GainNiveau.NiveauPersonnage", { avant: this.actor.system.niveau, apres: this.actor.system.niveau + 1 })}</p>` : ""}
    </div>`;
    const choix = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("GALACTICWARS.GainNiveau.Titre"), icon: "fa-solid fa-angles-up" },
      position: { width: 480 },
      content,
      buttons: [
        { action: "ok", label: game.i18n.localize("GALACTICWARS.Experience.Appliquer"), icon: "fa-solid fa-check", default: true,
          callback: (event, button) => Array.from({ length: nombre }, (_, i) => button.form.elements[`competence${i}`].value) },
        { action: "annuler", label: game.i18n.localize("GALACTICWARS.Experience.Annuler"), icon: "fa-solid fa-xmark" }
      ],
      rejectClose: false
    });
    if (!Array.isArray(choix)) return;
    const indices = choix.filter((v) => v !== "").map(Number);
    if (indices.length !== nombre || new Set(indices).size !== nombre) {
      return ui.notifications.warn(game.i18n.format("GALACTICWARS.GainNiveau.ChoixInvalide", { nombre }));
    }

    // Tableau complet réécrit (jamais un seul index d'ArrayField).
    const competences = this.actor.system.toObject().competences;
    for (const i of indices) competences[i].niveau = Math.min(max, competences[i].niveau + 1);
    const updates = { "system.competences": competences };
    if (GW.gainNiveauPersonnage) updates["system.niveau"] = this.actor.system.niveau + 1;
    await this.actor.update(updates);
    const noms = indices.map((i) => foundry.utils.escapeHTML(eligibles.find((e) => e.index === i).label)).join(", ");
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: `<p><i class="fa-solid fa-angles-up"></i> ${game.i18n.format("GALACTICWARS.GainNiveau.Message", {
        nom: foundry.utils.escapeHTML(this.actor.name), competences: noms, niveau: this.actor.system.niveau
      })}</p>`
    });
  }

  static async #onRepos() {
    await this.actor.update({ "system.pv.value": this.actor.system.pv.max });
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

  /** Ajout d'un trait depuis le compendium Talents (un glisser-déposer d'Item talent marche aussi). */
  static async #onAjouterTrait() {
    if (!this.modeEdition) return;
    const talent = await choisirItemCompendium("talents", { title: game.i18n.localize("GALACTICWARS.Traits.Ajouter") });
    if (!talent) return;
    if (this.actor.items.some((i) => i.type === "talent" && i.name === talent.name)) {
      return ui.notifications.warn(game.i18n.format("GALACTICWARS.Traits.DejaPresent", { nom: talent.name }));
    }
    const data = talent.toObject();
    delete data._id;
    foundry.utils.setProperty(data, "_stats.compendiumSource", talent.uuid);
    await this.actor.createEmbeddedDocuments("Item", [data]);
  }

  static async #onOuvrirObjet(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    this.actor.items.get(id)?.sheet.render({ force: true });
  }

  static async #onDeleteItem(event, target) {
    const li = target.closest("[data-item-id]");
    await this.actor.deleteEmbeddedDocuments("Item", [li.dataset.itemId]);
  }
}
