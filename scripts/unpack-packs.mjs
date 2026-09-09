// Extrait les compendiums LevelDB packs/<pack>/ vers packs/_source/<pack>/*.json
// (un fichier JSON lisible par document), pour édition à la main / diff git.
import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const outRoot = path.join(root, "..", "packs");
const sourceRoot = path.join(outRoot, "_source");

const packs = readdirSync(outRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "_source")
  .map((entry) => entry.name);

for (const pack of packs) {
  const inDir = path.join(outRoot, pack);
  const destDir = path.join(sourceRoot, pack);
  await extractPack(inDir, destDir, { yaml: false, log: false });
  console.log(`pack "${pack}" extrait -> ${path.relative(process.cwd(), destDir)}`);
}
