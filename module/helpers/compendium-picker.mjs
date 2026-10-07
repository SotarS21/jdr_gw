/**
 * Ouvre une fenêtre listant les entrées d'un compendium du système et retourne le
 * document choisi (ou `null` si l'utilisateur annule) — utilisé par les boutons
 * "Choisir" race/métier/école des fiches de personnage, qui n'avaient auparavant
 * aucun moyen de renseigner `system.race.uuid`/`system.metier.uuid`/`system.ecole.uuid`
 * (seul un glisser-déposer depuis la sidebar l'aurait permis, non implémenté).
 * @param {string} packName nom du compendium (ex. "races", "metiers"), sans le préfixe système.
 * @param {{title?: string, filtre?: Function, champs?: string[], libelle?: Function}} [options] `libelle` : texte de
 *   l'option pour une entrée de l'index (son nom par défaut).
 * @returns {Promise<Item|null>}
 */
export async function choisirItemCompendium(packName, { title, filtre, champs = [], libelle = (entree) => entree.name } = {}) {
  // Plusieurs compendiums possibles (ex. traits + talents, v0.20.0) : entrées fusionnées, repérées par leur uuid.
  const noms = Array.isArray(packName) ? packName : [packName];
  const packs = noms.map((nom) => game.packs.get(`galactic-wars.${nom}`)).filter(Boolean);
  if (!packs.length) {
    ui.notifications.error(`Galactic Wars | Compendium introuvable : ${noms.join(", ")}`);
    return null;
  }

  const index = (await Promise.all(packs.map(async (pack) => Array.from(await pack.getIndex({ fields: champs })))))
    .flat()
    .filter((entree) => !filtre || filtre(entree))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!index.length) {
    ui.notifications.warn(game.i18n.format("GALACTICWARS.Avertissement.CompendiumVide", { compendium: packs.map((p) => p.metadata.label).join(", ") }));
    return null;
  }

  const echapper = foundry.utils.escapeHTML;
  const options = index.map((entree) => `<option value="${echapper(entree.uuid)}">${echapper(libelle(entree))}</option>`).join("");
  const content = `<div class="form-group"><label>${game.i18n.localize("GALACTICWARS.Sheet.Choisir")}</label>
    <select name="choix" autofocus>${options}</select></div>`;

  const choixId = await foundry.applications.api.DialogV2.wait({
    window: { title: title ?? packs[0].metadata.label },
    rejectClose: false,
    content,
    buttons: [
      {
        action: "choisir",
        label: game.i18n.localize("GALACTICWARS.Sheet.Choisir"),
        icon: "fa-solid fa-check",
        default: true,
        callback: (event, target) => target.form.elements.choix.value
      },
      {
        action: "annuler",
        label: game.i18n.localize("GALACTICWARS.Sheet.Annuler"),
        callback: () => null
      }
    ]
  });

  if (!choixId) return null;
  return fromUuid(choixId);
}
