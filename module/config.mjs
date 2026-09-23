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
 * Les 4 caractéristiques de la fiche sith prétirée — un modificateur additif, jet en
 * 1d20 + valeur contre un DC fixé par le MJ (voir module/helpers/rolls.mjs::rollD20Plus).
 */
GW.caracteristiquesSith = {
  physique: "GALACTICWARS.CaracteristiqueSith.Physique",
  agilite: "GALACTICWARS.CaracteristiqueSith.Agilite",
  perception: "GALACTICWARS.CaracteristiqueSith.Perception",
  mental: "GALACTICWARS.CaracteristiqueSith.Mental"
};

/**
 * Les 7 compétences de force fixes de la fiche sith — même mécanique 1d20 + valeur.
 * Voir École de sith jouable.docx pour les capacités spéciales par école (compendium ecoles).
 */
GW.competencesForceSith = {
  telekinesie: "GALACTICWARS.CompetenceForceSith.Telekinesie",
  pousseeDeForce: "GALACTICWARS.CompetenceForceSith.PousseeDeForce",
  eclairDeForce: "GALACTICWARS.CompetenceForceSith.EclairDeForce",
  defense: "GALACTICWARS.CompetenceForceSith.Defense",
  illusion: "GALACTICWARS.CompetenceForceSith.Illusion",
  persuasion: "GALACTICWARS.CompetenceForceSith.Persuasion",
  combatArme: "GALACTICWARS.CompetenceForceSith.CombatArme",
  furtivite: "GALACTICWARS.CompetenceForceSith.Furtivite"
};

/**
 * Valeur individuelle max autorisée deux fois parmi les 4 caractéristiques sith. Le
 * classeur source dit "pas plus de deux compétences à 6, 5" — lu ici comme un plafond de
 * 6 (le second nombre reste ambigu dans la source, à confirmer).
 */
GW.limitesCaracteristiquesSith = { valeurPlafond: 6, nombreMaxAuPlafond: 2 };

GW.corpulences = {
  maigrichon: "GALACTICWARS.Corpulence.Maigrichon",
  normal: "GALACTICWARS.Corpulence.Normal",
  epais: "GALACTICWARS.Corpulence.Epais",
  fort: "GALACTICWARS.Corpulence.Fort"
};

/**
 * Liste déduplifiée des compétences (voir memory project_galactic_wars_mechanics.md).
 * Le classeur source distinguait parfois une variante "(force)" et une variante "(métier)"
 * de la même compétence (ex. Contrôle télékinétique) : on ne garde qu'une entrée par
 * compétence, avec `force: true` pour les pouvoirs de force et `metier: true` pour les
 * compétences qui exigent un métier compatible (malus -30% sinon, -10% pour les autres).
 *
 * `caracteristique` (corps/mental/dexterite) restaure le regroupement en 3 colonnes de
 * `Template corriger.xlsx` (onglet "fiche base"), aplati en liste unique lors du scaffold
 * initial (voir JOURNAL.md session 2026-09-13). Les 3 colonnes de la source contenaient
 * 12 (Corps) / 12 (Mental) / 13 (Dextérité) = 37 cases, mais la colonne Corps y incluait
 * "Arme contondante et blanche" (absente de GW.competences, voir le point ouvert plus bas
 * sur la compétence d'arme de mêlée manquante) à la place de `natation`, qui elle n'apparaît
 * dans la source que comme bonus racial isolé (case A45), pas dans la grille de compétences.
 * `natation` a été rattachée à Corps ici pour conserver le compte de 12 de cette colonne —
 * un choix plausible (compétence physique) mais pas une certitude de la source, à confirmer
 * auprès de l'auteur si besoin.
 *
 * `reservee: true` : compétence réservée aux métiers qui l'accordent (grisée dans les fiches
 * Excel classiques par mise en forme conditionnelle, cf. `Template corriger.xlsx`). Sur la
 * fiche, elle est bloquée (niveau compté 0, jet impossible) tant que le métier actuel ne
 * l'accorde pas — la liste des métiers autorisés vient du compendium des métiers — sauf si
 * le MJ l'a débloquée pour ce personnage (clic droit, `debloquee`). Règle validée par
 * l'auteur le 2026-09-23.
 * @type {Record<string, {label: string, metier: boolean, force: boolean, caracteristique: string, reservee?: boolean}>}
 */
GW.competences = {
  commanderGuider: { label: "GALACTICWARS.Competence.CommanderGuider", metier: false, force: false, caracteristique: "mental" },
  blaster: { label: "GALACTICWARS.Competence.Blaster", metier: false, force: false, caracteristique: "dexterite" },
  artifice: { label: "GALACTICWARS.Competence.Artifice", metier: true, force: false, caracteristique: "corps" },
  drainDeForce: { label: "GALACTICWARS.Competence.DrainDeForce", metier: true, force: true, caracteristique: "mental", reservee: true },
  controleTelekinetique: { label: "GALACTICWARS.Competence.ControleTelekinetique", metier: true, force: true, caracteristique: "dexterite" },
  bagarre: { label: "GALACTICWARS.Competence.Bagarre", metier: false, force: false, caracteristique: "corps" },
  escroquerieMensonge: { label: "GALACTICWARS.Competence.EscroquerieMensonge", metier: false, force: false, caracteristique: "mental" },
  informatiquePiratage: { label: "GALACTICWARS.Competence.InformatiquePiratage", metier: false, force: false, caracteristique: "dexterite" },
  blocage: { label: "GALACTICWARS.Competence.Blocage", metier: false, force: false, caracteristique: "corps" },
  intimidation: { label: "GALACTICWARS.Competence.Intimidation", metier: false, force: false, caracteristique: "mental" },
  mecanique: { label: "GALACTICWARS.Competence.Mecanique", metier: true, force: false, caracteristique: "dexterite" },
  canonLourd: { label: "GALACTICWARS.Competence.CanonLourd", metier: true, force: false, caracteristique: "corps" },
  perception: { label: "GALACTICWARS.Competence.Perception", metier: false, force: false, caracteristique: "mental" },
  paradeEsquive: { label: "GALACTICWARS.Competence.ParadeEsquive", metier: false, force: false, caracteristique: "dexterite" },
  furtivite: { label: "GALACTICWARS.Competence.Furtivite", metier: false, force: false, caracteristique: "corps" },
  persuasion: { label: "GALACTICWARS.Competence.Persuasion", metier: false, force: false, caracteristique: "mental" },
  pickpocket: { label: "GALACTICWARS.Competence.Pickpocket", metier: true, force: false, caracteristique: "dexterite", reservee: true },
  meditationDeForce: { label: "GALACTICWARS.Competence.MeditationDeForce", metier: true, force: true, caracteristique: "corps", reservee: true },
  persuasionDeForce: { label: "GALACTICWARS.Competence.PersuasionDeForce", metier: true, force: true, caracteristique: "mental" },
  pilotage: { label: "GALACTICWARS.Competence.Pilotage", metier: true, force: false, caracteristique: "dexterite" },
  appelALaRage: { label: "GALACTICWARS.Competence.AppelALaRage", metier: true, force: false, caracteristique: "corps", reservee: true },
  sagesse: { label: "GALACTICWARS.Competence.Sagesse", metier: false, force: false, caracteristique: "mental" },
  sabreLaser: { label: "GALACTICWARS.Competence.SabreLaser", metier: true, force: false, caracteristique: "dexterite" },
  survie: { label: "GALACTICWARS.Competence.Survie", metier: false, force: false, caracteristique: "corps" },
  seduction: { label: "GALACTICWARS.Competence.Seduction", metier: false, force: false, caracteristique: "mental" },
  securite: { label: "GALACTICWARS.Competence.Securite", metier: true, force: false, caracteristique: "dexterite", reservee: true },
  pousseeDeForce: { label: "GALACTICWARS.Competence.PousseeDeForce", metier: true, force: true, caracteristique: "corps" },
  social: { label: "GALACTICWARS.Competence.Social", metier: false, force: false, caracteristique: "mental" },
  medecine: { label: "GALACTICWARS.Competence.Medecine", metier: true, force: false, caracteristique: "dexterite", reservee: true },
  protectionDeForce: { label: "GALACTICWARS.Competence.ProtectionDeForce", metier: true, force: true, caracteristique: "corps" },
  spiritisme: { label: "GALACTICWARS.Competence.Spiritisme", metier: true, force: false, caracteristique: "mental" },
  eclaireDeForce: { label: "GALACTICWARS.Competence.EclaireDeForce", metier: true, force: true, caracteristique: "dexterite", reservee: true },
  escaladeSaut: { label: "GALACTICWARS.Competence.EscaladeSaut", metier: false, force: false, caracteristique: "corps" },
  sangFroid: { label: "GALACTICWARS.Competence.SangFroid", metier: false, force: false, caracteristique: "mental" },
  controleParLaForce: { label: "GALACTICWARS.Competence.ControleParLaForce", metier: true, force: true, caracteristique: "dexterite", reservee: true },
  artisanat: { label: "GALACTICWARS.Competence.Artisanat", metier: false, force: false, caracteristique: "dexterite" },
  natation: { label: "GALACTICWARS.Competence.Natation", metier: false, force: false, caracteristique: "corps" }
};

/** Malus appliqué au total% quand la compétence n'est pas acquise via le métier du personnage. */
GW.malusCompetenceNonAcquise = {
  normale: -10,
  metier: -30
};

/** Barème niveau (0-3) -> % de base, avant modificateurs raciaux/métier. */
GW.baremeNiveauCompetence = { 0: 0, 1: 5, 2: 10, 3: 20 };

/** Total attendu des caractéristiques de base saisies (fiche classique, cf. case B4 de
 *  `Template corriger.xlsx`) — validation indicative, jamais bloquante. */
GW.pointsCaracteristiques = 120;

GW.alignements = {
  lumiere: "GALACTICWARS.Alignement.Lumiere",
  obscurite: "GALACTICWARS.Alignement.Obscurite"
};

/** Bonus fixe accordé quand un point de Lumière ou d'Obscurité est dépensé sur un jet (voir rollCompetence). */
GW.bonusAlignement = 15;

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
