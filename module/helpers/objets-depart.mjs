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
  { motif: /^sabre d'entra[iî]nement/, pack: "armes", modele: "Sabre laser" },
  { motif: /^blaster lourd/, pack: "armes", modele: "Blaster lourd" },
  { motif: /^blaster/, pack: "armes", modele: "Blaster" },
  { motif: /^fusil long/, pack: "armes", modele: "Fusil de précision" },
  { motif: /^arme lourde/, pack: "armes", modele: "Blaster lourd", competence: "canonLourd" },
  { motif: /^arme (contondante|blanche)/, pack: "armes", modele: "Arme contondante" },
  { motif: /^couteau/, pack: "armes", modele: "Arme contondante" },
  { motif: /^armure l[ée]g[èe]re/, pack: "armures", modele: "Armure légère" },
  { motif: /^armure interm[ée]diaire/, pack: "armures", modele: "Armure intermédiaire" },
  { motif: /^armure lourde/, pack: "armures", modele: "Armure lourde" },
  { motif: /^blindage suppl[ée]mentaire/, pack: "armures", modele: "Armure lourde" }
];

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
  const pack = correspondance && game.packs.get(`${game.system.id}.${correspondance.pack}`);
  const entree = pack?.index.find((e) => e.name === correspondance.modele);
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
    } else {
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
