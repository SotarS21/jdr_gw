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
    ...manquantes.map((cle) => ({ cle, niveau: 0, racial: 0, metier: 0, ajustement: 0, acquiseParMetier: false, recommandee: false, debloquee: false }))
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

    const source = actor.system.toObject().competences;
    const completees = completerCompetences(source);
    let competences = completees ?? source;
    if (completees) {
      console.log(`Galactic Wars | Migration : ${completees.length - source.length} compétence(s) ajoutée(s) à "${actor.name}"`);
    }

    const recalculees = await synchroniserRecommandees(actor, competences);
    if (recalculees) competences = recalculees;

    if (completees || recalculees) await actor.update({ "system.competences": competences });

    // Ancien résumé unique -> premier élément de la liste des résumés.
    const { resume, resumes } = actor.system.toObject();
    if (resume?.trim() && !resumes?.length) {
      await actor.update({
        "system.resumes": [{ titre: game.i18n.localize("GALACTICWARS.Notes.Resume"), description: resume, date: Date.now() }],
        "system.resume": ""
      });
      console.log(`Galactic Wars | Migration : résumé repris dans la liste des résumés pour "${actor.name}"`);
    }
  }
}

/**
 * Recalcule `recommandee` (point orange) d'après le métier lié, pour les personnages dont le
 * métier a été appliqué avant l'existence de ce champ. Renvoie null si rien ne change.
 */
async function synchroniserRecommandees(actor, competences) {
  if (!actor.system.metier?.uuid) return null;
  const metier = await fromUuid(actor.system.metier.uuid).catch(() => null);
  if (metier?.type !== "metier") return null;
  const recommandees = new Set(metier.system.competences.filter((c) => c.obligatoire).map((c) => c.cle));
  let change = false;
  const resultat = competences.map((c) => {
    const recommandee = recommandees.has(c.cle);
    if (!!c.recommandee === recommandee) return c;
    change = true;
    return { ...c, recommandee };
  });
  if (change) console.log(`Galactic Wars | Migration : compétences recommandées recalculées pour "${actor.name}"`);
  return change ? resultat : null;
}
