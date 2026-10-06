import { GW } from "../config.mjs";

/**
 * Onglet Notes de la fiche classique : création / modification / suppression d'une entrée
 * (Info, PNJ, Mission) dans une fenêtre modale.
 *
 * Les listes (`system.notes`, `system.pnjs`, `system.missions`) sont des ArrayField : elles
 * ne sont jamais soumises par le formulaire de la fiche (aucun input ne les cible) et sont
 * toujours mises à jour en remplaçant le tableau complet — jamais par un update sur un seul
 * index, qui peut corrompre le tableau (voir JOURNAL.md).
 */

/** Type d'entrée -> champ du système. */
export const LISTES_NOTES = { resume: "resumes", info: "notes", pnj: "pnjs", mission: "missions" };

const echapper = (texte) => foundry.utils.escapeHTML(String(texte ?? ""));

/** Fenêtres d'édition ouvertes, par Actor + type + index : une seule fenêtre par entrée. */
const fenetresOuvertes = new Map();

/** Ramène une fenêtre déjà ouverte au premier plan et y place le focus. */
function focaliser(dialogue) {
  if (dialogue.minimized) dialogue.maximize();
  dialogue.bringToFront();
  dialogue.element?.querySelector("input, select, [contenteditable=true]")?.focus();
}

function champTexte(nom, libelle, valeur, { autofocus = false, placeholder = "" } = {}) {
  return `<div class="form-group">
    <label>${libelle}</label>
    <input type="text" name="${nom}" value="${echapper(valeur)}" placeholder="${echapper(placeholder)}" ${autofocus ? "autofocus" : ""}>
  </div>`;
}

function champSelect(nom, libelle, choix, valeur) {
  const options = Object.entries(choix)
    .map(([cle, label]) => `<option value="${cle}" ${cle === valeur ? "selected" : ""}>${game.i18n.localize(label)}</option>`)
    .join("");
  return `<div class="form-group"><label>${libelle}</label><select name="${nom}">${options}</select></div>`;
}

function champImage(nom, libelle, valeur) {
  return `<div class="form-group">
    <label>${libelle}</label>
    <file-picker name="${nom}" type="image" value="${echapper(valeur)}"></file-picker>
  </div>`;
}

function champRiche(nom, libelle, valeur) {
  return `<div class="form-group stacked">
    <label>${libelle}</label>
    <prose-mirror name="${nom}" value="${echapper(valeur)}"></prose-mirror>
  </div>`;
}

/** Contenu HTML du formulaire modal pour un type d'entrée. */
function formulaire(type, entree) {
  const t = (cle) => game.i18n.localize(`GALACTICWARS.Notes.${cle}`);
  switch (type) {
    case "resume":
      return champTexte("titre", t("Titre"), entree.titre, { autofocus: true })
        + champRiche("description", t("Description"), entree.description);
    case "info":
      return champTexte("titre", t("Titre"), entree.titre, { autofocus: true })
        + champTexte("motsCles", t("MotsCles"), (entree.motsCles ?? []).join(", "), { placeholder: t("MotsClesPlaceholder") })
        + champRiche("contenu", t("Contenu"), entree.contenu);
    case "pnj":
      return champTexte("nom", t("Nom"), entree.nom, { autofocus: true })
        + champTexte("sousTitre", t("SousTitre"), entree.sousTitre)
        + champImage("img", t("Image"), entree.img)
        + champSelect("statut", t("Statut"), GW.statutsPnj, entree.statut ?? "neutre")
        + champRiche("description", t("Description"), entree.description);
    case "mission":
      return champTexte("titre", t("Titre"), entree.titre, { autofocus: true })
        + champSelect("importance", t("ImportanceLabel"), GW.importancesMission, entree.importance ?? "secondaire")
        + champSelect("statut", t("Statut"), GW.statutsMission, entree.statut ?? "aFaire")
        + champRiche("description", t("Description"), entree.description);
    default:
      throw new Error(`Type d'entrée inconnu : ${type}`);
  }
}

/** Normalise les données renvoyées par le formulaire. */
function normaliser(type, donnees) {
  // Date automatique : création et chaque modification d'un résumé.
  if (type === "resume") return { titre: donnees.titre ?? "", description: donnees.description ?? "", date: Date.now() };
  if (type === "info") {
    const motsCles = [...new Set(String(donnees.motsCles ?? "").split(",").map((m) => m.trim()).filter(Boolean))];
    return { titre: donnees.titre ?? "", contenu: donnees.contenu ?? "", motsCles };
  }
  if (type === "pnj") {
    return {
      nom: donnees.nom ?? "", sousTitre: donnees.sousTitre ?? "", img: donnees.img ?? "",
      description: donnees.description ?? "", statut: donnees.statut
    };
  }
  return { titre: donnees.titre ?? "", description: donnees.description ?? "", importance: donnees.importance, statut: donnees.statut };
}

/**
 * Ouvre la fenêtre d'édition d'une entrée. `index` absent = nouvelle entrée.
 * @param {Actor} actor
 * @param {"resume"|"info"|"pnj"|"mission"} type
 * @param {number} [index]
 */
export async function editerEntreeNote(actor, type, index) {
  const champ = LISTES_NOTES[type];
  const liste = actor.system.toObject()[champ] ?? [];
  const existante = Number.isInteger(index) ? liste[index] : null;
  if (Number.isInteger(index) && !existante) return;

  // Clics répétés sur la même carte (ou le même « + ») : pas de seconde fenêtre.
  const cleFenetre = `${actor.uuid}|${type}|${existante ? index : "nouvelle"}`;
  const dejaOuverte = fenetresOuvertes.get(cleFenetre);
  // `true` = fenêtre en cours d'ouverture (double-clic rapide) : rien à faire.
  if (dejaOuverte) return dejaOuverte === true ? undefined : focaliser(dejaOuverte);
  fenetresOuvertes.set(cleFenetre, true);

  const cleTitre = existante ? "ModifierEntree" : "NouvelleEntree";
  const donnees = await foundry.applications.api.DialogV2.input({
    render: (event, dialogue) => fenetresOuvertes.set(cleFenetre, dialogue),
    window: {
      title: game.i18n.format(`GALACTICWARS.Notes.${cleTitre}`, { type: game.i18n.localize(`GALACTICWARS.Notes.Type.${type}`) })
    },
    classes: ["galactic-wars", "galactic-wars-note-dialog"],
    position: { width: 560 },
    content: formulaire(type, existante ?? {}),
    ok: { label: game.i18n.localize("GALACTICWARS.Notes.Enregistrer"), icon: "fa-solid fa-floppy-disk" }
  }).finally(() => fenetresOuvertes.delete(cleFenetre));
  if (!donnees) return;

  const entree = normaliser(type, donnees);
  // Lien vers l'acteur d'un PNJ déposé : conservé à la modification (la fenêtre ne l'affiche pas).
  if (type === "pnj" && existante?.acteurUuid) entree.acteurUuid = existante.acteurUuid;
  // Liste relue APRÈS la fenêtre : une autre fenêtre (fiche, Holonet) a pu enregistrer entre-temps — on ne
  // remplace que l'entrée éditée, retrouvée telle qu'elle était à l'ouverture.
  const nouvelleListe = actor.system.toObject()[champ] ?? [];
  if (existante) {
    const position = positionEntree(nouvelleListe, existante, index);
    if (position < 0) {
      ui.notifications.warn(game.i18n.localize("GALACTICWARS.Notes.EntreeModifieeEntreTemps"));
      nouvelleListe.push(entree);
    } else nouvelleListe[position] = entree;
  } else nouvelleListe.push(entree);
  await actor.update({ [`system.${champ}`]: nouvelleListe });
}

/** Position actuelle d'une entrée lue plus tôt (même contenu) : son ancien index d'abord, sinon recherche. -1 si disparue. */
function positionEntree(liste, entree, indexInitial) {
  if (foundry.utils.objectsEqual(liste[indexInitial] ?? {}, entree)) return indexInitial;
  return liste.findIndex((e) => foundry.utils.objectsEqual(e, entree));
}

/**
 * Supprime une entrée après confirmation.
 * @param {Actor} actor
 * @param {"resume"|"info"|"pnj"|"mission"} type
 * @param {number} index
 */
export async function supprimerEntreeNote(actor, type, index) {
  const champ = LISTES_NOTES[type];
  const liste = actor.system.toObject()[champ] ?? [];
  if (!liste[index]) return;
  const confirme = await foundry.applications.api.DialogV2.confirm({
    window: { title: game.i18n.localize("GALACTICWARS.Notes.Supprimer") },
    content: `<p>${game.i18n.localize("GALACTICWARS.Notes.SupprimerConfirmation")}</p>`
  });
  if (!confirme) return;
  // Relue après la confirmation (même raison que editerEntreeNote) : on retire l'entrée confirmée, pas un index décalé.
  const actuelle = actor.system.toObject()[champ] ?? [];
  const position = positionEntree(actuelle, liste[index], index);
  if (position < 0) return;
  await actor.update({ [`system.${champ}`]: actuelle.filter((_, i) => i !== position) });
}

/* ------------------------------------------------------------------------------------------ */
/* PNJ depuis un acteur (n° 9), notes montrées dans le tchat et glissées vers une fiche (n° 10). */
/* ------------------------------------------------------------------------------------------ */

/** Entrée PNJ tirée d'un acteur déposé sur la fiche (nom, image, métier / race / type, lien). */
export function pnjDepuisActeur(acteur) {
  const s = acteur.system ?? {};
  const sousTitre = [s.metier?.nom ?? s.ecole?.nom, s.race?.nom].filter(Boolean).join(" · ")
    || game.i18n.localize(`TYPES.Actor.${acteur.type}`);
  return { nom: acteur.name, sousTitre, img: acteur.img ?? "", description: "", statut: "neutre", acteurUuid: acteur.uuid };
}

/** Ajoute une entrée à une liste de notes (tableau complet réécrit). */
export async function ajouterEntreeNote(actor, type, entree) {
  const champ = LISTES_NOTES[type];
  if (!champ) return null;
  const liste = actor.system.toObject()[champ] ?? [];
  return actor.update({ [`system.${champ}`]: [...liste, entree] });
}

/** Contenu HTML d'une entrée, pour la carte de tchat. */
async function carteEntree(type, entree) {
  const t = (cle) => game.i18n.localize(`GALACTICWARS.Notes.${cle}`);
  const enrichir = (html) => foundry.applications.ux.TextEditor.implementation.enrichHTML(html ?? "");
  const titre = type === "pnj" ? entree.nom : entree.titre;
  let entete = "";
  if (type === "pnj") {
    entete = `${entree.sousTitre ? `<div class="gw-note-sous-titre">${echapper(entree.sousTitre)}</div>` : ""}
      <span class="pastille statut-${entree.statut}">${game.i18n.localize(GW.statutsPnj[entree.statut] ?? "")}</span>`;
  } else if (type === "mission") {
    entete = `<span class="pastille importance-${entree.importance}">${game.i18n.localize(GW.importancesMission[entree.importance] ?? "")}</span>
      <span class="pastille mission-${entree.statut}">${game.i18n.localize(GW.statutsMission[entree.statut] ?? "")}</span>`;
  } else if (type === "info" && entree.motsCles?.length) {
    entete = `<div class="mots-cles">${entree.motsCles.map((m) => `<span class="etiquette">${echapper(m)}</span>`).join("")}</div>`;
  }
  const texte = await enrichir(type === "info" ? entree.contenu : entree.description);
  return `<div class="gw-note-carte" data-type="${type}">
    <header>
      ${type === "pnj" && entree.img ? `<img src="${echapper(entree.img)}" alt="">` : ""}
      <div>
        <span class="gw-note-type">${t(`Type.${type}`)}</span>
        <strong>${echapper(titre)}</strong>
        ${entete}
      </div>
    </header>
    <div class="gw-note-texte">${texte}</div>
    <p class="gw-note-aide"><i class="fa-solid fa-hand-pointer"></i> ${t("GlisserVersFiche")}</p>
  </div>`;
}

/** Poste une entrée des Notes dans le tchat (carte glissable vers une autre fiche). */
export async function montrerEntreeNote(actor, type, index) {
  const champ = LISTES_NOTES[type];
  const entree = actor.system.toObject()[champ]?.[index];
  if (!entree) return null;
  const copie = foundry.utils.deepClone(entree);
  delete copie.origineMetier;
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: await carteEntree(type, copie),
    flags: { "galactic-wars": { note: { type, entree: copie } } }
  });
}

/** Données d'une note glissée depuis le tchat, prêtes à ajouter à une fiche (date d'un résumé renouvelée). */
export function entreeDepuisGlisser(note) {
  if (!note || !LISTES_NOTES[note.type]) return null;
  const entree = foundry.utils.deepClone(note.entree ?? {});
  delete entree.origineMetier;
  if (note.type === "resume") entree.date = Date.now();
  return entree;
}

/** À enregistrer au hook "init" : les cartes de note du tchat se glissent vers une fiche de personnage. */
export function enregistrerHooksNotes() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    const note = message.getFlag?.("galactic-wars", "note");
    const carte = html.querySelector(".gw-note-carte");
    if (!note || !carte) return;
    carte.draggable = true;
    carte.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", JSON.stringify({ type: "GalacticWarsNote", note }));
    });
  });
}
