import { champsObjet } from "./objet-base.mjs";

const { StringField, NumberField } = foundry.data.fields;

/** Armure ou bouclier (emplacement "bouclier", choix de l'auteur) : même réduction, cumulable. */
export class ArmureData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...champsObjet(),
      reduction: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      emplacement: new StringField({ initial: "plastron" }) // clé GW.emplacementsArmure
    };
  }
}
