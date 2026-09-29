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

/** Libellé lisible d'une modification d'effet (ex. « Furtivité +20 % », « Dextérité +4 », « Armure +4 »). */
export function libelleChangement(change) {
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
    return label ? `${game.i18n.localize(label)} ${signe}` : "";
  }
  if (change.key === "system.effets.armure") return `${game.i18n.localize("GALACTICWARS.Effets.Armure")} ${signe}`;
  return "";
}

/** Résumé des effets actifs d'un objet (effets non désactivés), ex. « Social +20 %, Furtivité −15 % ». */
export function resumeEffets(item) {
  return item.effects
    .filter((e) => !e.disabled)
    .flatMap((e) => e.changes.map(libelleChangement))
    .filter(Boolean)
    .join(", ");
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
