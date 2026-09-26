/**
 * Animations (v0.19.2, suivi de l'auteur n° 18) avec Sequencer et les animations libres de JB2A, et Automated
 * Animations pour les armes qu'on y a configurées. Tout est facultatif : sans ces modules actifs (ou si le réglage
 * « Animations » est coupé), rien ne se passe.
 *
 * - attaque : tir laser vers chaque cible (armes à distance ; vert pour les armes de vaisseau, raté si échec), coup de
 *   sabre laser, coup d'arme blanche / poing, explosion pour l'artifice ;
 * - vaisseau : traînée de fumée au point de départ quand son token se déplace.
 */

const JB2A = "modules/JB2A_DnD5e/Library/Generic";
const ANIMATIONS = {
  tir: { db: ["jb2a.lasershot.red"], fichier: `${JB2A}/Weapon_Attacks/Ranged/LaserShot_01_Regular_Red_30ft_1600x400.webm` },
  tirVaisseau: { db: ["jb2a.lasershot.green"], fichier: `${JB2A}/Weapon_Attacks/Ranged/LaserShot_01_Regular_Green_60ft_2800x400.webm` },
  sabre: { db: ["jb2a.lasersword.melee.blue"], fichier: `${JB2A}/Weapon_Attacks/Melee/LaserSword01_01_Regular_Blue_800x600.webm` },
  melee: { db: ["jb2a.club.melee.01.white"], fichier: `${JB2A}/Weapon_Attacks/Melee/Club01_01_Regular_White_800x600.webm` },
  explosion: { db: ["jb2a.explosion.01.orange"], fichier: `${JB2A}/Explosion/Explosion_01_Orange_400x400.webm` },
  fumee: { db: ["jb2a.fumes.steam.white"], fichier: `${JB2A}/Smoke/Fumes_02_Steam_White_400x400.webm` }
};

/** Type d'animation selon la compétence de l'arme. */
const PAR_COMPETENCE = {
  blaster: "tir", canonLourd: "tir", sabreLaser: "sabre", armeBlanche: "melee", bagarre: "melee", artifice: "explosion"
};

export function enregistrerReglageAnimations() {
  game.settings.register("galactic-wars", "animations", {
    name: "GALACTICWARS.Animations.Reglage",
    hint: "GALACTICWARS.Animations.ReglageHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
}

/** Sequencer et JB2A actifs, et réglage activé. */
export function animationsDisponibles() {
  return !!game.settings.get("galactic-wars", "animations")
    && !!game.modules.get("sequencer")?.active && !!game.modules.get("JB2A_DnD5e")?.active
    && typeof globalThis.Sequence === "function";
}

/** Entrée de la base de Sequencer si elle existe (choix automatique de la longueur), sinon le fichier. */
function source(cle) {
  const anim = ANIMATIONS[cle];
  for (const nom of anim.db) if (globalThis.Sequencer?.Database?.entryExists?.(nom)) return nom;
  return anim.fichier;
}

/**
 * Anime une attaque. Automated Animations prime pour une arme qu'on y a configurée.
 * @param {Item} arme
 * @param {Token|null} tireur token d'où part l'attaque (celui du vaisseau pour une arme de vaisseau)
 * @param {Token[]} cibles
 * @param {boolean} touche l'attaque est réussie
 */
export async function animerAttaque(arme, tireur, cibles, touche) {
  try {
    if (!game.settings.get("galactic-wars", "animations") || !tireur) return;
    const aa = globalThis.AutomatedAnimations;
    if (game.modules.get("autoanimations")?.active && aa?.playAnimation && arme.flags?.autoanimations) {
      await aa.playAnimation(tireur, arme, { targets: cibles, hitTargets: touche ? cibles : [] });
      return;
    }
    if (!animationsDisponibles()) return;
    let type = PAR_COMPETENCE[arme.system.competence] ?? "melee";
    if (type === "tir" && arme.actor?.type === "vaisseau") type = "tirVaisseau";
    const sequence = new Sequence();
    if (!cibles.length) {
      // Sans cible : effet sur le tireur (explosion devant lui pour l'artifice, sinon rien de lisible).
      if (type !== "explosion") return;
      sequence.effect().file(source(type)).atLocation(tireur).scaleToObject(2);
    }
    for (const cible of cibles) {
      if (type === "tir" || type === "tirVaisseau") {
        sequence.effect().file(source(type)).atLocation(tireur).stretchTo(cible).missed(!touche);
      } else if (type === "sabre") {
        sequence.effect().file(source(type)).atLocation(tireur).stretchTo(cible).missed(!touche);
      } else if (type === "explosion") {
        sequence.effect().file(source(type)).atLocation(cible).scaleToObject(2).missed(!touche);
      } else {
        // Mêlée : du tireur vers la cible (comme Automated Animations).
        sequence.effect().file(source(type)).atLocation(tireur).stretchTo(cible).missed(!touche);
      }
    }
    await sequence.play();
  } catch (err) {
    console.warn("Galactic Wars | Animation d'attaque :", err);
  }
}

/** À enregistrer au hook "init" : traînée de fumée au départ d'un token de vaisseau qui se déplace. */
export function enregistrerHooksAnimations() {
  Hooks.on("preUpdateToken", (token, changes, options) => {
    if (token.actor?.type !== "vaisseau" || (!("x" in changes) && !("y" in changes))) return;
    options.gwDepart = { x: token.x + (token.width * canvas.grid.size) / 2, y: token.y + (token.height * canvas.grid.size) / 2, taille: token.width };
  });
  Hooks.on("updateToken", (token, changes, options, userId) => {
    if (userId !== game.user.id || !options.gwDepart || !animationsDisponibles()) return;
    const { x, y, taille } = options.gwDepart;
    new Sequence().effect().file(source("fumee")).atLocation({ x, y }).size(taille * canvas.grid.size * 1.2)
      .fadeIn(200).fadeOut(900).opacity(0.7).play()
      .catch((err) => console.warn("Galactic Wars | Animation de déplacement :", err));
  });
}
