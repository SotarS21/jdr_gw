import { GW } from "../config.mjs";

/**
 * Taux d'une compétence (fiche classique), règle commune à PersonnageData#prepareDerivedData et à l'aperçu du gain
 * de niveau (PersonnageSheet#tauxPourNiveau), pour que les deux ne divergent plus.
 *
 * Le plafond (GW.plafondCompetence, relevé du bonus racial positif) porte sur la valeur hors effet ; l'effet actif
 * (traits, talents) s'ajoute ensuite : un bonus d'effet dépasse donc le plafond (règle de l'auteur, 2026-09-24 :
 * « à part avec des effets ou une ethnie, une compétence ne peut pas dépasser 90 % »), et un malus d'effet ne peut
 * pas être effacé par l'expérience. Pour un effet positif e : min(90 + e, x + e) = min(90, x) + e.
 *
 * @param {object} donnees
 * @param {number} donnees.caracteristique total de la caractéristique liée
 * @param {number} donnees.modulation niveau + racial + (métier + ajustement + malus hors métier, jamais négatif)
 * @param {number} donnees.racial bonus / malus racial de la compétence
 * @param {number} donnees.effet bonus des effets actifs (system.effets.competences)
 * @returns {{ horsEffets: number, total: number, atteintPlafond: boolean }}
 */
export function tauxCompetence({ caracteristique, modulation, racial, effet }) {
  const plafond = GW.plafondCompetence + Math.max(0, racial);
  const horsEffets = Math.min(plafond, Math.max(0, caracteristique + modulation));
  return {
    horsEffets,
    total: Math.max(0, horsEffets + effet),
    // Même seuil qu'avant (90 %), mais sur la valeur hors effet : un effet ne bloque ni l'ajustement ni l'expérience.
    atteintPlafond: horsEffets >= GW.plafondCompetence
  };
}
