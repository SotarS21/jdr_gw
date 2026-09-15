/**
 * Ouvre une fenêtre listant les entrées d'un compendium du système et retourne le
 * document choisi (ou `null` si l'utilisateur annule) — utilisé par les boutons
 * "Choisir" race/métier/école des fiches de personnage, qui n'avaient auparavant
 * aucun moyen de renseigner `system.race.uuid`/`system.metier.uuid`/`system.ecole.uuid`
 * (seul un glisser-déposer depuis la sidebar l'aurait permis, non implémenté).
 * @param {string} packName nom du compendium (ex. "races", "metiers"), sans le préfixe système.
 * @param {{title?: string}} [options]
 * @returns {Promise<Item|null>}
 */
export async function choisirItemCompendium(packName, { title } = {}) {
  const pack = game.packs.get(`galactic-wars.${packName}`);
  if (!pack) {
    ui.notifications.error(`Galactic Wars | Compendium introuvable : ${packName}`);
    return null;
  }

  const index = Array.from(await pack.getIndex()).sort((a, b) => a.name.localeCompare(b.name));
  if (!index.length) {
    ui.notifications.warn(game.i18n.format("GALACTICWARS.Avertissement.CompendiumVide", { compendium: pack.metadata.label }));
    return null;
  }

  const options = index.map((entree) => `<option value="${entree._id}">${entree.name}</option>`).join("");
  const content = `<div class="form-group"><label>${game.i18n.localize("GALACTICWARS.Sheet.Choisir")}</label>
    <select name="choix" autofocus>${options}</select></div>`;

  const choixId = await foundry.applications.api.DialogV2.wait({
    window: { title: title ?? pack.metadata.label },
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
  return pack.getDocument(choixId);
}
