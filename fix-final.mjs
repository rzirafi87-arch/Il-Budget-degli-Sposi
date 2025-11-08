import fs from "fs";

const filePath = "./src/messages/it.json";
let content = fs.readFileSync(filePath, "utf8");

// Replacements manuali e precisi (stringhe corrotte → caratteri corretti)
// Nota: le sequenze "â…" ecc. derivano da errata decodifica UTF-8.
const replacements: [string, string][] = [
  ["â€¦", "…"],
  ["âœ“", "✓"],
  ["âœ—", "✗"],
  ["âŒ", "❌"],
  ["âœ…", "✅"],
  ["â‚¬", "€"],
  ["â€”", "—"], // variante em dash
  ["â€“", "–"], // en dash
  ["â†’", "→"],
];

let totalCount = 0;
console.log("Sostituzioni sicure:");
for (const [corrupted, correct] of replacements) {
  const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
  const count = (content.match(regex) || []).length;
  if (count > 0) {
    content = content.replace(regex, correct);
    console.log(`✓ ${JSON.stringify(corrupted)} → ${JSON.stringify(correct)} (${count}x)`);
    totalCount += count;
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log(`\n✅ ${totalCount} sostituzioni completate.`);
console.log("\nVerifica finale:");
console.log("  → patterns:", (content.match(/→/g) || []).length);
console.log("  â residui:", (content.match(/â/g) || []).length);
