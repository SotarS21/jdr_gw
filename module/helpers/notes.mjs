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
export const LISTES_NOTES = { info: "notes", pnj: "pnjs", mission: "missions" };

const echapper = (texte) => foundry.utils.escapeHTML(String(texte ?? ""));

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
    case "info":
      return champTexte("titre", t("Titre"), entree.titre, { autofocus: true })
        + champTexte("motsCles", t("MotsCles"), (entree.motsCles ?? []).join(", "), { placeholder: t("MotsClesPlaceholder") })
        + champRiche("contenu", t("Contenu"), entree.contenu);
    case "pnj":
      return champTexte("nom", t("Nom"), entree.nom, { autofocus: true })
        + champTexte("sousTitre", t("SousTitre"), entree.sousTitre)
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
  if (type === "info") {
    const motsCles = [...new Set(String(donnees.motsCles ?? "").split(",").map((m) => m.trim()).filter(Boolean))];
    return { titre: donnees.titre ?? "", contenu: donnees.contenu ?? "", motsCles };
  }
  if (type === "pnj") {
    return { nom: donnees.nom ?? "", sousTitre: donnees.sousTitre ?? "", description: donnees.description ?? "", statut: donnees.statut };
  }
  return { titre: donnees.titre ?? "", description: donnees.description ?? "", importance: donnees.importance, statut: donnees.statut };
}

/**
 * Ouvre la fenêtre d'édition d'une entrée. `index` absent = nouvelle entrée.
 * @param {Actor} actor
 * @param {"info"|"pnj"|"mission"} type
 * @param {number} [index]
 */
export async function editerEntreeNote(actor, type, index) {
  const champ = LISTES_NOTES[type];
  const liste = actor.system.toObject()[champ] ?? [];
  const existante = Number.isInteger(index) ? liste[index] : null;
  if (Number.isInteger(index) && !existante) return;

  const cleTitre = existante ? "ModifierEntree" : "NouvelleEntree";
  const donnees = await foundry.applications.api.DialogV2.input({
    window: {
      title: game.i18n.format(`GALACTICWARS.Notes.${cleTitre}`, { type: game.i18n.localize(`GALACTICWARS.Notes.Type.${type}`) })
    },
    classes: ["galactic-wars", "galactic-wars-note-dialog"],
    position: { width: 560 },
    content: formulaire(type, existante ?? {}),
    ok: { label: game.i18n.localize("GALACTICWARS.Notes.Enregistrer"), icon: "fa-solid fa-floppy-disk" }
  });
  if (!donnees) return;

  const entree = normaliser(type, donnees);
  const nouvelleListe = [...liste];
  if (existante) nouvelleListe[index] = entree;
  else nouvelleListe.push(entree);
  await actor.update({ [`system.${champ}`]: nouvelleListe });
}

/**
 * Supprime une entrée après confirmation.
 * @param {Actor} actor
 * @param {"info"|"pnj"|"mission"} type
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
  await actor.update({ [`system.${champ}`]: liste.filter((_, i) => i !== index) });
}
