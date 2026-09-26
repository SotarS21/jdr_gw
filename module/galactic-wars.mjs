import { GW } from "./config.mjs";
import { GalacticWarsActor } from "./documents/actor.mjs";
import { GalacticWarsItem } from "./documents/item.mjs";
import { PersonnageData } from "./data/actor-personnage.mjs";
import { PersonnageRapideData } from "./data/actor-personnage-rapide.mjs";
import { PersonnageSithData } from "./data/actor-personnage-sith.mjs";
import { VaisseauData } from "./data/actor-vaisseau.mjs";
import { EquipageData } from "./data/actor-equipage.mjs";
import { GeneriqueData } from "./data/page-generique.mjs";
import { PageGeneriqueSheet } from "./sheets/page-generique-sheet.mjs";
import { enregistrerSocketGenerique } from "./apps/generique.mjs";
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
import { VaisseauSheet } from "./sheets/vaisseau-sheet.mjs";
import { EquipageSheet, enregistrerHooksEquipage } from "./sheets/equipage-sheet.mjs";
import { GalacticWarsItemSheet } from "./sheets/item-sheet.mjs";
import { runMigrations, completerToutesLesFiches } from "./helpers/migration.mjs";
import { registerVersionCheckSettings, checkSystemVersionUpdate } from "./helpers/version-check.mjs";
import { registerPackUpdateSettings, checkPendingPackUpdates } from "./helpers/pack-updates.mjs";
import { enregistrerHooksChatObjet } from "./helpers/chat-objet.mjs";
import { enregistrerHooksCombat } from "./helpers/combat.mjs";
import { enregistrerHooksComlink } from "./helpers/comlink.mjs";

enregistrerHooksChatObjet();
enregistrerHooksCombat();
enregistrerHooksComlink();

Hooks.once("init", () => {
  console.log("Galactic Wars | Initialisation du système");

  game.galacticWars = {
    config: GW,
    // Macro MJ : ajoute les compétences manquantes à toutes les fiches déjà créées (monde, tokens, compendiums du monde).
    completerCompetences: () => completerToutesLesFiches()
  };
  CONFIG.GW = GW;
  CONFIG.Combat.initiative = { formula: GW.formuleInitiative, decimals: 0 };
  registerVersionCheckSettings();
  registerPackUpdateSettings();

  CONFIG.Actor.documentClass = GalacticWarsActor;
  CONFIG.Item.documentClass = GalacticWarsItem;

  CONFIG.Actor.dataModels.personnage = PersonnageData;
  CONFIG.Actor.dataModels["personnage-rapide"] = PersonnageRapideData;
  // Le PNJ réutilise le même schéma que la fiche rapide (voir data/actor-personnage-rapide.mjs) —
  // seule la mécanique de jet diffère (% plutôt que d20, voir sheets/personnage-rapide-sheet.mjs).
  CONFIG.Actor.dataModels.pnj = PersonnageRapideData;
  CONFIG.Actor.dataModels["personnage-sith"] = PersonnageSithData;
  CONFIG.Actor.dataModels.vaisseau = VaisseauData;
  CONFIG.Actor.dataModels.equipage = EquipageData;
  CONFIG.JournalEntryPage.dataModels.generique = GeneriqueData;
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

  DocumentSheetConfig.registerSheet(Actor, "galactic-wars", VaisseauSheet, {
    types: ["vaisseau"],
    makeDefault: true,
    label: "GALACTICWARS.Sheet.Vaisseau"
  });

  DocumentSheetConfig.registerSheet(Actor, "galactic-wars", EquipageSheet, {
    types: ["equipage"],
    makeDefault: true,
    label: "GALACTICWARS.Equipage.Fiche"
  });
  enregistrerHooksEquipage();

  DocumentSheetConfig.registerSheet(JournalEntryPage, "galactic-wars", PageGeneriqueSheet, {
    types: ["generique"],
    makeDefault: true,
    label: "GALACTICWARS.Generique.Fiche"
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
  enregistrerSocketGenerique();
  if (!game.user.isGM) return;
  await runMigrations();
  await checkSystemVersionUpdate();
  await checkPendingPackUpdates();
});
