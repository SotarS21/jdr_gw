const { StringField, HTMLField, BooleanField } = foundry.data.fields;

export class ArmeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      degats: new StringField({ required: true, initial: "1d6" }), // notation dé, ex. "2d8", "1d4+2"
      competence: new StringField({ initial: "blaster" }), // clé GW.competences utilisée pour l'attaque
      instable: new BooleanField({ initial: false }),
      prix: new StringField({ initial: "" }), // en crédits, texte libre (ex. "1200c", "NA" = non achetable)
      description: new HTMLField({ initial: "" })
    };
  }
}
