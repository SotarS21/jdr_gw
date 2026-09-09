/**
 * Constantes partagées du système Galactic Wars.
 * Toutes les étiquettes sont des clés i18n (jamais de texte en dur ici ni dans les templates).
 */
export const GW = {};

GW.caracteristiques = {
  corps: "GALACTICWARS.Caracteristique.Corps",
  mental: "GALACTICWARS.Caracteristique.Mental",
  dexterite: "GALACTICWARS.Caracteristique.Dexterite"
};

/**
 * Les 8 caractéristiques de la fiche rapide ("partie rapide") — un score (pas un %,
 * voir module/helpers/rolls.mjs::rollCaracteristiqueD20), somme plafonnée à 80,
 * pas plus de deux à 16.
 */
GW.caracteristiquesRapides = {
  force: "GALACTICWARS.CaracteristiqueRapide.Force",
  capCombat: "GALACTICWARS.CaracteristiqueRapide.CapCombat",
  capTir: "GALACTICWARS.CaracteristiqueRapide.CapTir",
  dexterite: "GALACTICWARS.CaracteristiqueRapide.Dexterite",
  mentale: "GALACTICWARS.CaracteristiqueRapide.Mentale",
  perception: "GALACTICWARS.CaracteristiqueRapide.Perception",
  stress: "GALACTICWARS.CaracteristiqueRapide.Stress",
  affForce: "GALACTICWARS.CaracteristiqueRapide.AffForce"
};

/** Somme maximale des 8 caractéristiques rapides, et valeur individuelle max autorisée deux fois. */
GW.limitesCaracteristiquesRapides = { totalMax: 80, valeurPlafond: 16, nombreMaxAuPlafond: 2 };

/**
 * Liste déduplifiée des compétences (voir memory project_galactic_wars_mechanics.md).
 * Le classeur source distinguait parfois une variante "(force)" et une variante "(métier)"
 * de la même compétence (ex. Contrôle télékinétique) : on ne garde qu'une entrée par
 * compétence, avec `force: true` pour les pouvoirs de force et `metier: true` pour les
 * compétences qui exigent un métier compatible (malus -30% sinon, -10% pour les autres).
 * @type {Record<string, {label: string, metier: boolean, force: boolean}>}
 */
GW.competences = {
  commanderGuider: { label: "GALACTICWARS.Competence.CommanderGuider", metier: false, force: false },
  blaster: { label: "GALACTICWARS.Competence.Blaster", metier: false, force: false },
  artifice: { label: "GALACTICWARS.Competence.Artifice", metier: true, force: false },
  drainDeForce: { label: "GALACTICWARS.Competence.DrainDeForce", metier: true, force: true },
  controleTelekinetique: { label: "GALACTICWARS.Competence.ControleTelekinetique", metier: true, force: true },
  bagarre: { label: "GALACTICWARS.Competence.Bagarre", metier: false, force: false },
  escroquerieMensonge: { label: "GALACTICWARS.Competence.EscroquerieMensonge", metier: false, force: false },
  informatiquePiratage: { label: "GALACTICWARS.Competence.InformatiquePiratage", metier: false, force: false },
  blocage: { label: "GALACTICWARS.Competence.Blocage", metier: false, force: false },
  intimidation: { label: "GALACTICWARS.Competence.Intimidation", metier: false, force: false },
  mecanique: { label: "GALACTICWARS.Competence.Mecanique", metier: true, force: false },
  canonLourd: { label: "GALACTICWARS.Competence.CanonLourd", metier: true, force: false },
  perception: { label: "GALACTICWARS.Competence.Perception", metier: false, force: false },
  paradeEsquive: { label: "GALACTICWARS.Competence.ParadeEsquive", metier: false, force: false },
  furtivite: { label: "GALACTICWARS.Competence.Furtivite", metier: false, force: false },
  persuasion: { label: "GALACTICWARS.Competence.Persuasion", metier: false, force: false },
  pickpocket: { label: "GALACTICWARS.Competence.Pickpocket", metier: true, force: false },
  meditationDeForce: { label: "GALACTICWARS.Competence.MeditationDeForce", metier: true, force: true },
  persuasionDeForce: { label: "GALACTICWARS.Competence.PersuasionDeForce", metier: true, force: true },
  pilotage: { label: "GALACTICWARS.Competence.Pilotage", metier: true, force: false },
  appelALaRage: { label: "GALACTICWARS.Competence.AppelALaRage", metier: true, force: false },
  sagesse: { label: "GALACTICWARS.Competence.Sagesse", metier: false, force: false },
  sabreLaser: { label: "GALACTICWARS.Competence.SabreLaser", metier: true, force: false },
  survie: { label: "GALACTICWARS.Competence.Survie", metier: false, force: false },
  seduction: { label: "GALACTICWARS.Competence.Seduction", metier: false, force: false },
  securite: { label: "GALACTICWARS.Competence.Securite", metier: true, force: false },
  pousseeDeForce: { label: "GALACTICWARS.Competence.PousseeDeForce", metier: true, force: true },
  social: { label: "GALACTICWARS.Competence.Social", metier: false, force: false },
  medecine: { label: "GALACTICWARS.Competence.Medecine", metier: true, force: false },
  protectionDeForce: { label: "GALACTICWARS.Competence.ProtectionDeForce", metier: true, force: true },
  spiritisme: { label: "GALACTICWARS.Competence.Spiritisme", metier: true, force: false },
  eclaireDeForce: { label: "GALACTICWARS.Competence.EclaireDeForce", metier: true, force: true },
  escaladeSaut: { label: "GALACTICWARS.Competence.EscaladeSaut", metier: false, force: false },
  sangFroid: { label: "GALACTICWARS.Competence.SangFroid", metier: false, force: false },
  controleParLaForce: { label: "GALACTICWARS.Competence.ControleParLaForce", metier: true, force: true },
  artisanat: { label: "GALACTICWARS.Competence.Artisanat", metier: false, force: false },
  natation: { label: "GALACTICWARS.Competence.Natation", metier: false, force: false }
};

/** Malus appliqué au total% quand la compétence n'est pas acquise via le métier du personnage. */
GW.malusCompetenceNonAcquise = {
  normale: -10,
  metier: -30
};

/** Barème niveau (0-3) -> % de base, avant modificateurs raciaux/métier. */
GW.baremeNiveauCompetence = { 0: 0, 1: 5, 2: 10, 3: 20 };

GW.alignements = {
  lumiere: "GALACTICWARS.Alignement.Lumiere",
  neutre: "GALACTICWARS.Alignement.Neutre",
  obscurite: "GALACTICWARS.Alignement.Obscurite"
};

GW.typesEquipement = {
  arme: "GALACTICWARS.TypeEquipement.Arme",
  armure: "GALACTICWARS.TypeEquipement.Armure",
  objet: "GALACTICWARS.TypeEquipement.Objet"
};

GW.emplacementsArmure = {
  casque: "GALACTICWARS.Emplacement.Casque",
  plastron: "GALACTICWARS.Emplacement.Plastron",
  avantBras: "GALACTICWARS.Emplacement.AvantBras",
  jambiere: "GALACTICWARS.Emplacement.Jambiere"
};
