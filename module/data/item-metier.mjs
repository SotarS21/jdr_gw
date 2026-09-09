const { SchemaField, StringField, NumberField, HTMLField, ArrayField, BooleanField } = foundry.data.fields;

export class MetierData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      prerequis: new SchemaField({
        metier: new StringField({ initial: "" }), // nom du métier requis, ex. "Padawan"
        niveauMinimum: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        texteLibre: new StringField({ initial: "" }) // ex. "affiliation => empire / république / privé"
      }),
      // Compétences accordées par le métier : { cle, bonus, obligatoire }
      competences: new ArrayField(
        new SchemaField({
          cle: new StringField({ required: true }),
          bonus: new NumberField({ required: true, integer: true, initial: 0 }),
          obligatoire: new BooleanField({ initial: true })
        })
      ),
      // Équipement de départ, une entrée par objet (nom libre + quantité) — création d'Items séparée à l'application.
      equipement: new ArrayField(
        new SchemaField({
          nom: new StringField({ required: true }),
          quantite: new NumberField({ required: true, integer: true, min: 1, initial: 1 })
        })
      ),
      talent: new SchemaField({
        nom: new StringField({ initial: "" }),
        description: new StringField({ initial: "" })
      }),
      description: new HTMLField({ initial: "" })
    };
  }
}
