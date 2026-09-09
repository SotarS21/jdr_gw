const { SchemaField, NumberField, HTMLField } = foundry.data.fields;

function modificateur() {
  return new NumberField({ required: true, integer: true, initial: 0 });
}

export class RaceData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      modificateursCaracteristiques: new SchemaField({
        corps: modificateur(),
        mental: modificateur(),
        dexterite: modificateur()
      }),
      // Bonus/malus raciaux ponctuels sur des compétences précises, ex. { perception: 80, sangFroid: -10 }.
      modificateursCompetences: new foundry.data.fields.ObjectField({ initial: {} }),
      armureNaturelle: modificateur(),
      description: new HTMLField({ initial: "" })
    };
  }
}
