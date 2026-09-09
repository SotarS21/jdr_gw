import { GW } from "./config.mjs";
import { GalacticWarsActor } from "./documents/actor.mjs";
import { GalacticWarsItem } from "./documents/item.mjs";
import { PersonnageData } from "./data/actor-personnage.mjs";
import { RaceData } from "./data/item-race.mjs";
import { MetierData } from "./data/item-metier.mjs";
import { TalentData } from "./data/item-talent.mjs";
import { ArmeData } from "./data/item-arme.mjs";
import { ArmureData } from "./data/item-armure.mjs";
import { PouvoirData } from "./data/item-pouvoir.mjs";
import { EquipementData } from "./data/item-equipement.mjs";
import { PersonnageSheet } from "./sheets/personnage-sheet.mjs";
import { GalacticWarsItemSheet } from "./sheets/item-sheet.mjs";
import { runMigrations } from "./helpers/migration.mjs";

Hooks.once("init", () => {
  console.log("Galactic Wars | Initialisation du système");

  game.galacticWars = { config: GW };
  CONFIG.GW = GW;

  CONFIG.Actor.documentClass = GalacticWarsActor;
  CONFIG.Item.documentClass = GalacticWarsItem;

  CONFIG.Actor.dataModels.personnage = PersonnageData;
  CONFIG.Item.dataModels.race = RaceData;
  CONFIG.Item.dataModels.metier = MetierData;
  CONFIG.Item.dataModels.talent = TalentData;
  CONFIG.Item.dataModels.arme = ArmeData;
  CONFIG.Item.dataModels.armure = ArmureData;
  CONFIG.Item.dataModels.pouvoir = PouvoirData;
  CONFIG.Item.dataModels.equipement = EquipementData;

  const { DocumentSheetConfig } = foundry.applications.apps;
  const { Actors, Items } = foundry.documents.collections;

  Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);

  DocumentSheetConfig.registerSheet(Actor, "galactic-wars", PersonnageSheet, {
    types: ["personnage"],
    makeDefault: true,
    label: "GALACTICWARS.Sheet.Personnage"
  });

  DocumentSheetConfig.registerSheet(Item, "galactic-wars", GalacticWarsItemSheet, {
    types: ["race", "metier", "talent", "arme", "armure", "pouvoir", "equipement"],
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
