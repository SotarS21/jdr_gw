const { StringField, NumberField, HTMLField } = foundry.data.fields;

export class EquipementData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      quantite: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      description: new HTMLField({ initial: "" })
    };
  }
}
