import { champsObjet } from "./objet-base.mjs";

const { StringField } = foundry.data.fields;

export class EquipementData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...champsObjet(),
      // Clé de GW.appareils ("" = équipement ordinaire) : "datapad" ajoute l'onglet Holonet.
      appareil: new StringField({ initial: "", blank: true })
    };
  }
}
