import { tagsObjet } from "./tags-objet.mjs";
const { StringField, NumberField, HTMLField } = foundry.data.fields;

export class ArmureData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      reduction: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      emplacement: new StringField({ initial: "plastron" }),
      prix: new StringField({ initial: "" }), // en crédits, texte libre (ex. "1200c", "NA" = non achetable)
      tags: tagsObjet(),
      description: new HTMLField({ initial: "" })
    };
  }
}
