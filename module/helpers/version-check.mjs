import { RELEASE_NOTES } from "./release-notes.mjs";

const SYSTEM_ID = "galactic-wars";
const VERSION_SETTING = "derniereVersionVue";

/** Réglage monde caché : dernière version du système vue par ce monde. À appeler au hook "init". */
export function registerVersionCheckSettings() {
  game.settings.register(SYSTEM_ID, VERSION_SETTING, {
    name: "Dernière version du système vue par ce monde",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
}

/**
 * Après une vraie mise à jour (pas le tout premier chargement du monde), affiche au MJ les notes
 * des versions installées depuis la dernière vue. À appeler au hook "ready", MJ uniquement.
 *
 * Inactif sur un déploiement local de développement : system.json du dépôt garde `manifest` vide,
 * seule la release GitHub (.github/workflows/release.yml) le remplit.
 *
 * Contrairement à antique, pas d'écrasement des compendiums à proposer : les packs sont livrés
 * compilés dans le zip et Foundry remplace le dossier du système à chaque mise à jour.
 */
export async function checkSystemVersionUpdate() {
  if (!game.user.isGM) return;
  if (!game.system.manifest) return;

  const stored = game.settings.get(SYSTEM_ID, VERSION_SETTING);
  const current = game.system.version;

  if (!stored) {
    await game.settings.set(SYSTEM_ID, VERSION_SETTING, current);
    return;
  }
  if (stored === current) return;

  const notes = Object.entries(RELEASE_NOTES)
    .filter(([version]) => foundry.utils.isNewerVersion(version, stored) && !foundry.utils.isNewerVersion(version, current))
    .sort(([a], [b]) => (foundry.utils.isNewerVersion(a, b) ? 1 : -1))
    .map(([, note]) => `<h3>${note.title}</h3>${note.html}`)
    .join("");

  await foundry.applications.api.DialogV2.prompt({
    window: { title: `Galactic Wars — mise à jour vers la version ${current}` },
    content: `<div class="galactic-wars notes-de-version">
      ${notes || "<p>Aucune note de version disponible pour cette mise à jour.</p>"}
    </div>`,
    ok: { label: "Compris", icon: "fa-solid fa-check" },
    rejectClose: false
  });

  // Enregistrée quel que soit le mode de fermeture, pour ne pas réafficher la fenêtre.
  await game.settings.set(SYSTEM_ID, VERSION_SETTING, current);
}
