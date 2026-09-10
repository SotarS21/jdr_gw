// Outil de lecture ad hoc pour inspecter un classeur .xlsx source avant transcription
// manuelle vers un compendium (packs/_source/**). Utilise la librairie `xlsx` (SheetJS)
// plutôt qu'un parsing XML/regex maison : les tentatives précédentes (dump_sheet.js) ont
// laissé passer un bug sur les cellules Excel auto-fermantes (voir JOURNAL.md, session du
// 2026-09-10) — ne pas réintroduire d'extracteur ad hoc, préférer cette librairie.
//
// Usage : node scripts/dump-xlsx.mjs "chemin/vers/fichier.xlsx"
import XLSX from "xlsx";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/dump-xlsx.mjs <fichier.xlsx>");
  process.exit(1);
}

const wb = XLSX.readFile(file);
for (const sheetName of wb.SheetNames) {
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: "" });
  console.log(`=== Sheet: ${sheetName} ===`);
  rows.forEach((row, i) => {
    if (row.some((cell) => cell !== "")) console.log(i, JSON.stringify(row));
  });
}
