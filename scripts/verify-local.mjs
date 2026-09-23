/**
 * Vérification LOCALE d'un déploiement Galactic Wars, à lancer après scripts/deploy-local.ps1.
 *
 * Se connecte au monde de test avec le compte MJ de test (headless), vérifie que le client
 * charge bien la version de system.json, puis évalue un contrôle optionnel dans la page.
 *
 * Usage :
 *   node scripts/verify-local.mjs
 *   node scripts/verify-local.mjs "<expression JS async évaluée dans Foundry, doit renvoyer du JSON>"
 * Exemple :
 *   node scripts/verify-local.mjs "(await game.packs.get('galactic-wars.races').getDocuments()).filter(r => r.img.includes('oak.svg')).length"
 *
 * Playwright n'est pas une dépendance du projet : il est cherché dans le cache npx
 * (installé via `npx playwright install chromium` si absent).
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const URL_BASE = process.env.GW_URL ?? "http://localhost:30000";
const USER = process.env.GW_USER ?? "claude";
const PASSWORD = process.env.GW_PASSWORD ?? "1234";
const check = process.argv[2];

const expected = JSON.parse(fs.readFileSync(new URL("../system.json", import.meta.url))).version;

function findPlaywright() {
  const cache = execSync("npm config get cache").toString().trim();
  const npx = path.join(cache, "_npx");
  for (const dir of fs.existsSync(npx) ? fs.readdirSync(npx) : []) {
    const entry = path.join(npx, dir, "node_modules", "playwright", "index.mjs");
    if (fs.existsSync(entry)) return entry;
  }
  throw new Error("Playwright introuvable dans le cache npx — lancer `npx playwright install chromium`");
}

const { chromium } = await import(pathToFileURL(findPlaywright()).href);
const browser = await chromium.launch();
const errors = [];
try {
  const page = await browser.newPage();
  page.on("pageerror", e => errors.push(e.message));

  const status = await (await fetch(`${URL_BASE}/api/status`)).json();
  if (!status.active) throw new Error(`Aucun monde actif (${JSON.stringify(status)})`);

  await page.goto(`${URL_BASE}/join`);
  await page.fill("input[name=username]", USER);
  await page.fill("input[name=password]", PASSWORD);
  await page.click("button[name=join]");
  await page.waitForFunction(() => window.game?.ready, null, { timeout: 60000 });

  const version = await page.evaluate(() => game.system.version);
  const result = { world: status.world, expected, version, ok: version === expected };
  if (check) result.check = await page.evaluate(`(async () => (${check}))()`);
  result.pageErrors = errors;
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
} finally {
  await browser.close();
}
