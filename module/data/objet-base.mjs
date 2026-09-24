import { tagsObjet } from "./tags-objet.mjs";

const { StringField, NumberField, HTMLField, BooleanField } = foundry.data.fields;

/**
 * Champs communs aux objets d'inventaire (arme, armure, équipement).
 * `porte` : l'objet est porté (utilisable : attaque, réduction comptée) ou rangé. Faux par
 * défaut, y compris pour les objets déjà présents (choix de l'auteur, 2026-09-24).
 */
export function champsObjet() {
  return {
    quantite: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
    prix: new StringField({ initial: "" }), // en crédits, texte libre (ex. "150c", "NA" = non achetable)
    porte: new BooleanField({ initial: false }),
    tags: tagsObjet(),
    description: new HTMLField({ initial: "" }),
    // Notes réservées au MJ (affichées dans la fiche d'objet pour le MJ uniquement).
    notesMJ: new HTMLField({ initial: "" })
  };
}
