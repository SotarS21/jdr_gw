import { GW } from "../config.mjs";

const { SchemaField, NumberField, StringField, HTMLField, FilePathField } = foundry.data.fields;

function modificateur() {
  return new NumberField({ required: true, integer: true, initial: 0 });
}

const PV_PAR_CORPULENCE = { maigrichon: 11, normal: 13, epais: 15, fort: 17 };

/**
 * Fiche de personnage sith prétirée (voir Prétirer sith/fiche perso sith prétirer.xlsx) :
 * système d20 additif — tout jet se fait en 1d20 + valeur, comparé à un DC fixé par le MJ
 * (pas de seuil de réussite auto-calculé, contrairement aux fiches classique/rapide).
 */
export class PersonnageSithData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      infos: new SchemaField({
        nom: new StringField({ initial: "" }),
        nomSith: new StringField({ initial: "" })
      }),

      race: new SchemaField({
        uuid: new StringField({ required: false, blank: true, initial: "" }),
        nom: new StringField({ initial: "" })
      }),
      ecole: new SchemaField({
        uuid: new StringField({ required: false, blank: true, initial: "" }),
        nom: new StringField({ initial: "" }),
        // Auto-rempli depuis les capacités de l'école à l'application, éditable ensuite.
        capacitesSpeciales: new StringField({ initial: "" })
      }),

      corpulence: new StringField({
        initial: "normal",
        choices: Object.keys(PV_PAR_CORPULENCE)
      }),

      pv: new SchemaField({
        actuels: new NumberField({ required: true, integer: true, initial: 13 })
      }),
      force: new SchemaField({
        value: new NumberField({ required: true, integer: true, initial: 0 }),
        max: new NumberField({ required: true, integer: true, initial: 0 })
      }),

      chance: modificateur(),
      survie: new SchemaField({
        chance: modificateur(),
        base: modificateur()
      }),

      caracteristiques: new SchemaField({
        physique: modificateur(),
        agilite: modificateur(),
        perception: modificateur(),
        mental: modificateur()
      }),

      // Les 7 compétences de force fixes de la fiche sith (aussi résolues en 1d20 + valeur).
      competencesForce: new SchemaField({
        telekinesie: modificateur(),
        pousseeDeForce: modificateur(),
        defense: modificateur(),
        illusion: modificateur(),
        persuasion: modificateur(),
        combatArme: modificateur(),
        furtivite: modificateur()
      }),

      equipement: new StringField({ initial: "" }),
      portrait: new FilePathField({ categories: ["IMAGE"], initial: "icons/svg/mystery-man.svg" }),
      description: new HTMLField({ initial: "" })
    };
  }

  /** @override */
  prepareDerivedData() {
    this.pv.max = PV_PAR_CORPULENCE[this.corpulence] ?? 13;
    this.survie.total = this.survie.chance + this.survie.base;

    const limites = GW.limitesCaracteristiquesSith;
    const valeurs = Object.values(this.caracteristiques);
    this.nombreAuPlafond = valeurs.filter((v) => v >= limites.valeurPlafond).length;
    this.depasseLimitePlafond = this.nombreAuPlafond > limites.nombreMaxAuPlafond;
  }
}
