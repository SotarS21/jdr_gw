const { StringField, HTMLField, BooleanField } = foundry.data.fields;
const FICHES = ["toutes", "classique", "rapide"]; // voir GW.fichesTrait

export class TalentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      avantage: new StringField({ initial: "" }),
      inconvenient: new StringField({ initial: "" }),
      // Fiche visée (v0.20.0) : un trait chiffré existe en deux variantes, % (classique) et d20 (rapide / PNJ).
      fiche: new StringField({ required: true, initial: "toutes", choices: FICHES }),
      // Trait actif (v0.20.1) : à déclencher en jeu ; ses effets, désactivés par défaut, s'allument depuis la fiche.
      actif: new BooleanField({ initial: false }),
      description: new HTMLField({ initial: "" })
    };
  }
}
