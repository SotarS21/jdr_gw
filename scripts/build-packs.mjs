// Compile packs/_source/<pack>/*.json (un document par fichier, JSON lisible)
// en compendiums LevelDB dans packs/<pack>/, au format attendu par Foundry VTT v14.
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { readdirSync, readFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.join(root, "..", "packs", "_source");
const outRoot = path.join(root, "..", "packs");

const packs = readdirSync(sourceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const pack of packs) {
  const srcDir = path.join(sourceRoot, pack);
  const outDir = path.join(outRoot, pack);

  const files = readdirSync(srcDir).filter((f) => f.endsWith(".json"));
  const docs = files.map((f) => JSON.parse(readFileSync(path.join(srcDir, f), "utf8")));

  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });

  await compilePack(srcDir, outDir, { yaml: false, log: false, transformEntries: () => true });
  console.log(`pack "${pack}": ${docs.length} document(s) -> ${path.relative(process.cwd(), outDir)}`);
}
