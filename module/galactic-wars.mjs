import { GW } from "./config.mjs";
import { GalacticWarsActor } from "./documents/actor.mjs";
import { GalacticWarsItem } from "./documents/item.mjs";
import { PersonnageData } from "./data/actor-personnage.mjs";
import { PersonnageRapideData } from "./data/actor-personnage-rapide.mjs";
import { PersonnageSithData } from "./data/actor-personnage-sith.mjs";
import { RaceData } from "./data/item-race.mjs";
import { MetierData } from "./data/item-metier.mjs";
import { TalentData } from "./data/item-talent.mjs";
import { ArmeData } from "./data/item-arme.mjs";
import { ArmureData } from "./data/item-armure.mjs";
import { PouvoirData } from "./data/item-pouvoir.mjs";
import { EquipementData } from "./data/item-equipement.mjs";
import { EcoleData } from "./data/item-ecole.mjs";
import { PersonnageSheet } from "./sheets/personnage-sheet.mjs";
import { PersonnageRapideSheet } from "./sheets/personnage-rapide-sheet.mjs";
import { PersonnageSithSheet } from "./sheets/personnage-sith-sheet.mjs";
import { GalacticWarsItemSheet } from "./sheets/item-sheet.mjs";
import { runMigrations } from "./helpers/migration.mjs";

Hooks.once("init", () => {
  console.log("Galactic Wars | Initialisation du système");

  game.galacticWars = { config: GW };
  CONFIG.GW = GW;

  CONFIG.Actor.documentClass = GalacticWarsActor;
  CONFIG.Item.documentClass = GalacticWarsItem;

  CONFIG.Actor.dataModels.personnage = PersonnageData;
  CONFIG.Actor.dataModels["personnage-rapide"] = PersonnageRapideData;
  // Le PNJ réutilise le même schéma que la fiche rapide (voir data/actor-personnage-rapide.mjs) —
  // seule la mécanique de jet diffère (% plutôt que d20, voir sheets/personnage-rapide-sheet.mjs).
  CONFIG.Actor.dataModels.pnj = PersonnageRapideData;
  CONFIG.Actor.dataModels["personnage-sith"] = PersonnageSithData;
  CONFIG.Item.dataModels.race = RaceData;
  CONFIG.Item.dataModels.metier = MetierData;
  CONFIG.Item.dataModels.talent = TalentData;
  CONFIG.Item.dataModels.arme = ArmeData;
  CONFIG.Item.dataModels.armure = ArmureData;
  CONFIG.Item.dataModels.pouvoir = PouvoirData;
  CONFIG.Item.dataModels.equipement = EquipementData;
  CONFIG.Item.dataModels.ecole = EcoleData;

  const { DocumentSheetConfig } = foundry.applications.apps;
  const { Actors, Items } = foundry.documents.collections;

  Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);

  DocumentSheetConfig.registerSheet(Actor, "galactic-wars", PersonnageSheet, {
    types: ["personnage"],
    makeDefault: true,
    label: "GALACTICWARS.Sheet.Personnage"
  });

  DocumentSheetConfig.registerSheet(Actor, "galactic-wars", PersonnageRapideSheet, {
    types: ["personnage-rapide"],
    makeDefault: true,
    label: "GALACTICWARS.Sheet.PersonnageRapide"
  });

  DocumentSheetConfig.registerSheet(Actor, "galactic-wars", PersonnageRapideSheet, {
    types: ["pnj"],
    makeDefault: true,
    label: "GALACTICWARS.Sheet.Pnj"
  });

  DocumentSheetConfig.registerSheet(Actor, "galactic-wars", PersonnageSithSheet, {
    types: ["personnage-sith"],
    makeDefault: true,
    label: "GALACTICWARS.Sheet.PersonnageSith"
  });

  DocumentSheetConfig.registerSheet(Item, "galactic-wars", GalacticWarsItemSheet, {
    types: ["race", "metier", "talent", "arme", "armure", "pouvoir", "equipement", "ecole"],
    makeDefault: true,
    label: "GALACTICWARS.Sheet.Item"
  });

  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("gwLocalizeSkill", (key) => game.i18n.localize(GW.competences[key]?.label ?? key));
});

Hooks.once("ready", async () => {
  if (!game.user.isGM) return;
  await runMigrations();
});
