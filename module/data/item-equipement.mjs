import { champsObjet } from "./objet-base.mjs";

const { StringField, BooleanField, NumberField, ArrayField, SchemaField } = foundry.data.fields;

export class EquipementData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...champsObjet(),
      // Clé de GW.appareils ("" = équipement ordinaire) : "datapad" ajoute l'onglet Holonet.
      appareil: new StringField({ initial: "", blank: true }),
      // Soin rendu au porteur par le bouton « Utiliser » de la carte de tchat : nombre de PV ("4"),
      // formule ("1d4") ou "max" (tous les PV). Vide = pas un objet de soin.
      soin: new StringField({ initial: "", blank: true }),
      // Comlink (appareil "comlink") : canaux numérotés et, si `messagerie` (comlink ++), leurs messages.
      // ArrayField : toujours réécrit en entier (helpers/comlink.mjs), jamais par index.
      comlink: new SchemaField({
        messagerie: new BooleanField({ initial: false }),
        canaux: new ArrayField(new SchemaField({
          numero: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
          nom: new StringField({ initial: "" }), // nom du contact
          actif: new BooleanField({ initial: true }),
          archive: new BooleanField({ initial: false }),
          messages: new ArrayField(new SchemaField({
            auteur: new StringField({ initial: "pj", choices: ["pj", "mj"] }),
            nom: new StringField({ initial: "" }),
            texte: new StringField({ initial: "" }),
            vu: new BooleanField({ initial: false })
          }))
        }))
      })
    };
  }
}
