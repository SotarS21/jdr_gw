import { champsObjet } from "./objet-base.mjs";

export class EquipementData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return { ...champsObjet() };
  }
}
