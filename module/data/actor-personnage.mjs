import { GW } from "../config.mjs";
import { completerCompetences } from "../helpers/migration.mjs";

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

      // Description libre du personnage (onglet Informations, avec les champs de `infos`).
      description: new HTMLField({ initial: "" }),

      niveau: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),

      race: new SchemaField({
        uuid: new StringField({ required: false, blank: true, initial: "" }),
        nom: new StringField({ initial: "" })
      }),
      metier: new SchemaField({
        uuid: new StringField({ required: false, blank: true, initial: "" }),
        nom: new StringField({ initial: "" })
      }),
      // Vaisseau sur lequel vole le personnage (acteur du monde de type « vaisseau », déposé sur la fiche) :
      // lien affiché dans l'onglet Équipements. `nom` sert de repli si l'acteur a été supprimé.
      vaisseau: new SchemaField({
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
          // Bonus manuel additionnel, réglable directement par le joueur (ex. lors d'un
          // level up) sans écraser le calcul automatique niveau + caractéristique.
          ajustement: new NumberField({ required: true, integer: true, initial: 0 }),
          acquiseParMetier: new BooleanField({ initial: false }),
          // Recommandée par le métier actuel selon les documents sources (métier.competences[].obligatoire).
          recommandee: new BooleanField({ initial: false }),
          // Déblocage MJ d'une compétence réservée (GW.competences[cle].reservee) que le métier
          // actuel n'accorde pas. Conservé si le métier change.
          debloquee: new BooleanField({ initial: false }),
          // Compétence mise en favori par le joueur (panneau Favoris de l'onglet Personnage).
          favori: new BooleanField({ initial: false })
        })
      ),

      pv: ressource(10),
      // Ressource dépensable (une seule valeur, pas de maximum) : seul .value est affiché et
      // utilisé ; .max est conservé dans le schéma pour ne pas migrer les données existantes.
      pointsDeForce: ressource(0),
      // Plus affiché sur la fiche (retiré à la demande de l'auteur, futur système d'états actifs) ;
      // conservé dans le schéma pour ne pas perdre les valeurs existantes.
      stress: ressource(0),
      // Remplace l'ancien curseur unique -100..100 : deux réserves de points dépensables
      // séparées (jamais les deux à la fois sur un même jet — voir rollCompetence).
      lumiere: new NumberField({ required: true, integer: true, min: 0, max: 10, initial: 0 }),
      obscurite: new NumberField({ required: true, integer: true, min: 0, max: 10, initial: 0 }),
      credits: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),

      sensibleForce: new BooleanField({ initial: false }),

      portrait: new FilePathField({ categories: ["IMAGE"], initial: "icons/svg/mystery-man.svg" }),
      // Onglet Notes. Ces listes ne sont modifiées que par la fenêtre d'édition
      // (helpers/notes.mjs, remplacement du tableau complet) — jamais via le formulaire.
      // Ancien résumé unique : remplacé par `resumes`, repris par la migration puis vidé.
      resume: new HTMLField({ initial: "" }),
      // Résumés : titre, description, date (ms) posée à la création et à chaque modification.
      resumes: new ArrayField(
        new SchemaField({
          titre: new StringField({ initial: "" }),
          description: new HTMLField({ initial: "" }),
          date: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
        })
      ),
      // Sous-onglet « Infos » (nom historique conservé : notes existantes préservées).
      notes: new ArrayField(
        new SchemaField({
          titre: new StringField({ initial: "" }),
          contenu: new HTMLField({ initial: "" }),
          motsCles: new ArrayField(new StringField({ blank: false }))
        })
      ),
      pnjs: new ArrayField(
        new SchemaField({
          nom: new StringField({ initial: "" }),
          sousTitre: new StringField({ initial: "" }),
          img: new FilePathField({ categories: ["IMAGE"], blank: true, initial: "" }),
          description: new HTMLField({ initial: "" }),
          statut: new StringField({ initial: "neutre", choices: () => GW.statutsPnj }),
          // Nom du métier qui a créé ce contact (équipement de départ, helpers/objets-depart.mjs) ; "" = PNJ du
          // joueur. La fenêtre d'édition des Notes réécrit l'entrée sans ce champ : un contact modifié par le
          // joueur lui appartient et n'est plus remplacé au changement de métier.
          origineMetier: new StringField({ initial: "" })
        })
      ),
      missions: new ArrayField(
        new SchemaField({
          titre: new StringField({ initial: "" }),
          description: new HTMLField({ initial: "" }),
          importance: new StringField({ initial: "secondaire", choices: () => GW.importancesMission }),
          statut: new StringField({ initial: "aFaire", choices: () => GW.statutsMission })
        })
      )
    };
  }

  /**
   * Un personnage naît avec toutes ses compétences (GW.competences) : sans ça, le tableau (ArrayField sans initial)
   * restait vide jusqu'au prochain rechargement du monde par un MJ (runMigrations).
   * Les entrées déjà présentes (import de compendium, duplication) sont conservées.
   * @override
   */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) return false;
    const competences = completerCompetences(this.toObject().competences);
    if (competences) this.parent.updateSource({ "system.competences": competences });
  }

  /** @override */
  prepareDerivedData() {
    for (const car of Object.values(this.caracteristiques)) {
      car.total = car.base + car.racial;
    }

    const metierActuel = this.metier?.uuid ? fromUuidSync(this.metier.uuid) : null;

    for (const competence of this.competences) {
      const def = GW.competences[competence.cle];
      // Compétence réservée à d'autres métiers : niveau compté 0 et jet impossible, sans
      // toucher au niveau enregistré (retrouvé tel quel si le MJ la débloque).
      competence.estReservee = !!def?.reservee;
      competence.bloquee = competence.estReservee && !competence.acquiseParMetier && !competence.debloquee;
      const niveauEffectif = competence.bloquee ? 0 : competence.niveau;
      const base = GW.baremeNiveauCompetence[niveauEffectif] ?? 0;
      const bonusCaracteristique = this.caracteristiques[def?.caracteristique]?.total ?? 0;
      let malus = 0;
      if (def && !competence.acquiseParMetier) {
        malus = def.metier ? -30 : -10;
      }
      // Règle de l'auteur (2026-09-26) : le bonus de niveau s'ajoute toujours ; le bonus / malus racial s'applique
      // toujours (même sous la caractéristique) ; le malus hors métier ne s'applique qu'au niveau 0 et, avec le bonus
      // de métier et l'ajustement, ne fait jamais descendre sous la caractéristique.
      const horsMetier = niveauEffectif === 0 ? malus : 0;
      const modulation = base + competence.racial + Math.max(0, competence.metier + competence.ajustement + horsMetier);
      // Plafond à 90 % (GW.plafondCompetence), relevé du seul bonus racial positif : « à part avec des
      // effets ou une ethnie, une compétence ne peut pas dépasser 90 % » (règle de l'auteur, 2026-09-24).
      const plafond = GW.plafondCompetence + Math.max(0, competence.racial);
      competence.total = Math.min(plafond, Math.max(0, bonusCaracteristique + modulation));
      competence.atteintPlafond = competence.total >= GW.plafondCompetence;
      competence.label = def?.label ?? competence.cle;
      competence.caracteristique = def?.caracteristique;
      competence.estCompetenceMetier = def?.metier ?? false;
      competence.estCompetenceForce = def?.force ?? false;
    }

    void metierActuel;
  }
}
