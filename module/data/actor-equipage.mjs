const { SchemaField, ArrayField, NumberField, StringField, HTMLField, FilePathField } = foundry.data.fields;

/**
 * Équipage (v0.17.0, sur le modèle de l'acteur « Groupe » de Pathfinder 2) : les personnages qui voyagent ensemble,
 * leurs crédits mis en commun, une réserve d'objets partagée (les objets portés par l'acteur Équipage lui-même) et
 * le vaisseau de l'équipage. Voir helpers/equipage.mjs pour les transferts.
 */
export class EquipageData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      // UUID des acteurs membres (personnages, fiches rapides, sith, PNJ alliés), dans l'ordre d'affichage.
      membres: new ArrayField(new StringField({ blank: false })),
      vaisseau: new SchemaField({
        uuid: new StringField({ required: false, blank: true, initial: "" }),
        nom: new StringField({ initial: "" })
      }),
      credits: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      portrait: new FilePathField({ categories: ["IMAGE"], initial: "icons/svg/mystery-man.svg" }),
      description: new HTMLField({ initial: "" })
    };
  }
}
