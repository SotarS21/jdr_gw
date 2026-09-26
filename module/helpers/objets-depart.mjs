import { appareilSelonNom, IMAGES_APPAREILS } from "./appareils.mjs";

/**
 * Équipement de départ des métiers (texte libre de l'Item métier, ex. « Blaster 1D4 +2 ») →
 * vrai objet typé. Les armes et armures reconnues deviennent une copie de l'objet du compendium
 * (dégâts, compétence liée, réduction, visuel, lien compendiumSource) sous le nom de la ligne du
 * métier ; des dés ou un bonus écrits dans la ligne l'emportent sur ceux du compendium. Le reste
 * reste un équipement (datapad et comlink reconnus). Bug remonté par l'auteur (2026-09-25) : les
 * armes de départ n'avaient ni dégâts ni compétence (elles étaient créées en équipement).
 *
 * Correspondances (première qui s'applique, sur le nom en minuscules) : `modele` = nom de l'objet
 * du compendium `pack`, `competence` = compétence imposée si elle diffère du modèle.
 */
const CORRESPONDANCES = [
  { motif: /^sabre laser double/, pack: "armes", modele: "Sabre laser double" },
  { motif: /^sabre laser/, pack: "armes", modele: "Sabre laser" },
  { motif: /^sabre d'entra[iî]nement/, pack: "armes", modele: "Sabre d'entraînement jedi" },
  { motif: /^blaster lourd/, pack: "armes", modele: "Blaster lourd" },
  { motif: /^blaster/, pack: "armes", modele: "Blaster" },
  { motif: /^fusil long/, pack: "armes", modele: "Fusil de précision" },
  { motif: /^arme lourde/, pack: "armes", modele: "Blaster lourd", competence: "canonLourd" },
  { motif: /^arme (contondante|blanche)/, pack: "armes", modele: "Arme contondante" },
  { motif: /^couteau/, pack: "armes", modele: "Lame" },
  { motif: /^armure l[ée]g[èe]re/, pack: "armures", modele: "Armure légère" },
  { motif: /^armure interm[ée]diaire/, pack: "armures", modele: "Armure intermédiaire" },
  { motif: /^armure lourde/, pack: "armures", modele: "Armure lourde" },
  { motif: /^blindage suppl[ée]mentaire/, pack: "armures", modele: "Armure lourde" },
  // Tenues (v0.16.3) : Jedi consulaire, Padawan, Guerrier sith.
  { motif: /^robe traditionnelle de jedi/, pack: "equipements", modele: "Robe de jedi" },
  { motif: /^robe traditionnelle/, pack: "equipements", modele: "Tenue d'apprenti jedi" },
  { motif: /^robe noire/, pack: "equipements", modele: "Robe noire" }
];

/**
 * Lignes d'équipement de départ qui sont en fait des contacts (bug remonté par l'auteur, 2026-09-25 :
 * « Connaissance dans la pègre » du Contrebandier doit être un PNJ de l'onglet Notes, pas un objet).
 */
export function estContactDeDepart(nom) {
  return /^(connaissances?\s+dans\s+la\s+p[èe]gre|contacts?\s+sur\s)/i.test(String(nom ?? "").trim());
}

/** Entrée de PNJ (onglet Notes → PNJ) pour un contact de départ. */
export function pnjDeDepart(nom, metierNom) {
  return {
    nom: String(nom).trim(),
    sousTitre: game.i18n.format("GALACTICWARS.Notes.ContactDeDepart", { metier: metierNom }),
    img: "",
    description: `<p>${game.i18n.format("GALACTICWARS.Notes.ContactDeDepartDescription", { metier: foundry.utils.escapeHTML(metierNom) })}</p>`,
    statut: "allie",
    origineMetier: metierNom
  };
}

/** Correspondance d'une ligne d'équipement, ou null. */
export function correspondanceDepart(nom) {
  const n = String(nom ?? "").trim().toLowerCase();
  return CORRESPONDANCES.find((c) => c.motif.test(n)) ?? null;
}

/** Dés écrits dans la ligne (« 2D8 », « 1D4 +2 ») → formule normalisée, ou null. */
function desDeLaLigne(nom) {
  const m = String(nom).match(/(\d+)\s*d\s*(\d+)(\s*\+\s*\d+)?/i);
  return m ? `${m[1]}d${m[2]}${m[3] ? `+${m[3].replace(/\D/g, "")}` : ""}` : null;
}

/** Bonus d'armure écrit dans la ligne (« +2 », « +4 d'armure ») → nombre, ou null. */
function bonusDeLaLigne(nom) {
  const m = String(nom).match(/\+\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

/**
 * Données de création d'un objet de départ.
 * @param {{nom: string, quantite: number}} ligne  entrée de metier.system.equipement
 * @returns {Promise<object>}
 */
export async function objetDeDepart(ligne) {
  const flags = { "galactic-wars": { startingGear: true } };
  const correspondance = correspondanceDepart(ligne.nom);
  let pack = correspondance && game.packs.get(`${game.system.id}.${correspondance.pack}`);
  let entree = pack?.index.find((e) => e.name === correspondance.modele);
  // Sinon, équipement du compendium au nom identique (« Matériel médical », « Kolto »…) : soin, prix, visuel.
  if (!entree) {
    pack = game.packs.get(`${game.system.id}.equipements`);
    const nom = String(ligne.nom).trim().toLowerCase();
    entree = pack?.index.find((e) => e.name.trim().toLowerCase() === nom);
  }
  const modele = entree ? await pack.getDocument(entree._id) : null;
  if (modele) {
    const data = game.items.fromCompendium(modele, { keepId: false });
    data.name = ligne.nom;
    data.system.quantite = ligne.quantite;
    data.system.porte = false;
    data.flags = foundry.utils.mergeObject(data.flags ?? {}, flags);
    data._stats = { ...(data._stats ?? {}), compendiumSource: modele.uuid };
    if (modele.type === "arme") {
      data.system.degats = desDeLaLigne(ligne.nom) ?? data.system.degats;
      if (correspondance.competence) data.system.competence = correspondance.competence;
    } else if (modele.type === "armure") {
      data.system.reduction = bonusDeLaLigne(ligne.nom) ?? data.system.reduction;
    }
    return data;
  }
  const appareil = appareilSelonNom(ligne.nom);
  return {
    name: ligne.nom,
    type: "equipement",
    ...(IMAGES_APPAREILS[appareil] ? { img: IMAGES_APPAREILS[appareil] } : {}),
    system: { quantite: ligne.quantite, appareil },
    flags
  };
}
