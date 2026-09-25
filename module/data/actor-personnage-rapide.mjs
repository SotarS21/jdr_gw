import { GW } from "../config.mjs";

const { SchemaField, NumberField, StringField, HTMLField, FilePathField } = foundry.data.fields;

function caracteristiqueRapide() {
  return new NumberField({ required: true, integer: true, min: 0, initial: 0 });
}

/**
 * Fiche de personnage "partie rapide" : 8 caractéristiques directes (pas de %, voir
 * module/helpers/rolls.mjs::rollCaracteristiqueD20 — 1d20 sous la valeur), une Survie qui
 * reste en pourcentage (1d100, comme la fiche classique), un métier (équipement +
 * description de son talent signature) et un Talent générique séparé.
 */
export class PersonnageRapideData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      infos: new SchemaField({
        nom: new StringField({ initial: "" }),
        prenom: new StringField({ initial: "" })
      }),

      race: new SchemaField({
        uuid: new StringField({ required: false, blank: true, initial: "" }),
        nom: new StringField({ initial: "" })
      }),
      metier: new SchemaField({
        uuid: new StringField({ required: false, blank: true, initial: "" }),
        nom: new StringField({ initial: "" }),
        // Auto-rempli depuis le talent signature du métier à l'application, éditable ensuite.
        description: new StringField({ initial: "" })
      }),
      talent: new SchemaField({
        nom: new StringField({ initial: "" }),
        description: new StringField({ initial: "" })
      }),

      caracteristiques: new SchemaField({
        force: caracteristiqueRapide(),
        capCombat: caracteristiqueRapide(),
        capTir: caracteristiqueRapide(),
        dexterite: caracteristiqueRapide(),
        mentale: caracteristiqueRapide(),
        perception: caracteristiqueRapide(),
        stress: caracteristiqueRapide(),
        affForce: caracteristiqueRapide()
      }),

      survie: new SchemaField({
        base: new NumberField({ required: true, integer: true, initial: 0 }),
        racial: new NumberField({ required: true, integer: true, initial: 0 })
      }),

      // PV (demande de l'auteur, 2026-09-25) : dégâts appliqués depuis le tchat, état Inconscient à 0.
      pv: new SchemaField({
        value: new NumberField({ required: true, integer: true, min: 0, initial: 10 }),
        max: new NumberField({ required: true, integer: true, min: 0, initial: 10 })
      }),

      equipement: new StringField({ initial: "" }),
      credits: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      portrait: new FilePathField({ categories: ["IMAGE"], initial: "icons/svg/mystery-man.svg" }),
      description: new HTMLField({ initial: "" })
    };
  }

  /** @override */
  prepareDerivedData() {
    this.survie.total = Math.max(0, this.survie.base + this.survie.racial);

    this.totalCaracteristiques = Object.values(this.caracteristiques).reduce((total, v) => total + v, 0);
    const limites = GW.limitesCaracteristiquesRapides;
    this.depasseLimiteTotale = this.totalCaracteristiques > limites.totalMax;
    this.nombreAuPlafond = Object.values(this.caracteristiques).filter((v) => v >= limites.valeurPlafond).length;
    this.depasseLimitePlafond = this.nombreAuPlafond > limites.nombreMaxAuPlafond;
  }
}
