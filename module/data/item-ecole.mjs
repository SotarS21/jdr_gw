const { SchemaField, StringField, ArrayField, HTMLField } = foundry.data.fields;

/**
 * École sith jouable (voir École de sith jouable.docx) : Assassin sith, Sorcière sith,
 * Guerrier sith, Inquisiteur sith, Héraut sith, Magicien, Maître d'armes, Bulldozer.
 * Chaque école accorde 2-3 capacités spéciales nommées et parfois un équipement/vaisseau
 * de départ.
 */
export class EcoleData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      capacites: new ArrayField(
        new SchemaField({
          nom: new StringField({ required: true }),
          description: new StringField({ required: true })
        })
      ),
      equipementDepart: new StringField({ initial: "" }),
      description: new HTMLField({ initial: "" })
    };
  }
}
