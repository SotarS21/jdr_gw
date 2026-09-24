/** Image par défaut d'un acteur (portrait des DataModels, img de Foundry). */
const IMAGE_DEFAUT = "icons/svg/mystery-man.svg";

export class GalacticWarsActor extends Actor {
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  /**
   * Image unique d'un acteur : portrait de la fiche (`system.portrait`), image de l'acteur (`img`) et
   * image du token (`prototypeToken.texture.src`) restent identiques (demande de l'auteur, 2026-09-24).
   * Priorité au portrait s'il est personnalisé, sinon à l'image de l'acteur. `null` = rien à unifier.
   * @param {string} [portrait]
   * @param {string} [img]
   * @returns {string|null}
   */
  static imageUnique(portrait, img) {
    if (portrait && portrait !== IMAGE_DEFAUT) return portrait;
    if (img && img !== IMAGE_DEFAUT) return img;
    return null;
  }

  /** Les trois champs à écrire pour une image donnée. */
  static champsImage(image) {
    return { img: image, "system.portrait": image, "prototypeToken.texture.src": image };
  }

  /** Vrai si le type d'acteur a un portrait (les 4 fiches du système). */
  get aUnPortrait() {
    return this.system && "portrait" in this.system;
  }

  /** @override */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) return false;
    if (!this.aUnPortrait) return;
    const image = GalacticWarsActor.imageUnique(this.system.portrait, this.img);
    if (image) this.updateSource(GalacticWarsActor.champsImage(image));
  }

  /** @override */
  async _preUpdate(changes, options, user) {
    if ((await super._preUpdate(changes, options, user)) === false) return false;
    if (!this.aUnPortrait) return;
    const portrait = foundry.utils.getProperty(changes, "system.portrait");
    const img = changes.img;
    // Le portrait (fiche) l'emporte s'il change ; sinon l'image de l'acteur (répertoire, import…).
    const image = portrait !== undefined && portrait !== this.system.portrait ? portrait
      : img !== undefined && img !== this.img ? img
      : undefined;
    if (!image) return;
    for (const [chemin, valeur] of Object.entries(GalacticWarsActor.champsImage(image))) {
      foundry.utils.setProperty(changes, chemin, valeur);
    }
    // Pour _onUpdate : ancienne image, afin de mettre aussi à jour les tokens déjà posés qui l'affichent.
    options.gwAncienneImage = this.prototypeToken.texture.src || this.img;
  }

  /** @override */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    // Une seule fois (client auteur de la modification) : tokens posés sur les scènes.
    if (userId !== game.user.id || !("gwAncienneImage" in options)) return;
    const image = this.img;
    for (const scene of game.scenes) {
      const tokens = scene.tokens.filter((t) => t.actorId === this.id
        && (t.actorLink || t.texture.src === options.gwAncienneImage) && t.texture.src !== image && t.isOwner);
      if (tokens.length) {
        scene.updateEmbeddedDocuments("Token", tokens.map((t) => ({ _id: t.id, "texture.src": image })))
          .catch((err) => console.warn("Galactic Wars | Image des tokens non mise à jour :", err));
      }
    }
  }
}
