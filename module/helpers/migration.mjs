import { GW } from "../config.mjs";

/**
 * Migration idempotente : s'assure que tout Actor "personnage" a bien une entrée de
 * compétence pour chaque clé connue de GW.competences (utile quand de nouvelles
 * compétences sont ajoutées après la création des personnages).
 */
export async function runMigrations() {
  const cles = Object.keys(GW.competences);

  for (const actor of game.actors) {
    if (actor.type !== "personnage") continue;

    const existantes = new Set(actor.system.competences.map((c) => c.cle));
    const manquantes = cles.filter((cle) => !existantes.has(cle));
    if (!manquantes.length) continue;

    const competences = [
      ...actor.system.competences,
      ...manquantes.map((cle) => ({ cle, niveau: 0, racial: 0, metier: 0, acquiseParMetier: false }))
    ];
    await actor.update({ "system.competences": competences });
    console.log(`Galactic Wars | Migration : ${manquantes.length} compétence(s) ajoutée(s) à "${actor.name}"`);
  }
}
