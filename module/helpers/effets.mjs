import { GW } from "../config.mjs";

/**
 * Effets actifs (v0.20.0) : traits et talents portant des Active Effects transférés à l'acteur, couverts en états
 * de token. Les effets visent `system.effets.*` (voir GW.facteurD20VersPourcentage).
 */

/** Préfixe des identifiants d'état des couverts (CONFIG.statusEffects). */
const PREFIXE_COUVERT = "gw-";

/** Identifiant d'état d'un couvert de GW.couverts (ex. "gw-demiCouvert"). */
export function idCouvert(cle) {
  return `${PREFIXE_COUVERT}${cle}`;
}

/** Couvert actif de l'acteur (clé de GW.couverts) ou null. */
export function couvertActif(acteur) {
  return Object.keys(GW.couverts).find((cle) => acteur?.statuses?.has(idCouvert(cle))) ?? null;
}

/**
 * Active (ou retire, si c'est déjà le couvert actif) un couvert ; l'autre couvert est retiré (exclusifs).
 * @param {Actor} acteur
 * @param {string|null} cle clé de GW.couverts, ou null pour retirer tout couvert
 */
export async function basculerCouvert(acteur, cle) {
  const actuel = couvertActif(acteur);
  if (actuel) await acteur.toggleStatusEffect(idCouvert(actuel), { active: false });
  if (cle && cle !== actuel) await acteur.toggleStatusEffect(idCouvert(cle), { active: true });
}

/**
 * Libellé lisible d'une modification d'effet (ex. « Furtivité +20 % », « Dextérité +4 », « Armure +4 »).
 * @param {object} change modification (key, value)
 * @param {object} [options]
 * @param {number} [options.facteur=1] facteur appliqué aux caractéristiques rapides : un PNJ les compte
 *   × GW.facteurD20VersPourcentage (valeur affichée en %). Toute autre valeur (ex. l'index passé par
 *   Array#map) est ignorée.
 */
export function libelleChangement(change, options) {
  const facteur = Number(options?.facteur) || 1;
  const valeur = Number(change.value);
  if (!Number.isFinite(valeur)) return "";
  const signe = valeur > 0 ? `+${valeur}` : `${valeur}`;
  const [, groupe, cle] = change.key.match(/^system\.effets\.(competences|caracteristiques)\.(\w+)$/) ?? [];
  if (groupe === "competences") {
    const label = GW.competences[cle]?.label;
    return label ? `${game.i18n.localize(label)} ${signe} %` : "";
  }
  if (groupe === "caracteristiques") {
    const label = GW.caracteristiquesRapides[cle];
    if (!label) return "";
    if (facteur === 1) return `${game.i18n.localize(label)} ${signe}`;
    const applique = valeur * facteur;
    return `${game.i18n.localize(label)} ${applique > 0 ? `+${applique}` : applique} %`;
  }
  if (change.key === "system.effets.armure") return `${game.i18n.localize("GALACTICWARS.Effets.Armure")} ${signe}`;
  return "";
}

/**
 * Résumé des effets actifs d'un objet (effets non désactivés), ex. « Social +20 %, Furtivité −15 % ».
 * @param {Item} item
 * @param {object} [options] transmis à libelleChangement (facteur des caractéristiques rapides d'un PNJ) ;
 *   `tous: true` résume aussi les effets désactivés (ce qu'apporte un trait actif éteint)
 */
export function resumeEffets(item, options = {}) {
  return item.effects
    .filter((e) => options.tous || !e.disabled)
    .flatMap((e) => e.changes.map((change) => libelleChangement(change, options)))
    .filter(Boolean)
    .join(", ");
}

/**
 * Ligne d'un trait porté, pour les fiches classique et rapide : résumé des effets appliqués ; un trait actif
 * (`system.actif`, v0.20.1) porteur d'effets reçoit un interrupteur (`activable`, `enCours`) et, éteint, le résumé de
 * ce qu'il apporterait.
 * @param {Item} item talent porté
 * @param {string} autreFiche variante sans effet sur cette fiche ("classique" ou "rapide")
 * @param {object} [options] transmis à resumeEffets
 */
export function ligneTrait(item, autreFiche, options = {}) {
  const activable = !!item.system.actif && item.effects.size > 0;
  const enCours = item.effects.some((e) => !e.disabled);
  return {
    id: item.id, img: item.img, name: item.name, system: item.system,
    effets: resumeEffets(item, options),
    activable, enCours,
    effetsPossibles: activable && !enCours ? resumeEffets(item, { ...options, tous: true }) : "",
    autreFiche: item.system.fiche === autreFiche
  };
}

/** Allume (ou éteint) tous les effets d'un trait actif. */
export async function basculerTraitActif(item) {
  if (!item?.effects.size) return;
  const allumer = !item.effects.some((e) => !e.disabled);
  await item.updateEmbeddedDocuments("ActiveEffect", item.effects.map((e) => ({ _id: e.id, disabled: !allumer })));
}

/**
 * Sources d'un bonus d'effet : effets appliqués à l'acteur (transférés par ses traits / talents, états de token) qui
 * visent `cle`, ex. « Fureur obscure +20 % ». Pour l'info-bulle de la pastille de bonus des fiches.
 * @param {Actor} acteur
 * @param {string} cle chemin visé (ex. "system.effets.competences.intimidation")
 * @param {{unite?: string, facteur?: number}} [options] unité affichée, facteur (PNJ : bonus d20 × 5)
 * @returns {string} une source par ligne
 */
export function sourcesEffets(acteur, cle, { unite = "", facteur = 1 } = {}) {
  const lignes = [];
  for (const effet of acteur.appliedEffects ?? []) {
    for (const change of effet.changes ?? []) {
      const valeur = Number(change.value) * facteur;
      if (change.key !== cle || !Number.isFinite(valeur) || !valeur) continue;
      lignes.push(`${effet.name} ${valeur > 0 ? "+" : ""}${valeur}${unite}`);
    }
  }
  return lignes.join("<br>");
}

/** Variante de trait adaptée à l'acteur : "classique" (fiche classique) ou "rapide" (fiche rapide, PNJ). */
export function ficheDeLActeur(acteur) {
  return acteur.type === "personnage" ? "classique" : "rapide";
}

/**
 * États de token des couverts (traits actifs) : +4 / +8 d'armure temporaire, exclusifs. À appeler au hook "init".
 * Le HUD du token les propose ; la fiche aussi (onglet Combat / section Combat de la fiche rapide).
 */
export function enregistrerCouverts() {
  for (const [cle, couvert] of Object.entries(GW.couverts)) {
    CONFIG.statusEffects.push({
      id: idCouvert(cle),
      name: couvert.label,
      img: couvert.img,
      system: { changes: [{ key: "system.effets.armure", type: "add", value: String(couvert.armure) }] }
    });
  }
  // Exclusifs : prendre un couvert depuis le HUD retire l'autre (seul le client qui l'a créé s'en charge).
  Hooks.on("createActiveEffect", async (effet, _options, userId) => {
    if (userId !== game.user.id || !(effet.parent instanceof Actor)) return;
    const pris = Object.keys(GW.couverts).find((cle) => effet.statuses.has(idCouvert(cle)));
    if (!pris) return;
    for (const autre of Object.keys(GW.couverts)) {
      if (autre !== pris && effet.parent.statuses.has(idCouvert(autre))) {
        await effet.parent.toggleStatusEffect(idCouvert(autre), { active: false });
      }
    }
  });
}
