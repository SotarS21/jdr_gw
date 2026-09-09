const { StringField, NumberField, HTMLField } = foundry.data.fields;

export class ArmureData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      reduction: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      emplacement: new StringField({ initial: "plastron" }),
      description: new HTMLField({ initial: "" })
    };
  }
}
