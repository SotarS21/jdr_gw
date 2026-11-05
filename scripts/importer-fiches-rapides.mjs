// Importe les tableurs « Fiche de personnage : partie rapide » (asset_fiche_perso/fiche_short, hors dépôt) en acteurs
// `personnage-rapide` du compendium personnages-rapides (packs/_source/personnages-rapides, un JSON par personnage).
//
//   node scripts/importer-fiches-rapides.mjs [dossier des tableurs] [--portraits <dossier>]
//
// --portraits : copie le portrait brut de chaque fiche (image ancrée en haut à gauche de la première feuille) dans ce
// dossier, pour conversion en WebP (asset_visuel/Personnage/rapides/<slug>.webp). Un acteur ne référence son portrait
// que si ce WebP existe. Les identifiants sont dérivés du nom de fichier : relancer le script ne les change pas.
import XLSX from "xlsx";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const iPortraits = args.indexOf("--portraits");
const dossierPortraits = iPortraits >= 0 ? path.resolve(args.splice(iPortraits, 2)[1]) : null;
const dossierTableurs = path.resolve(args[0] ?? path.join(root, "..", "asset_fiche_perso", "fiche_short"));
const sortie = path.join(root, "packs", "_source", "personnages-rapides");
const dossierWebp = "asset_visuel/Personnage/rapides";

/** Modèles vides, copies non remplies et fiche d'un autre système (Knight / Tank) : non importés. */
const EXCLUS = new Set([
  "Fiche_de_personnage_short.xlsx", "[AAAA A NE PAS MODIFIER!!!.xlsx", "Copie de [AAAA A NE PAS MODIFIER!!!.xlsx",
  "Copie de [Latios].xlsx", "Mika copi.xlsx", "Talzd copi.xlsx", "Nouveau perso_.xlsx", "Pawn Res.xlsx", "Template joe.xlsx"
]);

/** Nom affiché de l'acteur, par fichier (prénom et nom sont souvent inversés ou absents sur les fiches). */
const NOMS = {
  "Assasin - Molwan - Kiffar.xlsx": "Molwan",
  "BOB - Sans Emplois - Humain.xlsx": "Bob",
  "Brador Chalianhe - Falleen - Scientifique.xlsx": "Brador Chalianhe",
  "Cel Sio - Wookiee - Pilote [Jouer par Fabien].xlsx": "Cel Sio",
  "Copie de [EONIS].xlsx": "Eonis",
  "Dareck Hiy - Assassin - Klatooinian.xlsx": "Dareck Hiy",
  "Davi Tradu -  Gotal - Sénateur.xlsx": "Davi Tradu",
  "Farrak Drak - Pilote - Snivvian.xlsx": "Farrak Drak",
  "Faustus - Medecin - Bith.xlsx": "Faustus Moreau",
  "Fel_Iné - Cathar -Pilote.xlsx": "Fel'Iné",
  "Grumf Ito - Dug - Pirate.xlsx": "Grumf Ito",
  "Hordim Albius - Chagrian - pirate.xlsx": "Hordim Albius",
  "Hüggermâun Yen - Besalisk - Soldat d_élite.xlsx": "Hüggermâun Yen",
  "Icestone Raegon - Humain - Padawan.xlsx": "Icestone Raegon",
  "Is_Trasso Kalo - Kel Dor - Pirate.xlsx": "Is'Trasso Kalo",
  "Isabossba - voleur - Dug.xlsx": "Isabossba Huito",
  "Kahoulia - Rattataki - Agent secret.xlsx": "Kahoulia Gashkata",
  "Lati Navi par Mélo.xlsx": "Lati Navi",
  "Leviatos Trichyor - Gotal - Arché-archiviste.xlsx": "Leviatos Trichyor",
  "Mélo Hard way.xlsx": "Meta Dima",
  "Neos Lauviah - Jedi gris.xlsx": "Neos Lauviah",
  "Nermoniuon - Chagrian - Marchand.xlsx": "Nermoniuon Torusako",
  "Nitth_Jal_Mu Mira - Chiss - Assasin.xlsx": "Nitth'Jal'Mu Mira",
  "Nys Abrâam - Chagrian - Sénateur.xlsx": "Nys Abrâam",
  "P54 Marcus - Robot - Journaliste.xlsx": "P54 Marcus",
  "Pirogue Lucy - Gran - Soldat d_élite [jouer par NANOU].xlsx": "Pirogue Lucy",
  "Putovyan - Nautolans - MEDIC.xlsx": "Putovyan Ykarto",
  "Ruby Rose - Humain - Assassin.xlsx": "Ruby Rose",
  "Serge Gomor - Pirate - pantoran.xlsx": "Serge Gomor",
  "Sikou Karth_Uch - Cathar - Chasseur de prime.xlsx": "Sikou Karth'Uch",
  "Stazzi - Twi_lek - Apprenti sith.xlsx": "Stazzi Korok",
  "Tontony Tourchi-Toydarien-Contrebandier.xlsx": "Tontony Toulchi",
  "Turrlutte - Evocci - Pirate.xlsx": "Turrlutte",
  "Vanys Dahlia - TWI_LEK - Prostituée.xlsx": "Vanys Dahlila",
  "Veladern Tantema - Dug - Pilote [Jouer par _].xlsx": "Veladern Tantema",
  "Wakya - Mirilans - Soldat Lourd.xlsx": "Wakya Voluptaria",
  "[MORTE] Tira-Ni Lano - Chagrian - Mécanicienne [Joué par Joe].xlsx": "Tira-Ni Lano",
  "[MORT] PATAR  - Ewok Falleen - Cuisinier.xlsx": "Patar",
  "copi flo.xlsx": "Flo"
};

/** Noms de métier des fiches → nom du compendium Métiers (les autres restent en texte, sans lien). */
const ALIAS_METIERS = { "chasseur de prime": "chasseur de primes", "mecanicienne": "mecanicien", "marchant": "marchand", "sans emplois": "sans emploi" };

/** Noms de race des fiches → nom du compendium Races (hybride : l'espèce dominante, la mention reste en biographie). */
const ALIAS_RACES = { "ewok falleen": "ewok" };

const CARACTERISTIQUES = ["force", "capCombat", "capTir", "dexterite", "mentale", "perception", "stress", "affForce"];

const cle = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "'")
  .replace(/\s+/g, " ").toLowerCase().trim();
const html = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const texte = (s) => String(s ?? "").replace(/\r/g, "").trim();
const paragraphes = (s) => texte(s).split(/\n\s*\n/).map((p) => `<p>${html(p).replace(/\s*\n\s*/g, " ")}</p>`).join("");

/** Identifiant Foundry (16 caractères alphanumériques) stable, dérivé d'une graine. */
function idStable(graine) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return [...createHash("sha256").update(graine).digest()].slice(0, 16).map((o) => alphabet[o % 62]).join("");
}

const slug = (s) => cle(s).replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Documents d'un compendium source, indexés par nom normalisé. */
function compendium(nom) {
  const dossier = path.join(root, "packs", "_source", nom);
  const docs = readdirSync(dossier).filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => JSON.parse(readFileSync(path.join(dossier, f), "utf8")));
  return { docs, parNom: new Map(docs.map((d) => [cle(d.name), d])), parId: new Map(docs.map((d) => [d._id, d])) };
}

const races = compendium("races");
const metiers = compendium("metiers");
const traits = compendium("traits");

/** Cellules de la feuille : { r, c, v (valeur), t (texte affiché) }, triées par ligne puis colonne. */
function cellules(ws) {
  return Object.keys(ws).filter((k) => !k.startsWith("!")).map((k) => {
    const { r, c } = XLSX.utils.decode_cell(k);
    const v = ws[k].v;
    const t = texte(typeof v === "number" ? (ws[k].w ?? String(v)) : v);
    return { r, c, v, t };
  }).filter((x) => x.t !== "").sort((a, b) => a.r - b.r || a.c - b.c);
}

/** Lignes de texte d'un ensemble de cellules (une ligne de tableur = une ligne, cellules séparées par « — »). */
function lignes(cells) {
  const parLigne = new Map();
  for (const x of cells) parLigne.set(x.r, [...(parLigne.get(x.r) ?? []), x.t.replace(/\s*\n\s*/g, " ")]);
  return [...parLigne.values()].map((l) => l.join(" — "));
}

function lireFiche(fichier) {
  const wb = XLSX.readFile(path.join(dossierTableurs, fichier));
  const cells = cellules(wb.Sheets[wb.SheetNames[0]]);
  const utilisees = new Set();
  const en = (r, c) => cells.find((x) => x.r === r && x.c === c);
  const prendre = (x) => { if (x) utilisees.add(x); return x; };
  const trouver = (re) => prendre(cells.find((x) => re.test(cle(x.t))));
  const aDroite = (x) => x && prendre(cells.find((y) => y.r === x.r && y.c > x.c && y.c <= x.c + 7));
  /** Valeur d'un libellé « Nom : valeur » : après les deux-points, sinon cellule de droite. */
  const valeur = (x) => {
    if (!x) return "";
    const apres = x.t.split(":").slice(1).join(":").trim();
    return apres || (aDroite(x)?.t ?? "");
  };
  const dessous = (x, dc = 0) => x && prendre(en(x.r + 1, x.c + dc));
  const nombre = (x) => (typeof x?.v === "number" ? Math.max(0, Math.round(x.v)) : 0);

  const f = { fichier, nom: NOMS[fichier] };
  const entete = cells.find((x) => cle(x.t) === "force" && /cap/i.test(en(x.r, x.c + 1)?.t ?? ""));
  f.caracteristiques = {};
  CARACTERISTIQUES.forEach((k, i) => {
    prendre(en(entete.r, entete.c + i));
    const x = prendre(en(entete.r + 1, entete.c + i));
    f.caracteristiques[k] = nombre(x);
    if (x && typeof x.v !== "number") f.caracteristiquesNonChiffrees = [...(f.caracteristiquesNonChiffrees ?? []), `${k} « ${x.t} »`];
  });
  for (let c = entete.c + 8; c <= entete.c + 10; c++) prendre(en(entete.r + 1, c));
  const max = prendre(en(entete.r + 1, entete.c + 11)) ?? prendre(cells.find((x) => /^max \d+/i.test(x.t)));
  f.totalMax = /^max (\d+)/i.exec(max?.t ?? "")?.[1] ?? "";

  // « Nom : » vide sur la fiche : la cellule de droite est le libellé « Race », pas un nom.
  const sansLibelle = (s) => (/^race$/i.test(s) ? "" : s);
  f.infosNom = sansLibelle(valeur(trouver(/^nom\s*:/)));
  f.infosPrenom = sansLibelle(valeur(trouver(/^prenom\s*:/)));
  f.race = texte(aDroite(trouver(/^race\s*:?$/))?.t).replace(/\s*\n\s*/g, " ");
  const metier = valeur(trouver(/^metier\s*:?/));
  const [premiereLigne, ...suite] = metier.split("\n");
  const deuxPoints = suite.length ? -1 : premiereLigne.indexOf(":");
  f.metierNom = texte(deuxPoints >= 0 ? premiereLigne.slice(0, deuxPoints) : premiereLigne);
  f.metierDescription = texte(deuxPoints >= 0 ? premiereLigne.slice(deuxPoints + 1) : suite.join("\n"));
  const talent = valeur(trouver(/^talent\s*:?/));
  const i = talent.indexOf(":");
  f.talentNom = texte(i > 0 && i < 60 ? talent.slice(0, i) : "");
  f.talentDescription = texte(i > 0 && i < 60 ? talent.slice(i + 1) : talent);

  const corpulence = trouver(/^corpulence/);
  if (corpulence) {
    prendre(en(corpulence.r, corpulence.c + 1));
    prendre(en(corpulence.r, corpulence.c + 2));
    f.corpulence = dessous(corpulence)?.t ?? "";
    f.pvMax = nombre(dessous(corpulence, 1));
    f.pv = dessous(corpulence, 2) ? nombre(en(corpulence.r + 1, corpulence.c + 2)) : f.pvMax;
  }
  const chance = trouver(/^chance$/);
  const survie = trouver(/^survie$/);
  f.chance = nombre(dessous(chance));
  f.survie = nombre(dessous(survie));
  if (survie) { prendre(en(survie.r + 1, survie.c + 1)); prendre(en(survie.r + 1, survie.c + 2)); }
  const argent = trouver(/^(argent|credits? actuels?)\s*:?/);
  f.credits = nombre(aDroite(argent));

  // Équipement : sous son libellé, sur 5 colonnes au plus et à gauche de la description (la colonne d'à côté sert
  // souvent de notes : contacts, quêtes) ; description : la cellule sous « Descr… ».
  const libEquipement = trouver(/^equipement\s*:?$/);
  const libDescription = trouver(/^descr/);
  const descriptionCellule = libDescription && (dessous(libDescription) ?? aDroite(libDescription));
  f.description = descriptionCellule?.t ?? "";
  const limite = Math.min((libEquipement?.c ?? 0) + 5,
    libDescription && libDescription.c > (libEquipement?.c ?? 0) ? libDescription.c : Infinity);
  const equipement = libEquipement ? cells.filter((x) => x.r > libEquipement.r && x.c < limite && !utilisees.has(x)) : [];
  equipement.forEach(prendre);
  f.equipement = lignes(equipement).join("\n");

  // Reste de la feuille (contacts, comptes, vaisseaux, quêtes…) hors cartouche du modèle, puis les autres onglets.
  const modele = /^(photo|fiche de personnage|interdit de mettre|%|=|:p)/;
  const titre = cells.find((x) => x.r === 0 && /fiche de personnage/i.test(x.t));
  f.auteur = /fait par|jou[ée]r? par/i.test(titre?.t ?? "") ? titre.t.split(":").slice(1).join(":").trim() : "";
  f.joueur = /\[jou[ée]r? par ([^\]]+)\]/i.exec(fichier)?.[1]?.replace(/^_$/, "") ?? "";
  f.notes = lignes(cells.filter((x) => !utilisees.has(x) && !modele.test(cle(x.t))));
  f.onglets = wb.SheetNames.slice(1).map((nom) => ({ nom: nom.trim(), lignes: lignes(cellules(wb.Sheets[nom])) }))
    .filter((o) => o.lignes.length);
  f.mort = /^\[MORTE?\]/.test(fichier);
  return f;
}

/** Image du portrait : celle ancrée le plus haut à gauche dans le dessin de la première feuille. */
function portrait(fichier) {
  const wb = XLSX.readFile(path.join(dossierTableurs, fichier), { bookFiles: true });
  const lire = (p) => { const e = wb.files?.[p]; return e?.content ? Buffer.from(e.content) : null; };
  const relsFeuille = lire("xl/worksheets/_rels/sheet1.xml.rels")?.toString() ?? "";
  const dessin = /Target="\.\.\/drawings\/(drawing\d+\.xml)"/.exec(relsFeuille)?.[1];
  if (!dessin) return null;
  const xml = lire(`xl/drawings/${dessin}`)?.toString() ?? "";
  const rels = lire(`xl/drawings/_rels/${dessin}.rels`)?.toString() ?? "";
  const ancres = [...xml.matchAll(/<xdr:from><xdr:col>(\d+)<\/xdr:col>.*?<xdr:row>(\d+)<\/xdr:row>.*?r:embed="([^"]+)"/gs)]
    .map(([, c, r, id]) => ({ c: +c, r: +r, id })).filter((a) => a.r <= 6 && a.c <= 3).sort((a, b) => a.r - b.r || a.c - b.c);
  if (!ancres.length) return null;
  const cible = new RegExp(`Id="${ancres[0].id}"[^>]*Target="\\.\\./media/([^"]+)"`).exec(rels)?.[1];
  const contenu = cible && lire(`xl/media/${cible}`);
  return contenu ? { contenu, extension: path.extname(cible) } : null;
}

function descriptionHtml(f) {
  const infos = [
    f.joueur && `<strong>Joueur :</strong> ${html(f.joueur)}`,
    f.auteur && `<strong>Fiche :</strong> ${html(f.auteur)}`,
    f.race && cle(f.race) in ALIAS_RACES && `<strong>Race sur la fiche d'origine :</strong> ${html(f.race)}`,
    f.corpulence && `<strong>Corpulence :</strong> ${html(f.corpulence)}`,
    f.totalMax && `<strong>Total maximal des caractéristiques :</strong> ${html(f.totalMax)}`,
    f.caracteristiquesNonChiffrees && `<strong>Caractéristiques sans valeur :</strong> ${html(f.caracteristiquesNonChiffrees.join(", "))} (mises à 0)`,
    f.mort && "<strong>Personnage décédé.</strong>"
  ].filter(Boolean);
  const liste = (l) => `<ul>${l.map((x) => `<li>${html(x)}</li>`).join("")}</ul>`;
  return [
    f.description && paragraphes(f.description),
    infos.length && `<p>${infos.join("<br>")}</p>`,
    f.notes.length && `<h2>Notes de la fiche d'origine</h2>${liste(f.notes)}`,
    ...f.onglets.map((o) => `<h3>${html(o.nom)}</h3>${liste(o.lignes)}`),
    `<p><em>Importé de « ${html(f.fichier)} ».</em></p>`
  ].filter(Boolean).join("");
}

function acteur(f, sort) {
  const id = idStable(`personnages-rapides:${f.fichier}`);
  const race = races.parNom.get(ALIAS_RACES[cle(f.race)] ?? cle(f.race));
  const metier = metiers.parNom.get(ALIAS_METIERS[cle(f.metierNom)] ?? cle(f.metierNom));
  const img = existsSync(path.join(root, dossierWebp, `${slug(f.nom)}.webp`))
    ? `systems/galactic-wars/${dossierWebp}/${slug(f.nom)}.webp` : "icons/svg/mystery-man.svg";

  // Trait du métier, variante fiche rapide, comme le pose applyMetier (drapeau traitMetier + lien compendium).
  const items = [];
  const trait = metier && traits.parId.get(metier.system.traits?.rapide?.split(".").pop());
  if (trait) {
    const itemId = idStable(`${id}:trait`);
    items.push({
      ...structuredClone(trait), _key: `!actors.items!${id}.${itemId}`, _id: itemId, folder: null, sort: 100000,
      effects: (trait.effects ?? []).map((e) => ({ ...structuredClone(e), _key: `!actors.items.effects!${id}.${itemId}.${e._id}` })),
      flags: { "galactic-wars": { traitMetier: true } },
      _stats: { ...trait._stats, compendiumSource: `Compendium.galactic-wars.traits.Item.${trait._id}` }
    });
  }

  return {
    _key: `!actors!${id}`,
    _id: id,
    name: f.nom,
    type: "personnage-rapide",
    img,
    system: {
      infos: { nom: f.infosNom, prenom: f.infosPrenom },
      race: { uuid: race ? `Compendium.galactic-wars.races.Item.${race._id}` : "", nom: race?.name ?? f.race },
      metier: {
        uuid: metier ? `Compendium.galactic-wars.metiers.Item.${metier._id}` : "",
        nom: metier?.name ?? f.metierNom,
        description: f.metierDescription
      },
      talent: { nom: f.talentNom, description: f.talentDescription },
      caracteristiques: f.caracteristiques,
      survie: { base: f.survie, racial: 0 },
      chance: f.chance,
      pv: { value: Math.min(f.pv ?? 10, f.pvMax ?? 10), max: f.pvMax ?? 10 },
      equipement: f.equipement,
      credits: f.credits,
      portrait: img,
      description: descriptionHtml(f)
    },
    prototypeToken: { name: f.nom, texture: { src: img }, actorLink: true, disposition: 1 },
    items,
    effects: [],
    folder: f.mort ? DOSSIER_MORTS._id : null,
    sort,
    ownership: { default: 0 },
    flags: { "galactic-wars": { importFicheRapide: f.fichier } },
    _stats: { compendiumSource: null, duplicateSource: null, coreVersion: "14", systemId: "galactic-wars", systemVersion: "0.24.0" }
  };
}

const DOSSIER_MORTS = {
  _key: `!folders!${idStable("personnages-rapides:dossier-morts")}`,
  _id: idStable("personnages-rapides:dossier-morts"),
  name: "Personnages décédés", type: "Actor", folder: null, sorting: "a", sort: 100000, color: null, description: "",
  flags: {}, _stats: { compendiumSource: null, duplicateSource: null, coreVersion: "14", systemId: "galactic-wars", systemVersion: "0.24.0" }
};

const fichiers = readdirSync(dossierTableurs).filter((f) => f.endsWith(".xlsx") && !EXCLUS.has(f)).sort((a, b) => a.localeCompare(b));
const sansNom = fichiers.filter((f) => !NOMS[f]);
if (sansNom.length) throw new Error(`Fichiers sans nom affiché dans NOMS : ${sansNom.join(", ")}`);

if (existsSync(sortie)) rmSync(sortie, { recursive: true, force: true });
mkdirSync(sortie, { recursive: true });
if (dossierPortraits) mkdirSync(dossierPortraits, { recursive: true });
writeFileSync(path.join(sortie, "_dossier-morts.json"), `${JSON.stringify(DOSSIER_MORTS, null, 2)}\n`);

const rapport = [];
const fiches = fichiers.map(lireFiche).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
fiches.forEach((f, i) => {
  const doc = acteur(f, (i + 1) * 100000);
  writeFileSync(path.join(sortie, `${slug(f.nom)}.json`), `${JSON.stringify(doc, null, 2)}\n`);
  if (dossierPortraits) {
    const p = portrait(f.fichier);
    if (p) writeFileSync(path.join(dossierPortraits, `${slug(f.nom)}${p.extension}`), p.contenu);
  }
  rapport.push({
    nom: f.nom, race: doc.system.race.uuid ? doc.system.race.nom : `${f.race} (sans lien)`,
    metier: doc.system.metier.uuid ? doc.system.metier.nom : `${f.metierNom} (sans lien)`,
    trait: doc.items[0]?.name ?? "", total: Object.values(f.caracteristiques).reduce((a, b) => a + b, 0),
    chance: f.chance, survie: f.survie, pv: `${doc.system.pv.value}/${doc.system.pv.max}`, credits: f.credits,
    notes: f.notes.length, onglets: f.onglets.length, portrait: doc.img !== "icons/svg/mystery-man.svg"
  });
});
console.table(rapport);
console.log(`${fiches.length} personnage(s) -> ${path.relative(process.cwd(), sortie)}`);
