// Outil de lecture ad hoc pour inspecter un PDF source. Meme logique que dump-xlsx.mjs /
// dump-docx.mjs : une vraie librairie de parsing plutot qu'un dezippage + regex maison.
// Usage : node scripts/dump-pdf.mjs "chemin/vers/fichier.pdf"
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/dump-pdf.mjs <fichier.pdf>");
  process.exit(1);
}

const buffer = await readFile(file);
const parser = new PDFParse({ data: buffer });
const result = await parser.getText();
console.log(result.text);
await parser.destroy();
