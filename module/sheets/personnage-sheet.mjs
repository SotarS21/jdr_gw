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
      supprimerEntreeNote: PersonnageSheet.#onSupprimerEntreeNote
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
    context.armes = this.actor.items.filter((i) => i.type === "arme");
    context.armures = this.actor.items.filter((i) => i.type === "armure");
    context.pouvoirs = this.actor.items.filter((i) => i.type === "pouvoir");
    context.equipements = this.actor.items.filter((i) => i.type === "equipement");
    if (this.#ongletActif === "notes") Object.assign(context, await this.#preparerNotes(system));
    if (this.#ongletActif === "informations") context.ethnie = await this.#preparerEthnie(system);
    // Pips d'affichage pour les jauges Lumière/Obscurité (voir styles/galactic-wars.css) —
    // purement visuel, la valeur réelle reste system.lumiere/system.obscurite.
    context.pipsLumiere = Array.from({ length: 10 }, (_, i) => i < system.lumiere);
    context.pipsObscurite = Array.from({ length: 10 }, (_, i) => i < system.obscurite);

    return context;
  }

  /** Données d'affichage de l'onglet Notes (listes enrichies, libellés de statut). */
  async #preparerNotes(system) {
    const enrichir = (html) =>
      foundry.applications.ux.TextEditor.implementation.enrichHTML(html ?? "", { relativeTo: this.actor });
    const libelle = (table, cle) => game.i18n.localize(table[cle] ?? cle);
    return {
      resumeEnrichi: await enrichir(system.resume),
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
        .map(([cle, v]) => ({ label: game.i18n.localize(GW.caracteristiques[cle]), valeur: signe(v) })),
      competences: Object.entries(race.system.modificateursCompetences ?? {})
        .filter(([, v]) => v)
        .map(([cle, v]) => ({ label: game.i18n.localize(GW.competences[cle]?.label ?? cle), valeur: `${signe(v)} %` })),
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
  }

  /** Mise à jour du tableau complet (jamais d'update sur un seul index d'ArrayField). */
  async #definirDeblocage(index, debloquee) {
    const competences = this.actor.system.toObject().competences;
    if (!competences[index]) return;
    competences[index].debloquee = debloquee;
    await this.actor.update({ "system.competences": competences });
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

  static async #onDeleteItem(event, target) {
    const li = target.closest("[data-item-id]");
    await this.actor.deleteEmbeddedDocuments("Item", [li.dataset.itemId]);
  }
}
