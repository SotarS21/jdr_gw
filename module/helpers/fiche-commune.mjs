import { GW } from "../config.mjs";
import { vaisseauDEquipage } from "./equipage.mjs";

/**
 * Parties communes aux fiches classique et rapide / PNJ (v0.26.0) : onglet Équipements (inventaire, vaisseau lié),
 * onglet Notes (résumés, infos, PNJ, missions), recherche, menu clic droit de l'inventaire. Les gabarits associés
 * sont dans templates/actor/parts/ (chargés à l'initialisation, voir PARTIELS_FICHE).
 */

export const PARTIELS_FICHE = {
  gwLigneObjet: "systems/galactic-wars/templates/actor/parts/ligne-objet.hbs",
  gwPanneauVaisseau: "systems/galactic-wars/templates/actor/parts/vaisseau.hbs",
  gwOngletNotes: "systems/galactic-wars/templates/actor/parts/notes.hbs"
};

/**
 * Onglet Équipements : lignes d'inventaire (armes, armures/boucliers, équipement) triées
 * par nom, avec badges et valeur clé, et réduction totale des seules armures PORTÉES.
 */
export function preparerInventaire(actor) {
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
      valeur
      // Plus d'attaque rapide sur la ligne (demande de l'auteur) : l'attaque passe par la carte de tchat.
    };
  };
  const objets = (type) => actor.items.filter((i) => i.type === type).sort(parNom);
  const armures = objets("armure");
  return {
    armes: objets("arme").map((i) => ligne(i, i.system.degats)),
    armures: armures.map((i) => ligne(i, `+${i.system.reduction ?? 0}`)),
    equipements: objets("equipement").map((i) => ligne(i, `×${i.system.quantite ?? 0}`)),
    reductionTotale: armures.filter((i) => i.system.porte).reduce((s, i) => s + (i.system.reduction ?? 0), 0)
  };
}

/**
 * Onglet Équipements : vaisseau lié (system.vaisseau), ou à défaut celui de l'équipage dont le personnage est
 * membre. Sans le droit Observateur sur le vaisseau, seuls son nom et son image sont montrés (comme le droit
 * Limité de Foundry). Renvoie null sans vaisseau.
 */
export function preparerVaisseau(actor) {
  const system = actor.system;
  const uuid = system.vaisseau?.uuid;
  const viaEquipage = uuid ? null : vaisseauDEquipage(actor);
  if (!uuid && !viaEquipage) return null;
  const vaisseau = viaEquipage?.vaisseau ?? fromUuidSync(uuid);
  if (!vaisseau) return { manquant: true, nom: system.vaisseau.nom };
  const s = vaisseau.system;
  const portraitParDefaut = !s.portrait || s.portrait === "icons/svg/mystery-man.svg";
  return {
    nom: vaisseau.name,
    img: portraitParDefaut ? vaisseau.img : s.portrait,
    classe: s.classe,
    accessible: vaisseau.testUserPermission(game.user, "OBSERVER"),
    coque: `${s.pv.actuels} / ${s.pv.max}`,
    bouclierActif: s.bouclier.actif,
    bouclier: s.bouclier.points,
    uuid: vaisseau.uuid,
    equipage: viaEquipage?.equipage.name ?? null
  };
}

/** Données d'affichage de l'onglet Notes (listes enrichies, libellés de statut). */
export async function preparerNotes(actor) {
  const system = actor.system;
  const enrichir = (html) =>
    foundry.applications.ux.TextEditor.implementation.enrichHTML(html ?? "", { relativeTo: actor });
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

/** Barres de recherche des PNJ et des missions : filtre les cartes à la frappe (nom, sous-titre, statut, texte),
 *  sans tenir compte des accents ni de la casse ; `recherche` garde la saisie entre deux rendus. Aucun champ
 *  `name` : rien n'est soumis au formulaire. */
export function activerRecherche(element, recherche) {
  // Ligatures œ / æ (« sœur ») : NFD ne les décompose pas, elles se comparent comme « oe » / « ae ».
  const normaliser = (texte) => String(texte ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/œ/g, "oe").replace(/æ/g, "ae").trim();
  for (const champ of element.querySelectorAll(".recherche-notes")) {
    const section = champ.closest("section");
    const filtrer = () => {
      const requete = normaliser(champ.value);
      recherche[champ.dataset.liste] = champ.value;
      const cartes = [...section.querySelectorAll(".carte-note")];
      for (const carte of cartes) carte.hidden = !!requete && !normaliser(carte.textContent).includes(requete);
      const vide = section.querySelector(".recherche-vide");
      if (vide) vide.hidden = !cartes.length || cartes.some((c) => !c.hidden);
    };
    champ.addEventListener("input", filtrer);
    champ.addEventListener("change", (e) => e.stopPropagation());
    champ.addEventListener("click", (e) => e.stopPropagation());
    filtrer();
  }
}

/** Lignes d'inventaire (role="button") : Entrée / Espace = même effet que le clic. */
export function activerInventaire(element, actor) {
  for (const ligne of element.querySelectorAll(".inventaire-ligne[data-item-id]")) {
    ligne.addEventListener("keydown", (e) => {
      if (e.target !== ligne || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      activerObjet(actor.items.get(ligne.dataset.itemId));
    });
  }
}

/**
 * Action principale d'une ligne d'inventaire : un Datapad ou un Comlink s'ouvre sur son onglet Holonet /
 * Comlink (bug remonté par l'auteur, ils partaient dans le tchat) ; les autres objets vont dans le tchat
 * (le menu clic droit garde « Montrer dans le tchat » pour tous).
 */
export async function activerObjet(item) {
  if (!item) return;
  const appareil = item.type === "equipement" ? item.system.appareil : "";
  if (appareil === "datapad" && item.sheet.ouvrirHolonet) return item.sheet.ouvrirHolonet();
  if (appareil === "comlink" && item.sheet.ouvrirComlink) return item.sheet.ouvrirComlink();
  return item.afficherDansTchat();
}

/** Suppression d'un objet d'inventaire après confirmation (menu contextuel, corbeille de la ligne en Édition). */
export async function supprimerObjetConfirme(item) {
  if (!item) return;
  const confirme = await foundry.applications.api.DialogV2.confirm({
    window: { title: game.i18n.localize("GALACTICWARS.Objet.SupprimerObjet"), icon: "fa-solid fa-trash" },
    content: `<p>${game.i18n.format("GALACTICWARS.Objet.SupprimerConfirmation", { nom: foundry.utils.escapeHTML(item.name) })}</p>`,
    yes: { label: game.i18n.localize("GALACTICWARS.Objet.Supprimer"), icon: "fa-solid fa-trash" },
    no: { default: true }
  });
  if (confirme) await item.delete();
}

/**
 * Clic droit sur une ligne d'inventaire (onglet Équipements) : porter/ranger, tags (Caché…), tchat, fiche,
 * suppression. Limité à .inventaire-ligne : les pouvoirs, aussi en .objet-row, n'ont ni porté ni tags.
 * À appeler depuis _onFirstRender.
 */
export function menuInventaire(sheet) {
  const objet = (li) => sheet.actor.items.get(li.dataset.itemId);
  const editable = () => sheet.isEditable;
  new foundry.applications.ux.ContextMenu.implementation(sheet.element, ".inventaire-ligne[data-item-id]", [
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
      onClick: (event, li) => supprimerObjetConfirme(objet(li))
    }
  ], { jQuery: false, fixed: true });
}
