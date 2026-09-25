import { appareilSelonNom, IMAGES_APPAREILS, IMAGES_GENERIQUES } from "./appareils.mjs";
import { fichesIncompletes, completerToutesLesFiches } from "./migration.mjs";
import { GalacticWarsActor } from "../documents/actor.mjs";
import { competencesSelonMetier } from "./metier.mjs";
import { correspondanceDepart, objetDeDepart } from "./objets-depart.mjs";

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
    label: "Nouvelle compétence « Arme contondante/blanche » accordée par les métiers",
    description:
      "La compétence manquante « Arme contondante/blanche » (Corps) est ajoutée à tous les personnages. " +
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
      "« Arme contondante/blanche ». Une arme dont vous avez choisi une autre compétence n'est pas touchée.",
    concernes: async () => (await armesContondantesSurBagarre()).length,
    apply: async () => {
      const liste = await armesContondantesSurBagarre();
      for (const copie of liste) await copie.update({ "system.competence": "armeBlanche" });
      return liste.length;
    }
  },
  {
    id: "0.14.2-objets-de-soin",
    cible: "acteurs",
    version: "0.14.2",
    label: "Objets de soin (Kolto, Kolto max, Matériel médical)",
    description:
      "Nouveau bouton « Utiliser » sur la carte de tchat des objets de soin : Kolto regagne 4 PV, Kolto max 6 PV, " +
      "Matériel médical tous les PV. Renseigne ce soin sur les copies déjà dans le monde ou portées (copies du " +
      "compendium, ou objets au nom identique). Un soin déjà saisi n'est pas remplacé.",
    concernes: async () => (await objetsDeSoinARenseigner()).length,
    apply: async () => {
      const liste = await objetsDeSoinARenseigner();
      for (const { objet, soin } of liste) await objet.update({ "system.soin": soin });
      return liste.length;
    }
  },
  {
    id: "0.14.2-prix-catalogue",
    cible: "armes",
    version: "0.14.2",
    label: "Prix du catalogue économique (armes)",
    description:
      "Prix repris du classeur « Science économique » : Arme contondante 522c, Fusil de précision 1200c, sabres laser " +
      "non achetables (NA), Blaster lourd 400c et 2d6+3 dégâts (au lieu de 4500c et 2d6). Seules les copies sans prix " +
      "ou encore à l'ancienne valeur du compendium sont modifiées.",
    concernes: async () => (await armesAuPrixDuCatalogue()).length,
    apply: async () => {
      const liste = await armesAuPrixDuCatalogue();
      for (const { copie, changements } of liste) await copie.update(changements);
      return liste.length;
    }
  },
  {
    id: "0.14.1-armes-depart",
    cible: "acteurs",
    version: "0.14.1",
    label: "Armes et armures de départ des métiers",
    description:
      "L'équipement de départ des métiers créait les armes et armures comme de simples équipements, sans dégâts, " +
      "compétence liée ni réduction. Les objets reconnus (« Blaster 1D4 +2 », « Arme blanche au choix », « Armure " +
      "intermédiaire +2 »…) sont remplacés par une arme ou une armure du compendium, sous le même nom, avec les dés " +
      "ou le bonus écrits dans leur nom. Les autres équipements ne sont pas touchés.",
    concernes: async () => equipementsDepartATyper().length,
    apply: async () => {
      const liste = equipementsDepartATyper();
      // Un token non lié hérite des objets de son acteur de base : l'objet converti sur la base lui
      // parvient déjà. Pour ces objets hérités (ou seulement surchargés), on reporte l'état du token
      // (porté, tags) sur l'objet hérité et on retire l'ancien — sinon il en aurait deux.
      // Tri AVANT toute conversion : ensuite, la base n'a plus l'ancien objet.
      const estHerite = (objet) => objet.parent.isToken && !!game.actors.get(objet.parent.id)?.items.has(objet.id);
      const herites = liste.filter(estHerite)
        .map((objet) => ({ acteur: objet.parent, id: objet.id, nom: objet.name, etat: etatObjet(objet) }));
      for (const objet of liste.filter((o) => !estHerite(o))) {
        const acteur = objet.parent;
        const data = await objetDeDepart({ nom: objet.name, quantite: objet.system.quantite ?? 1 });
        Object.assign(data.system, etatObjet(objet));
        await acteur.createEmbeddedDocuments("Item", [data]);
        await acteur.deleteEmbeddedDocuments("Item", [objet.id]);
      }
      for (const { acteur, id, nom, etat } of herites) {
        const nouveau = acteur.items.find((i) => i.name === nom && i.type !== "equipement" && i.getFlag("galactic-wars", "startingGear"));
        if (nouveau) await nouveau.update({ "system.porte": etat.porte, "system.tags": etat.tags });
        if (acteur.items.has(id)) await acteur.deleteEmbeddedDocuments("Item", [id]);
      }
      return liste.length;
    }
  },
  {
    id: "0.14.1-visuels-par-nom",
    cible: "acteurs",
    version: "0.14.1",
    label: "Visuels des objets créés à la main",
    description:
      "Les objets créés à la main (sans lien au compendium) gardaient l'icône générique. Ceux dont le nom est " +
      "exactement celui d'une arme, d'une armure ou d'un équipement du compendium (ex. « Blaster lourd ») reçoivent " +
      "son visuel. Une image que vous avez choisie vous-même n'est jamais remplacée.",
    concernes: async () => (await objetsAIllustrerParNom()).length,
    apply: async () => {
      const liste = await objetsAIllustrerParNom();
      for (const { objet, img } of liste) await objet.update({ img });
      return liste.length;
    }
  },
  {
    id: "0.13.3-competences-armes",
    cible: "armes",
    version: "0.13.3",
    label: "Compétence liée au Lance-roquette, aux Grenades et au Trident sith",
    description:
      "Ces armes n'avaient aucune compétence liée : Lance-roquette → Canon lourd, Grenade et Grenade militaire → " +
      "Artifice, Trident sith → Arme contondante/blanche. Seules les copies encore sans compétence sont modifiées.",
    concernes: async () => (await armesSansCompetence()).length,
    apply: async () => {
      const liste = await armesSansCompetence();
      for (const { copie, competence } of liste) await copie.update({ "system.competence": competence });
      return liste.length;
    }
  },
  {
    id: "0.13.2-icones-objets",
    cible: "acteurs",
    version: "0.13.2",
    label: "Visuels des objets (armes, armures, équipements, datapads, comlinks)",
    description:
      "Les objets des compendiums Armes, Armures et Équipements ont reçu leur visuel (asset_visuel/objets). Remplace " +
      "l'icône générique des objets déjà copiés dans le monde ou portés par les personnages, ainsi que celle des datapads " +
      "et comlinks de départ. Une image que vous avez choisie vous-même n'est jamais remplacée.",
    concernes: async () => (await objetsAIllustrer()).length,
    apply: async () => {
      const liste = await objetsAIllustrer();
      for (const { objet, img } of liste) await objet.update({ img });
      return liste.length;
    }
  },
  {
    id: "0.13.2-image-unique-acteurs",
    cible: "acteurs",
    version: "0.13.2",
    label: "Une seule image par personnage (fiche, acteur, token)",
    description:
      "Aligne l'image de l'acteur et celle de son token sur le portrait de la fiche (ou sur l'image de l'acteur si le " +
      "portrait n'a jamais été changé), tokens déjà posés sur les scènes compris. Désormais, changer l'image de la " +
      "fiche change aussi l'acteur et le token.",
    concernes: () => Promise.resolve(acteursImagesDivergentes().length),
    apply: async () => {
      const liste = acteursImagesDivergentes();
      for (const { actor, image } of liste) {
        // _preUpdate ne réagit qu'à un changement : on écrit directement les trois champs, puis les tokens posés.
        await actor.update(GalacticWarsActor.champsImage(image));
        for (const scene of game.scenes) {
          const tokens = scene.tokens.filter((t) => t.actorId === actor.id && t.actorLink && t.texture.src !== image);
          if (tokens.length) await scene.updateEmbeddedDocuments("Token", tokens.map((t) => ({ _id: t.id, "texture.src": image })));
        }
      }
      return liste.length;
    }
  },
  {
    id: "0.13.2-competences-manquantes",
    cible: "acteurs",
    version: "0.13.2",
    label: "Compétences manquantes ajoutées aux fiches existantes",
    description:
      "Ajoute aux fiches de personnage déjà créées les compétences qui leur manquent (dont « Arme contondante/blanche ») : " +
      "personnages du monde, tokens non liés et compendiums du monde. Les autres compétences ne sont pas touchées. " +
      "Aussi disponible en macro : game.galacticWars.completerCompetences()",
    concernes: async () => (await fichesIncompletes()).length,
    apply: async () => (await completerToutesLesFiches({ notifier: false })).fiches
  },
  {
    id: "0.13.1-appareil-datapad",
    cible: "acteurs",
    version: "0.13.1",
    label: "Datapads reconnus (onglet Holonet)",
    description:
      "Les équipements nommés « Datapad » (équipement de départ des métiers) deviennent des appareils Datapad : " +
      "leur fiche gagne l'onglet Holonet, qui affiche et modifie les Infos du personnage (onglet Notes).",
    concernes: () => Promise.resolve(datapadsNonReconnus().length),
    apply: async () => {
      const liste = datapadsNonReconnus();
      for (const objet of liste) await objet.update({ "system.appareil": "datapad" });
      return liste.length;
    }
  }
];

/** Objets à icône générique qui ont désormais un visuel : copie de compendium, ou appareil reconnu par son nom. */
async function objetsAIllustrer() {
  const objets = [...game.items, ...tousLesActeurs().flatMap((a) => [...a.items])]
    .filter((i) => ["arme", "armure", "equipement"].includes(i.type) && IMAGES_GENERIQUES.has(i.img ?? ""));
  const liste = [];
  for (const objet of objets) {
    let img = null;
    const source = objet._stats?.compendiumSource;
    if (source?.startsWith(`Compendium.${game.system.id}.`)) img = (await fromUuid(source).catch(() => null))?.img;
    img ??= IMAGES_APPAREILS[objet.system.appareil || appareilSelonNom(objet.name)] ?? null;
    if (img && !IMAGES_GENERIQUES.has(img) && img !== objet.img) liste.push({ objet, img });
  }
  return liste;
}

/** Équipements sans soin dont l'équipement du compendium (même source ou même nom) en a un. */
async function objetsDeSoinARenseigner() {
  const pack = game.packs.get(`${game.system.id}.equipements`);
  const index = (await pack?.getIndex({ fields: ["system.soin"] })) ?? [];
  const parNom = new Map();
  const parUuid = new Map();
  for (const e of index) {
    const soin = e.system?.soin;
    if (!soin) continue;
    parNom.set(e.name.trim().toLowerCase(), soin);
    parUuid.set(e.uuid, soin);
  }
  return [...game.items, ...tousLesActeurs().flatMap((a) => [...a.items])]
    .filter((i) => i.type === "equipement" && !i.system.soin)
    .map((objet) => ({ objet, soin: parUuid.get(objet._stats?.compendiumSource) ?? parNom.get(objet.name.trim().toLowerCase()) }))
    .filter((o) => o.soin);
}

/** Anciennes valeurs du compendium Armes avant la v0.14.2 (remplacées si la copie les a gardées). */
const ANCIENNES_VALEURS_ARMES = { "Blaster lourd": { prix: "4500c", degats: "2d6" } };

/** Copies d'armes dont le prix (et, pour le Blaster lourd, les dégâts) suit l'ancien compendium. */
async function armesAuPrixDuCatalogue() {
  const liste = [];
  for (const copie of copiesDepuis("armes")) {
    const source = await fromUuid(copie._stats.compendiumSource).catch(() => null);
    if (!source) continue;
    const ancien = ANCIENNES_VALEURS_ARMES[source.name] ?? {};
    const changements = {};
    const prix = copie.system.prix ?? "";
    if (source.system.prix && prix !== source.system.prix && (!prix || prix === ancien.prix)) {
      changements["system.prix"] = source.system.prix;
    }
    if (ancien.degats && copie.system.degats === ancien.degats && source.system.degats !== ancien.degats) {
      changements["system.degats"] = source.system.degats;
    }
    if (Object.keys(changements).length) liste.push({ copie, changements });
  }
  return liste;
}

/** Équipements de départ de métier (flag startingGear) qui correspondent à une arme ou une armure. */
function equipementsDepartATyper() {
  return tousLesActeurs()
    .flatMap((a) => [...a.items])
    .filter((i) => i.type === "equipement" && i.getFlag("galactic-wars", "startingGear") && correspondanceDepart(i.name));
}

/** État propre à l'objet d'un personnage, conservé lors de la conversion. */
function etatObjet(objet) {
  return {
    porte: !!objet.system.porte,
    tags: foundry.utils.deepClone(objet.system.tags ?? {}),
    ...(objet.system.notesMJ ? { notesMJ: objet.system.notesMJ } : {})
  };
}

/** Objets à icône générique dont le nom est celui d'un objet des compendiums d'objets. */
async function objetsAIllustrerParNom() {
  const images = new Map();
  for (const nom of ["armes", "armures", "equipements"]) {
    const pack = game.packs.get(`${game.system.id}.${nom}`);
    for (const e of (await pack?.getIndex({ fields: ["img", "type"] })) ?? []) {
      if (e.img && !IMAGES_GENERIQUES.has(e.img)) images.set(`${e.type}|${e.name.trim().toLowerCase()}`, e.img);
    }
  }
  const objets = [...game.items, ...tousLesActeurs().flatMap((a) => [...a.items])]
    .filter((i) => ["arme", "armure", "equipement"].includes(i.type) && IMAGES_GENERIQUES.has(i.img ?? ""));
  return objets
    .map((objet) => ({ objet, img: images.get(`${objet.type}|${objet.name.trim().toLowerCase()}`) }))
    .filter((o) => o.img);
}

/** Acteurs du monde (avec portrait) dont portrait, image et image de token ne sont pas identiques. */
function acteursImagesDivergentes() {
  const liste = [];
  for (const actor of game.actors) {
    if (!actor.aUnPortrait) continue;
    const image = GalacticWarsActor.imageUnique(actor.system.portrait, actor.img);
    if (!image) continue;
    const jeton = actor.prototypeToken.texture.src;
    if (actor.system.portrait !== image || actor.img !== image || jeton !== image) liste.push({ actor, image });
  }
  return liste;
}

/** Équipements nommés « Datapad » (monde, acteurs, tokens non liés) sans appareil renseigné. */
function datapadsNonReconnus() {
  const objets = [...game.items, ...tousLesActeurs().flatMap((a) => [...a.items])];
  return objets.filter((i) => i.type === "equipement" && !i.system.appareil && appareilSelonNom(i.name) === "datapad");
}

/** Copies d'armes sans compétence alors que leur arme du compendium en a désormais une. */
async function armesSansCompetence() {
  const liste = [];
  for (const copie of copiesDepuis("armes")) {
    if (copie.system.competence) continue;
    const source = await fromUuid(copie._stats.compendiumSource).catch(() => null);
    if (source?.system.competence) liste.push({ copie, competence: source.system.competence });
  }
  return liste;
}

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
