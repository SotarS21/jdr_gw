const { StringField, NumberField, HTMLField } = foundry.data.fields;

export class PouvoirData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      coutPointsDeForce: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      competence: new StringField({ initial: "controleTelekinetique" }), // clé GW.competences associée
      description: new HTMLField({ initial: "" })
    };
  }
}
