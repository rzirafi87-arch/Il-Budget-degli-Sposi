import fs from "fs";

const filePath = "./src/messages/it.json";
let content = fs.readFileSync(filePath, "utf8");

const replacements: [string, string][] = [
  ["â€¦", "…"],
  ["âœ“", "✓"],
  ["âœ—", "✗"],
  ["âŒ", "❌"],
  ["âœ…", "✅"],
  ["â‚¬", "€"],
  ["â€”", "—"],
  ["â€“", "–"],
  ["â†’", "→"],
];

let total = 0;
console.log("Normalizzazione simboli:");
for (const [bad, good] of replacements) {
  const re = new RegExp(bad.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
  const count = (content.match(re) || []).length;
  if (count) {
    content = content.replace(re, good);
    console.log(`✓ ${bad} → ${good} (${count})`);
    total += count;
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log(`\n✅ Completato: ${total} sostituzioni.`);
const remaining = (content.match(/â/g) || []).length;
if (remaining) console.log(`⚠️  Residui 'â': ${remaining}`);