// Génère packs/_source/journaux/*.json : un journal par catalogue (objets, armes, armures, métiers), une page par
// document du compendium source (image, caractéristiques, description, lien vers la fiche du compendium).
// À relancer après toute modification des compendiums armes / armures / equipements / metiers :
//   npm run journaux   (puis npm run pack:build, ou deploy-local.ps1 qui compile les packs)
// Identifiants stables : le journal garde un id fixe, chaque page reprend l'id de son objet.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { GW } from "../module/config.mjs";

const racine = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sources = path.join(racine, "packs", "_source");
const sortie = path.join(sources, "journaux");
const fr = JSON.parse(readFileSync(path.join(racine, "lang", "fr.json"), "utf8"));
const version = JSON.parse(readFileSync(path.join(racine, "system.json"), "utf8")).version;

/** Traduction d'une clé i18n « GALACTICWARS.x.y » (la clé elle-même si absente). */
const t = (cle) => cle.split(".").reduce((o, k) => o?.[k], fr) ?? cle;
const echapper = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const competence = (cle) => (GW.competences[cle] ? t(GW.competences[cle].label) : cle);
const lire = (pack) => readdirSync(path.join(sources, pack)).filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(path.join(sources, pack, f), "utf8")))
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));
// Noms des traits, pour les liens « Trait du métier ».
const nomsTraits = new Map(lire("traits").map((d) => [d._id, d.name]));
const stats = { compendiumSource: null, duplicateSource: null, coreVersion: "14", systemId: "galactic-wars", systemVersion: version };

/** Tableau de caractéristiques : lignes [libellé, valeur] dont la valeur n'est pas vide. */
function tableau(lignes) {
  const l = lignes.filter(([, v]) => v !== "" && v !== null && v !== undefined);
  if (!l.length) return "";
  return `<table class="gw-catalogue-carac"><tbody>${l.map(([k, v]) => `<tr><th>${echapper(k)}</th><td>${v}</td></tr>`).join("")}</tbody></table>`;
}

function page(doc, pack, journalId, sort, corps) {
  const description = (doc.system.description ?? "").replace(/<p><\/p>/g, "");
  const content = `<div class="gw-catalogue">`
    + `<figure class="gw-catalogue-image"><img src="${echapper(doc.img)}" alt="${echapper(doc.name)}"></figure>`
    + corps
    + description
    + `<p class="gw-catalogue-lien">@UUID[Compendium.galactic-wars.${pack}.Item.${doc._id}]{${echapper(doc.name)}} — à glisser sur une fiche.</p>`
    + `</div>`;
  return {
    _id: doc._id, name: doc.name, type: "text", title: { show: true, level: 1 }, image: {},
    text: { content, markdown: "", format: 1 }, video: { controls: true }, src: null, system: {}, sort,
    ownership: { default: -1 }, flags: {}, _stats: stats, _key: `!journal.pages!${journalId}.${doc._id}`
  };
}

const prix = (p) => (p === "NA" ? "Non achetable" : echapper(p));

const CATALOGUES = [
  {
    id: "gwJournalObjets0", nom: "Journal des objets", pack: "equipements",
    corps: (d) => tableau([
      ["Prix", prix(d.system.prix)],
      ["Appareil", d.system.appareil ? echapper(t(GW.appareils[d.system.appareil]?.label ?? GW.appareils[d.system.appareil] ?? d.system.appareil)) : ""],
      ["Soin", d.system.soin ? (d.system.soin === "max" ? "Tous les PV" : `${echapper(d.system.soin)} PV`) : ""]
    ])
  },
  {
    id: "gwJournalArmes00", nom: "Journal des armes", pack: "armes",
    corps: (d) => tableau([
      ["Dégâts", echapper(d.system.degats)],
      ["Compétence", d.system.competence ? echapper(competence(d.system.competence)) : "Aucune"],
      ["Portée", echapper(d.system.portee)],
      ["Instable", d.system.instable ? "Oui" : ""],
      ["Prix", prix(d.system.prix)]
    ])
  },
  {
    id: "gwJournalArmures", nom: "Journal des armures", pack: "armures",
    corps: (d) => tableau([
      ["Réduction des dégâts", d.system.reduction],
      ["Emplacement", echapper(t(GW.emplacementsArmure[d.system.emplacement] ?? d.system.emplacement))],
      ["Prix", prix(d.system.prix)]
    ])
  },
  {
    id: "gwJournalMetiers", nom: "Journal des métiers", pack: "metiers",
    corps: (d) => {
      const s = d.system;
      const comp = (oblig) => s.competences.filter((c) => !!c.obligatoire === oblig)
        .map((c) => echapper(competence(c.cle)) + (c.bonus ? ` (+${c.bonus})` : "")).join(", ");
      const traits = Object.entries(s.traits ?? {}).filter(([, u]) => u)
        .map(([fiche, u]) => `${echapper(t(`GALACTICWARS.Traits.Fiche.${fiche.charAt(0).toUpperCase()}${fiche.slice(1)}`))} : @UUID[${u}]{${echapper(nomsTraits.get(u.split(".").pop()) ?? "trait")}}`).join("<br>");
      let html = tableau([
        ["Affiliation / prérequis", echapper(s.prerequis?.texteLibre?.trim())],
        ["Talent", s.talent?.nom ? `<strong>${echapper(s.talent.nom)}</strong>${s.talent.description ? ` — ${echapper(s.talent.description)}` : ""}` : ""],
        ["Compétences du métier", comp(true)],
        ["Compétences au choix", comp(false)],
        ["Trait du métier", traits]
      ]);
      if (s.equipement?.length) {
        html += `<h3>Équipement de départ</h3><ul>${s.equipement.map((e) => `<li>${e.quantite > 1 ? `${e.quantite} × ` : ""}${echapper(e.nom)}</li>`).join("")}</ul>`;
      }
      return html;
    }
  }
];

rmSync(sortie, { recursive: true, force: true });
mkdirSync(sortie, { recursive: true });
CATALOGUES.forEach((c, i) => {
  const docs = lire(c.pack);
  const journal = {
    _key: `!journal!${c.id}`, _id: c.id, name: c.nom, folder: null, sort: (i + 1) * 100000,
    pages: docs.map((d, n) => page(d, c.pack, c.id, (n + 1) * 100000, c.corps(d))),
    ownership: { default: 0 }, flags: {}, _stats: stats
  };
  const fichier = c.nom.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  writeFileSync(path.join(sortie, `${fichier}.json`), JSON.stringify(journal, null, 2) + "\n");
  console.log(`${c.nom} : ${docs.length} pages`);
});
