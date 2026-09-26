import { GW } from "../config.mjs";
import { rollCompetence } from "../helpers/rolls.mjs";
import { proposerDefense } from "../helpers/combat.mjs";
import { tireurSelectionne } from "../helpers/armement-vaisseau.mjs";

/** Carte d'objet postée dans le tchat (boutons gérés par helpers/chat-objet.mjs). */
const TEMPLATE_CARTE = "systems/galactic-wars/templates/chat/objet-carte.hbs";

/** Types d'objet d'inventaire (champs communs de data/objet-base.mjs : porte, tags, quantite…). */
const TYPES_INVENTAIRE = ["arme", "armure", "equipement"];

/**
 * Formule lançable seule : Roll.validate ne suffit pas (un mot libre comme « explosion »
 * est accepté par le parseur en tant que StringTerm, puis plante à l'évaluation).
 */
function estFormuleLancable(formule) {
  try {
    if (!Roll.validate(formule)) return false;
    return !new Roll(formule).terms.some((t) => t instanceof foundry.dice.terms.StringTerm);
  } catch {
    return false;
  }
}

/**
 * Sépare une formule de dégâts saisie librement en partie lançable + note de texte.
 * "3d6 + explosion" → { formule: "3d6", note: "+ explosion" } ; "2d8" → { formule: "2d8", note: "" }.
 * On retire les mots un par un depuis la fin (puis les opérateurs orphelins) jusqu'à obtenir
 * une formule valide ; formule "" si rien n'est lançable.
 * @param {string} texte
 */
export function extraireFormuleDegats(texte) {
  const source = (texte ?? "").trim();
  const mots = source.split(/\s+/).filter(Boolean);
  // Espaces normalisés : chaque candidat est alors un préfixe exact, la note est le reste
  // (opérateur orphelin compris : « + explosion », pas « explosion »).
  const normalise = mots.join(" ");
  for (let n = mots.length; n > 0; n--) {
    const candidat = mots.slice(0, n).join(" ").replace(/[\s+\-*/]+$/, "");
    if (!candidat || !/\d/.test(candidat) || !estFormuleLancable(candidat)) continue;
    return { formule: candidat, note: normalise.slice(candidat.length).trim() };
  }
  // Texte collé sans espace ("3d6+explosion") : plus long préfixe de caractères de dés.
  const prefixe = source.match(/^[\d\s+\-*/()dD]+/)?.[0].replace(/[\s+\-*/(]+$/, "") ?? "";
  if (prefixe && /\d/.test(prefixe) && estFormuleLancable(prefixe)) {
    return { formule: prefixe, note: source.slice(prefixe.length).trim() };
  }
  return { formule: "", note: source };
}

export class GalacticWarsItem extends Item {
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  /** Objet d'inventaire (arme / armure / équipement), c.-à-d. qui a porte, tags, quantite. */
  get estObjetInventaire() {
    return TYPES_INVENTAIRE.includes(this.type);
  }

  /** Arme montée sur un vaisseau (toujours utilisable, tir au taux du token sélectionné). */
  get estArmeDeVaisseau() {
    return this.type === "arme" && this.actor?.type === "vaisseau";
  }

  /** Armure d'emplacement bouclier (cumulable avec les autres armures). */
  get estBouclier() {
    return this.type === "armure" && this.system.emplacement === "bouclier";
  }

  /** Inverse porté / rangé (objets d'inventaire seulement). */
  async basculerPorte() {
    if (!this.estObjetInventaire) return null;
    return this.update({ "system.porte": !this.system.porte });
  }

  /**
   * Poste la carte de l'objet dans le tchat. Un objet Caché n'est montré qu'au MJ et à
   * l'auteur du message (murmure) : le poster publiquement révélerait ce qu'il dissimule.
   */
  async afficherDansTchat() {
    const system = this.system;
    const estArme = this.type === "arme";
    const cache = !!system.tags?.cache;

    const html = await foundry.applications.handlebars.renderTemplate(TEMPLATE_CARTE, {
      nom: this.name,
      img: this.img,
      type: this.type,
      typeLabel: game.i18n.localize(`TYPES.Item.${this.type}`),
      badges: this.#badgesCarte(),
      details: this.#detailsCarte(),
      description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description ?? "", {
        relativeTo: this, secrets: false
      }),
      estArme,
      soin: this.#libelleSoin(),
      cache
    });

    const messageData = {
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: html,
      flags: { "galactic-wars": { itemUuid: this.uuid } }
    };
    if (cache) {
      messageData.whisper = [...new Set([...ChatMessage.getWhisperRecipients("GM").map((u) => u.id), game.user.id])];
    }
    return ChatMessage.create(messageData);
  }

  /** Libellé du bouton de soin de la carte (« Regagne 4 PV », « Regagne tous les PV »), ou "". */
  #libelleSoin() {
    const soin = this.type === "equipement" ? String(this.system.soin ?? "").trim() : "";
    if (!soin) return "";
    return soin.toLowerCase() === "max"
      ? game.i18n.localize("GALACTICWARS.Soin.Tous")
      : game.i18n.format("GALACTICWARS.Soin.Montant", { soin });
  }

  /** Bouton « Utiliser » d'un objet de soin : le porteur regagne ses PV, bilan dans le tchat. */
  async utiliserSoin() {
    const actor = this.actor;
    if (!actor) {
      ui.notifications.warn(game.i18n.format("GALACTICWARS.Objet.SansActeur", { nom: this.name }));
      return null;
    }
    const resultat = await actor.soigner(this.system.soin);
    if (!resultat) {
      ui.notifications.warn(game.i18n.format("GALACTICWARS.Combat.SansPV", { nom: actor.name }));
      return null;
    }
    const echapper = foundry.utils.escapeHTML;
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="gw-soin"><i class="fa-solid fa-kit-medical"></i> ${game.i18n.format("GALACTICWARS.Soin.Bilan", {
        nom: echapper(actor.name), objet: echapper(this.name), ...resultat
      })}</div>`,
      rolls: resultat.roll ? [resultat.roll] : []
    });
    return resultat;
  }

  /** Badges d'état de la carte (même logique que les lignes de l'inventaire). */
  #badgesCarte() {
    const system = this.system;
    const badges = [];
    if (this.estObjetInventaire && this.actor && !this.estArmeDeVaisseau) {
      badges.push(system.porte
        ? { cle: "porte", label: "GALACTICWARS.Objet.Porte", icone: "fa-solid fa-hand-fist" }
        : { cle: "range", label: "GALACTICWARS.Objet.Range", icone: "fa-solid fa-box-archive" });
    }
    for (const [cle, tag] of Object.entries(GW.tagsObjet)) {
      if (system.tags?.[cle]) badges.push({ cle, label: tag.label, icone: tag.icone });
    }
    if (this.estBouclier) badges.push({ cle: "bouclier", label: "GALACTICWARS.Objet.Emplacement.bouclier", icone: "fa-solid fa-shield-halved" });
    if (this.type === "arme" && system.instable) badges.push({ cle: "instable", label: "GALACTICWARS.Objet.Instable", icone: "fa-solid fa-bolt" });
    return badges;
  }

  /** Lignes libellé / valeur de la carte, selon le type d'objet. */
  #detailsCarte() {
    const system = this.system;
    const details = [];
    const ajouter = (label, valeur, mono = false) => {
      if (valeur !== undefined && valeur !== null && valeur !== "") details.push({ label, valeur, mono });
    };
    if (this.type === "arme") {
      ajouter("GALACTICWARS.Objet.Degats", system.degats, true);
      const competence = system.competence ? GW.competences[system.competence] : null;
      if (competence) {
        // Taux du porteur, si l'objet est sur un personnage classique (system.competences préparé) ; arme de
        // vaisseau : taux du token sélectionné au moment du tir.
        const total = this.actor?.system.competences?.find?.((c) => c.cle === system.competence)?.total;
        const label = game.i18n.localize(competence.label);
        if (this.estArmeDeVaisseau) {
          ajouter("GALACTICWARS.Objet.Competence", game.i18n.format("GALACTICWARS.Vaisseau.CompetenceTireur", { competence: label }));
        } else {
          ajouter("GALACTICWARS.Objet.Competence", total !== undefined ? `${label} (${total} %)` : label);
        }
      } else {
        ajouter("GALACTICWARS.Objet.Competence", game.i18n.localize("GALACTICWARS.Objet.AucuneCompetence"));
      }
      ajouter("GALACTICWARS.Objet.Portee", system.portee);
    } else if (this.type === "armure") {
      ajouter("GALACTICWARS.Objet.Reduction", `+${system.reduction ?? 0}`, true);
      ajouter("GALACTICWARS.Objet.EmplacementLabel",
        GW.emplacementsArmure[system.emplacement] ? game.i18n.localize(GW.emplacementsArmure[system.emplacement]) : system.emplacement);
    }
    if (this.estObjetInventaire) {
      if ((system.quantite ?? 1) !== 1) ajouter("GALACTICWARS.Objet.Quantite", `×${system.quantite}`, true);
      // Pas de prix sur la carte d'une arme (demande de l'auteur) : c'est la carte d'attaque, pas de boutique.
      if (this.type !== "arme") ajouter("GALACTICWARS.Objet.Prix", system.prix);
    }
    return details;
  }

  /**
   * Jet d'attaque (arme portée) : jet de la compétence liée, nom de l'arme en en-tête. Les points de Lumière /
   * d'Obscurité ne modifient pas le jet : ils se dépensent avant, par le bouton « Utiliser » de la fiche.
   */
  async attaquer() {
    if (this.type !== "arme") return null;
    // Arme de vaisseau : le tireur est le token sélectionné (sa compétence, son taux), pas le vaisseau.
    const actor = this.estArmeDeVaisseau ? tireurSelectionne() : this.actor;
    if (!actor) {
      ui.notifications.warn(game.i18n.format(this.estArmeDeVaisseau ? "GALACTICWARS.Vaisseau.SansTireur" : "GALACTICWARS.Objet.SansActeur", { nom: this.name }));
      return null;
    }
    if (!this.system.porte && !this.estArmeDeVaisseau) {
      ui.notifications.warn(game.i18n.format("GALACTICWARS.Objet.NonPorte", { nom: this.name }));
      return null;
    }
    if (!this.system.competence) {
      ui.notifications.warn(game.i18n.format("GALACTICWARS.Objet.SansCompetence", { nom: this.name }));
      return null;
    }
    // Garde contre un double déclenchement (double-clic) avant la fin du premier jet.
    if (this._attaqueEnCours) return null;
    this._attaqueEnCours = true;
    try {
      const titre = this.estArmeDeVaisseau ? `${this.name} — ${this.actor.name}` : this.name;
      const resultat = await rollCompetence(actor, this.system.competence, { titre });
      // Attaque réussie sur des tokens ciblés : carte « Défense » pour chaque cible.
      if (resultat?.reussite) await proposerDefense(this, resultat, [...game.user.targets].map((t) => t.document));
      return resultat;
    } finally {
      this._attaqueEnCours = false;
    }
  }

  /**
   * Jet de dégâts : seule la partie valide de la formule est lancée, le reste est affiché
   * en note (« + explosion ») ; mention « Instable » si l'arme l'est.
   */
  async lancerDegats() {
    if (this.type !== "arme") return null;
    const { formule, note } = extraireFormuleDegats(this.system.degats);
    if (!formule) {
      ui.notifications.warn(game.i18n.format("GALACTICWARS.Objet.FormuleInvalide", {
        nom: this.name, formule: this.system.degats || "—"
      }));
      return null;
    }
    const roll = new Roll(formule, this.actor?.getRollData() ?? {});
    await roll.evaluate();

    const echapper = foundry.utils.escapeHTML;
    const lignes = [`<strong class="gw-jet-titre">${echapper(this.name)}</strong> — ${game.i18n.localize("GALACTICWARS.Objet.LancerDegats")}`];
    if (note) lignes.push(`<span class="gw-note-degats">${echapper(note)}</span>`);
    if (this.system.instable) {
      lignes.push(`<span class="gw-instable"><i class="fa-solid fa-bolt"></i> ${game.i18n.localize("GALACTICWARS.Objet.Instable")}</span>`);
    }

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: lignes.join("<br>"),
      // Cibles de l'attaquant au moment du jet : le MJ leur applique les dégâts depuis le tchat
      // (helpers/chat-objet.mjs), réduits par leurs armures.
      flags: {
        "galactic-wars": {
          itemUuid: this.uuid,
          degats: { total: roll.total, cibles: [...game.user.targets].map((t) => t.document.uuid) }
        }
      }
    });
    return roll;
  }
}
