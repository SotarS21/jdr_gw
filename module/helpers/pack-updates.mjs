import { competencesSelonMetier } from "./metier.mjs";

/**
 * Registre des correctifs de contenu proposés au MJ après une mise à jour (sur le modèle
 * d'antique). Chaque entrée est affichée dans une fenêtre à cases (module/apps/pack-update-picker.mjs)
 * et ne touche le monde que si elle est cochée.
 *
 * Les compendiums du système sont remplacés en entier par Foundry à chaque mise à jour : leur
 * contenu suit donc tout seul. Ce qui ne suit PAS, ce sont les copies faites dans le monde —
 * objets importés, objets portés par les personnages, personnages et tokens non liés dont une
 * fonctionnalité a évolué. C'est ce que ces correctifs mettent à jour, par champs ciblés,
 * jamais par écrasement complet d'un document.
 *
 * Champs d'une entrée :
 * - `id`       unique, jamais réutilisé (mémorisé dans le réglage monde une fois appliqué) ;
 * - `cible`    nom d'un pack de system.json (copies issues de ce compendium) ou "acteurs"
 *              (personnages du monde et tokens non liés) — sert au regroupement dans la fenêtre ;
 * - `version`, `label`, `description` : affichés au MJ ;
 * - `concernes()` → nombre de documents touchés (0 = rien à faire : marqué appliqué sans demander) ;
 * - `apply()`     → applique le correctif, renvoie le nombre de documents modifiés.
 */
export const PACK_UPDATES = [
  {
    id: "0.12.2-images-races",
    cible: "races",
    version: "0.12.2",
    label: "Portraits d'ethnie sur les races importées",
    description:
      "Les 43 races du compendium ont reçu leur portrait d'ethnie (v0.10.1). Copie l'image du " +
      "compendium sur les races déjà importées dans le monde ou posées sur un personnage.",
    concernes: () => copiesDivergentes("races", ["img"]).then((l) => l.length),
    apply: () => synchroniserCopies("races", ["img"])
  },
  {
    id: "0.12.2-competences-metier",
    cible: "acteurs",
    version: "0.12.2",
    label: "Bonus de compétences des métiers réalignés",
    description:
      "Les métiers ont été alignés sur la fiche Métier V2.6 et ont gagné les compétences réservées " +
      "(v0.11.0). Recalcule, sur chaque personnage ayant un métier, le bonus de métier, " +
      "l'acquisition et le point orange de ses compétences. Niveaux, ajustements et équipement " +
      "ne sont pas touchés.",
    concernes: () => personnagesMetierDivergent().then((l) => l.length),
    apply: async () => {
      const liste = await personnagesMetierDivergent();
      for (const { actor, competences } of liste) await actor.update({ "system.competences": competences });
      return liste.length;
    }
  },
  {
    id: "0.13.0-arme-blanche-metiers",
    cible: "acteurs",
    version: "0.13.0",
    label: "Nouvelle compétence « Arme contondante et blanche » accordée par les métiers",
    description:
      "La compétence manquante « Arme contondante et blanche » (Corps) est ajoutée à tous les personnages. " +
      "Les 8 métiers qui la recommandent (Padawan, Apprenti sith, Chasseur de primes, Assassin, Pirate, Contrebandier, " +
      "Mandalorien soldat, Mécanicien) l'accordent désormais : recalcule l'acquisition " +
      "et le point orange des personnages de ces métiers. Niveaux, ajustements et équipement ne sont pas touchés.",
    concernes: () => personnagesMetierDivergent().then((l) => l.length),
    apply: async () => {
      const liste = await personnagesMetierDivergent();
      for (const { actor, competences } of liste) await actor.update({ "system.competences": competences });
      return liste.length;
    }
  },
  {
    id: "0.13.0-arme-contondante-competence",
    cible: "armes",
    version: "0.13.0",
    label: "« Arme contondante » liée à la nouvelle compétence",
    description:
      "Les copies de l'« Arme contondante » encore liées à Bagarre (faute de mieux jusqu'ici) passent sur " +
      "« Arme contondante et blanche ». Une arme dont vous avez choisi une autre compétence n'est pas touchée.",
    concernes: async () => (await armesContondantesSurBagarre()).length,
    apply: async () => {
      const liste = await armesContondantesSurBagarre();
      for (const copie of liste) await copie.update({ "system.competence": "armeBlanche" });
      return liste.length;
    }
  }
];

/** Copies de l'« Arme contondante » du compendium restées sur l'ancienne compétence (bagarre). */
async function armesContondantesSurBagarre() {
  const liste = [];
  for (const copie of copiesDepuis("armes")) {
    if (copie.system.competence !== "bagarre") continue;
    const source = await fromUuid(copie._stats.compendiumSource).catch(() => null);
    if (source?.system.competence === "armeBlanche") liste.push(copie);
  }
  return liste;
}

/* ------------------------------------------------------------------------------------------ */
/* Outils génériques pour écrire de futurs correctifs en quelques lignes.                      */
/* ------------------------------------------------------------------------------------------ */

/** Personnages du monde + acteurs synthétiques des tokens non liés (qui ont leurs propres données). */
export function tousLesActeurs() {
  const acteurs = [...game.actors];
  for (const scene of game.scenes) {
    for (const token of scene.tokens) {
      if (!token.actorLink && token.actor) acteurs.push(token.actor);
    }
  }
  return acteurs;
}

/** Objets du monde et objets portés (acteurs + tokens non liés) copiés depuis le compendium `pack`. */
function copiesDepuis(pack) {
  const prefixe = `Compendium.${game.system.id}.${pack}.`;
  const objets = [...game.items, ...tousLesActeurs().flatMap((a) => [...a.items])];
  return objets.filter((i) => i._stats?.compendiumSource?.startsWith(prefixe));
}

/** Copies dont au moins un des `champs` (chemins, ex. "img", "system.degats") diffère du compendium. */
export async function copiesDivergentes(pack, champs) {
  const resultat = [];
  for (const copie of copiesDepuis(pack)) {
    const source = await fromUuid(copie._stats.compendiumSource).catch(() => null);
    if (!source) continue;
    const changements = {};
    for (const champ of champs) {
      const valeur = foundry.utils.getProperty(source.toObject(), champ);
      if (!foundry.utils.objectsEqual({ v: foundry.utils.getProperty(copie.toObject(), champ) }, { v: valeur })) {
        changements[champ] = foundry.utils.deepClone(valeur);
      }
    }
    if (Object.keys(changements).length) resultat.push({ copie, changements });
  }
  return resultat;
}

/** Recopie les `champs` du compendium sur toutes les copies divergentes. */
export async function synchroniserCopies(pack, champs) {
  const liste = await copiesDivergentes(pack, champs);
  for (const { copie, changements } of liste) await copie.update(changements);
  return liste.length;
}

/** Personnages (fiche classique) dont les compétences ne correspondent plus au métier lié. */
async function personnagesMetierDivergent() {
  const resultat = [];
  for (const actor of tousLesActeurs()) {
    if (actor.type !== "personnage" || !actor.system.metier?.uuid) continue;
    const metier = await fromUuid(actor.system.metier.uuid).catch(() => null);
    if (metier?.type !== "metier") continue;
    const source = actor.system.toObject().competences;
    const competences = competencesSelonMetier(source, metier);
    if (!foundry.utils.objectsEqual({ c: source }, { c: competences })) resultat.push({ actor, competences });
  }
  return resultat;
}

/* ------------------------------------------------------------------------------------------ */
/* Suivi des correctifs appliqués.                                                             */
/* ------------------------------------------------------------------------------------------ */

const SETTING_KEY = "correctifsAppliques";

/** Réglage monde caché : `id` des correctifs déjà appliqués. À appeler au hook "init". */
export function registerPackUpdateSettings() {
  game.settings.register(game.system.id, SETTING_KEY, {
    name: "Correctifs de contenu déjà appliqués à ce monde",
    scope: "world",
    config: false,
    type: Array,
    default: []
  });
}

export async function markPackUpdatesApplied(ids) {
  if (!ids.length) return;
  const appliques = new Set(game.settings.get(game.system.id, SETTING_KEY) ?? []);
  for (const id of ids) appliques.add(id);
  await game.settings.set(game.system.id, SETTING_KEY, [...appliques]);
}

/**
 * Correctifs non encore appliqués, avec leur nombre de documents concernés. Ceux qui ne
 * concernent rien dans ce monde (monde neuf, ou déjà à jour) sont marqués appliqués d'office.
 * @returns {Promise<Array<object & {nombre: number}>>}
 */
export async function getPendingPackUpdates() {
  const appliques = new Set(game.settings.get(game.system.id, SETTING_KEY) ?? []);
  const enAttente = [];
  const sansObjet = [];
  for (const update of PACK_UPDATES.filter((u) => !appliques.has(u.id))) {
    let nombre;
    try {
      nombre = await update.concernes();
    } catch (err) {
      console.error(`Galactic Wars | Correctif "${update.id}" : comptage impossible`, err);
      continue;
    }
    if (nombre > 0) enAttente.push({ ...update, nombre });
    else sansObjet.push(update.id);
  }
  await markPackUpdatesApplied(sansObjet);
  return enAttente;
}

/** MJ uniquement, hook "ready" : ouvre la fenêtre de choix s'il reste des correctifs utiles. */
export async function checkPendingPackUpdates() {
  if (!game.user.isGM) return;
  const enAttente = await getPendingPackUpdates();
  if (!enAttente.length) return;
  const { PackUpdatePicker } = await import("../apps/pack-update-picker.mjs");
  PackUpdatePicker.open();
}
