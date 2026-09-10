const { SchemaField, ArrayField, NumberField, StringField, BooleanField, HTMLField, FilePathField } = foundry.data.fields;

/**
 * Fiche de vaisseau (voir Prétirer sith/Vaiseau destroyer sith.docx, seul vaisseau détaillé
 * du matériel source) : pas de mécanique de combat spatial automatisée dans le système (pas
 * plus que pour les armes de personnage — voir item-arme.mjs), cette fiche est un stat-block/
 * suivi géré narrativement par le MJ (PV de coque, bouclier, armement, équipage, cases de
 * déplacement avant "tomber en rade").
 */
export class VaisseauData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      classe: new StringField({ initial: "" }), // ex. "Destroyer stellaire"
      taille: new StringField({ initial: "" }), // texte libre, ex. "300 m de long"

      pv: new SchemaField({
        actuels: new NumberField({ required: true, integer: true, initial: 0 }),
        max: new NumberField({ required: true, integer: true, initial: 0 })
      }),
      bouclier: new SchemaField({
        actif: new BooleanField({ initial: true }),
        points: new NumberField({ required: true, integer: true, initial: 0 }),
        reduction: new NumberField({ required: true, integer: true, initial: 0 }) // ex. 2 = dégâts / 2 tant qu'actif
      }),
      moteur: new SchemaField({
        deplacement: new NumberField({ required: true, integer: true, initial: 0 }) // cases avant de tomber en rade
      }),

      armement: new ArrayField(
        new SchemaField({
          nom: new StringField({ initial: "" }),
          degats: new StringField({ initial: "" }), // notation dé ou valeur fixe, texte libre
          quantite: new NumberField({ required: true, integer: true, initial: 1 })
        })
      ),
      equipage: new ArrayField(
        new SchemaField({
          role: new StringField({ initial: "" }),
          nom: new StringField({ initial: "" }),
          description: new StringField({ initial: "" })
        })
      ),

      soute: new StringField({ initial: "" }),
      equipementsEmbarques: new StringField({ initial: "" }), // navette, pods de sauvetage, réserves, quartiers...

      portrait: new FilePathField({ categories: ["IMAGE"], initial: "icons/svg/mystery-man.svg" }),
      description: new HTMLField({ initial: "" })
    };
  }
}
