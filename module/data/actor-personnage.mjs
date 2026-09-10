import { GW } from "../config.mjs";

const { SchemaField, NumberField, StringField, HTMLField, ArrayField, BooleanField, FilePathField } = foundry.data.fields;

function ressource(initial = 0) {
  return new SchemaField({
    value: new NumberField({ required: true, integer: true, initial }),
    max: new NumberField({ required: true, integer: true, initial })
  });
}

function caracteristique() {
  return new SchemaField({
    base: new NumberField({ required: true, integer: true, initial: 0 }),
    racial: new NumberField({ required: true, integer: true, initial: 0 })
  });
}

export class PersonnageData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      infos: new SchemaField({
        age: new StringField({ initial: "" }),
        taille: new StringField({ initial: "" }),
        sexe: new StringField({ initial: "" }),
        couleurCheveux: new StringField({ initial: "" }),
        couleurPeau: new StringField({ initial: "" }),
        couleurYeux: new StringField({ initial: "" })
      }),

      niveau: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),

      race: new SchemaField({
        uuid: new StringField({ required: false, blank: true, initial: "" }),
        nom: new StringField({ initial: "" })
      }),
      metier: new SchemaField({
        uuid: new StringField({ required: false, blank: true, initial: "" }),
        nom: new StringField({ initial: "" })
      }),

      caracteristiques: new SchemaField({
        corps: caracteristique(),
        mental: caracteristique(),
        dexterite: caracteristique()
      }),

      // Une entrée par clé de GW.competences (voir module/config.mjs).
      competences: new ArrayField(
        new SchemaField({
          cle: new StringField({ required: true }),
          niveau: new NumberField({ required: true, integer: true, min: 0, max: 3, initial: 0 }),
          racial: new NumberField({ required: true, integer: true, initial: 0 }),
          metier: new NumberField({ required: true, integer: true, initial: 0 }),
          acquiseParMetier: new BooleanField({ initial: false })
        })
      ),

      pv: ressource(10),
      pointsDeForce: ressource(0),
      stress: ressource(0),
      alignement: new NumberField({ required: true, integer: true, min: -100, max: 100, initial: 0 }),
      credits: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),

      portrait: new FilePathField({ categories: ["IMAGE"], initial: "icons/svg/mystery-man.svg" }),
      biographie: new HTMLField({ initial: "" })
    };
  }

  /** @override */
  prepareDerivedData() {
    for (const car of Object.values(this.caracteristiques)) {
      car.total = car.base + car.racial;
    }

    const metierActuel = this.metier?.uuid ? fromUuidSync(this.metier.uuid) : null;

    for (const competence of this.competences) {
      const def = GW.competences[competence.cle];
      const base = ({ 0: 0, 1: 5, 2: 10, 3: 20 })[competence.niveau] ?? 0;
      let malus = 0;
      if (def && !competence.acquiseParMetier) {
        malus = def.metier ? -30 : -10;
      }
      competence.total = Math.max(0, base + competence.racial + competence.metier + malus);
      competence.label = def?.label ?? competence.cle;
      competence.estCompetenceMetier = def?.metier ?? false;
      competence.estCompetenceForce = def?.force ?? false;
    }

    void metierActuel;
  }
}
