import { champsObjet } from "./objet-base.mjs";

const { StringField } = foundry.data.fields;

export class EquipementData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...champsObjet(),
      // Clé de GW.appareils ("" = équipement ordinaire) : "datapad" ajoute l'onglet Holonet.
      appareil: new StringField({ initial: "", blank: true }),
      // Soin rendu au porteur par le bouton « Utiliser » de la carte de tchat : nombre de PV ("4"),
      // formule ("1d4") ou "max" (tous les PV). Vide = pas un objet de soin.
      soin: new StringField({ initial: "", blank: true })
    };
  }
}
