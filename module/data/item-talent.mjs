const { StringField, HTMLField } = foundry.data.fields;

export class TalentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      avantage: new StringField({ initial: "" }),
      inconvenient: new StringField({ initial: "" }),
      description: new HTMLField({ initial: "" })
    };
  }
}
