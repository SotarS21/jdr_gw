// Outil de lecture ad hoc pour inspecter un document .docx source avant transcription
// manuelle vers le système (packs/_source/** ou config.mjs). Utilise `mammoth` (vraie
// librairie de parsing OOXML) plutôt qu'un dézippage + regex maison — voir dump-xlsx.mjs
// pour le précédent (bug corrigé en session du 2026-09-10) qui justifie ce choix.
//
// Usage : node scripts/dump-docx.mjs "chemin/vers/fichier.docx"
import mammoth from "mammoth";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/dump-docx.mjs <fichier.docx>");
  process.exit(1);
}

const result = await mammoth.extractRawText({ path: file });
console.log(result.value);
if (result.messages.length) {
  console.error("--- messages ---");
  for (const m of result.messages) console.error(m.message);
}
