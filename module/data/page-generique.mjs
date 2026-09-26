const { StringField, FilePathField } = foundry.data.fields;

/**
 * Page de journal « Générique » (v0.18.0) : le texte du générique façon intro spatiale, diffusé par le MJ à tous les
 * joueurs (apps/generique.mjs). Maquette validée par l'auteur : https://claude.ai/artifact/JRU8AwQ4TW15FLA1Um8KrW
 */
export class GeneriqueData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      episode: new StringField({ initial: "Épisode I" }),
      titre: new StringField({ initial: "" }),
      ouverture: new StringField({ initial: "Il y a longtemps, dans une galaxie lointaine, très lointaine…" }),
      // Texte brut : un paragraphe par ligne vide.
      texte: new StringField({ initial: "" }),
      vitesse: new StringField({ initial: "normale", choices: { lente: "", normale: "", rapide: "" } }),
      musique: new FilePathField({ categories: ["AUDIO"], blank: true, initial: "" }),
      fond: new FilePathField({ categories: ["IMAGE"], blank: true, initial: "" })
    };
  }

  /** Données envoyées aux joueurs pour jouer le générique. */
  get diffusion() {
    return {
      episode: this.episode,
      titre: this.titre,
      ouverture: this.ouverture,
      paragraphes: this.texte.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
      vitesse: { lente: 0.7, normale: 1, rapide: 1.6 }[this.vitesse] ?? 1,
      musique: this.musique,
      fond: this.fond
    };
  }
}
