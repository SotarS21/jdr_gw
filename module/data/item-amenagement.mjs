const { StringField, NumberField, HTMLField } = foundry.data.fields;

/**
 * Aménagement de vaisseau (v0.19.0, suivi de l'auteur n° 12-13) : infirmerie, cabine, soute agrandie, bouclier
 * renforcé… Porté par l'acteur vaisseau, il occupe `modules` modules sur les `system.modules` du vaisseau. Effet
 * décrit, appliqué par le MJ (pas de mécanique automatique). Un aménagement d'origine vaut 0c et 1 module (v0.19.1).
 */
export class AmenagementData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      prix: new StringField({ initial: "" }), // en crédits, texte libre ; "" = d'origine
      modules: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      description: new HTMLField({ initial: "" }),
      notesMJ: new HTMLField({ initial: "" })
    };
  }
}
