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
      prix: new StringField({ initial: "" }), // en crédits, texte libre (vide = non achetable/vaisseau de scénario)

      pv: new SchemaField({
        actuels: new NumberField({ required: true, integer: true, initial: 0 }),
        max: new NumberField({ required: true, integer: true, initial: 0 })
      }),
      bouclier: new SchemaField({
        actif: new BooleanField({ initial: true }),
        points: new NumberField({ required: true, integer: true, initial: 0 }),
        // Points de bouclier à pleine charge (jauge de la fiche) ; repris des points actuels par migrateData.
        max: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        reduction: new NumberField({ required: true, integer: true, initial: 0 }) // ex. 2 = dégâts / 2 tant qu'actif
      }),
      moteur: new SchemaField({
        deplacement: new NumberField({ required: true, integer: true, initial: 0 }) // cases avant de tomber en rade
      }),

      // Ancien armement texte (avant la v0.16.0) : l'armement est désormais fait d'objets « arme » portés par le
      // vaisseau (helpers/armement-vaisseau.mjs). Conservé pour la conversion (bouton de la fiche, correctif MJ).
      armement: new ArrayField(
        new SchemaField({
          nom: new StringField({ initial: "" }),
          degats: new StringField({ initial: "" }), // notation dé ou valeur fixe, texte libre
          quantite: new NumberField({ required: true, integer: true, initial: 1 }),
          emplacement: new StringField({ initial: "" }) // texte libre, ex. "Avant-Gauche, Avant-Droite"
        })
      ),
      // Un poste (rôle, nombre de places, description) et les noms de ceux qui l'occupent : seuls les noms passent
      // par le formulaire (VaisseauSheet#_processFormData les fusionne), le reste par la fenêtre d'édition.
      equipage: new ArrayField(
        new SchemaField({
          role: new StringField({ initial: "" }),
          places: new NumberField({ required: true, integer: true, min: 1, max: 20, initial: 1 }),
          noms: new ArrayField(new StringField({ initial: "" })),
          // Acteur déposé sur une place (même index que `noms`) ; "" = nom saisi à la main.
          uuids: new ArrayField(new StringField({ blank: true, initial: "" })),
          // Ancien nom unique, repris dans `noms` par migrateData.
          nom: new StringField({ initial: "" }),
          description: new StringField({ initial: "" })
        })
      ),

      soute: new StringField({ initial: "" }),
      // Aménagements (sanitaire, navette, pods de sauvetage…), édités par fenêtre en mode Édition.
      amenagements: new ArrayField(
        new SchemaField({
          nom: new StringField({ initial: "" }),
          description: new StringField({ initial: "" })
        })
      ),
      // Ancien texte libre, découpé en `amenagements` par migrateData ; plus affiché.
      equipementsEmbarques: new StringField({ initial: "" }),

      portrait: new FilePathField({ categories: ["IMAGE"], initial: "icons/svg/mystery-man.svg" }),
      description: new HTMLField({ initial: "" })
    };
  }

  /**
   * @override — v0.16.0 : bouclier.max (jauge), equipage[].noms / uuids (plusieurs places par poste), amenagements
   * (découpage brut de l'ancien texte ; ceux du compendium sont rédigés à la main).
   * Jamais sur une mise à jour partielle : `{ bouclier: { points } }` seul y remettrait le maximum aux points.
   */
  static migrateData(source, options) {
    if (!options?.partial) {
      if (source.bouclier && source.bouclier.max === undefined) {
        source.bouclier.max = Math.max(0, source.bouclier.points ?? 0);
      }
      if (source.amenagements === undefined && typeof source.equipementsEmbarques === "string") {
        source.amenagements = source.equipementsEmbarques.split(/\s*[,;.\n]\s*/).filter(Boolean)
          .map((nom) => ({ nom: nom.charAt(0).toUpperCase() + nom.slice(1), description: "" }));
      }
    }
    for (const poste of source.equipage ?? []) {
      if (!Array.isArray(poste.noms)) poste.noms = poste.nom ? [poste.nom] : [];
      if (!Array.isArray(poste.uuids)) poste.uuids = [];
    }
    return super.migrateData(source, options);
  }
}
