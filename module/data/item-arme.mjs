import { champsObjet } from "./objet-base.mjs";

const { StringField, BooleanField } = foundry.data.fields;

export class ArmeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...champsObjet(),
      // Formule de dés, ex. "2d8", "1d4+2" — peut contenir du texte après la formule
      // (ex. "3d6 + explosion") : le jet de dégâts ne lance que la partie valide.
      degats: new StringField({ required: true, initial: "1d6" }),
      // Clé GW.competences utilisée pour l'attaque ("" = aucune, attaque impossible).
      competence: new StringField({ initial: "blaster", blank: true }),
      // Clé GW.caracteristiquesRapides jouée par une fiche rapide / un PNJ (v0.26.0) ; "" = déduite de la compétence
      // (GW.caracteristiqueRapideParCompetence, voir GalacticWarsItem#caracteristiqueArme).
      caracteristique: new StringField({ initial: "", blank: true }),
      instable: new BooleanField({ initial: false }),
      portee: new StringField({ initial: "" }) // texte libre (ex. "courte", "20 m")
    };
  }
}
