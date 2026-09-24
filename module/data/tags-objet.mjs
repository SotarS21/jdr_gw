const { SchemaField, BooleanField } = foundry.data.fields;

/** Tags d'objet partagés par armes, armures et équipements (voir GW.tagsObjet). */
export function tagsObjet() {
  return new SchemaField({
    cache: new BooleanField({ initial: false })
  });
}
