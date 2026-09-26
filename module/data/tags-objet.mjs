const { SchemaField, BooleanField } = foundry.data.fields;

/** Tags d'objet partagés par armes, armures et équipements (voir GW.tagsObjet). */
export function tagsObjet() {
  return new SchemaField({
    cache: new BooleanField({ initial: false }),
    // Endommagé (suivi de l'auteur n° 22) : l'objet ne peut plus être porté tant qu'il n'est pas réparé.
    endommage: new BooleanField({ initial: false })
  });
}
