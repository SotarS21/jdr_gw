const { StringField, NumberField, HTMLField } = foundry.data.fields;

export class EquipementData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      quantite: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      prix: new StringField({ initial: "" }), // en crédits, texte libre (ex. "150c", "NA" = non achetable)
      description: new HTMLField({ initial: "" })
    };
  }
}
