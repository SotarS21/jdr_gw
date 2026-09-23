import { GW } from "../config.mjs";

/**
 * Complète une liste de compétences avec une entrée vierge pour chaque clé de GW.competences
 * absente. Renvoie null si rien ne manque.
 * @param {object[]} competences
 * @returns {object[]|null}
 */
export function completerCompetences(competences = []) {
  const existantes = new Set(competences.map((c) => c.cle));
  const manquantes = Object.keys(GW.competences).filter((cle) => !existantes.has(cle));
  if (!manquantes.length) return null;
  return [
    ...competences,
    ...manquantes.map((cle) => ({ cle, niveau: 0, racial: 0, metier: 0, ajustement: 0, acquiseParMetier: false, debloquee: false }))
  ];
}

/**
 * Migration idempotente : s'assure que tout Actor "personnage" a bien une entrée de
 * compétence pour chaque clé connue de GW.competences (utile quand de nouvelles
 * compétences sont ajoutées après la création des personnages).
 */
export async function runMigrations() {
  for (const actor of game.actors) {
    if (actor.type !== "personnage") continue;

    const competences = completerCompetences(actor.system.toObject().competences);
    if (!competences) continue;

    const ajoutees = competences.length - actor.system.competences.length;
    await actor.update({ "system.competences": competences });
    console.log(`Galactic Wars | Migration : ${ajoutees} compétence(s) ajoutée(s) à "${actor.name}"`);
  }
}
