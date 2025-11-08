import fs from "fs";

const DEFAULT_FILE = "./src/messages/it.json";
const filePath = process.argv[2] ?? DEFAULT_FILE;

console.log("🔧 Normalizzazione mojibake JSON\n");

if (!fs.existsSync(filePath)) {
  console.error(`❌ File non trovato: ${filePath}`);
  process.exit(1);
}

const originalContent = fs.readFileSync(filePath, "utf8");
const json = JSON.parse(originalContent);

const arrowPlaceholder = /\u2192/g; // →
const ringWithBang = /\u{1F48D}\u00A1\s*/gu; // 💍¡
const eyesWithScaron = /\u{1F440}\u0160\s*/gu; // 👀Š
const strayScaron = /\u0160/g; // Š singolo

const replacements = [
  {
    label: "arrow->'le '",
    apply: (value) => value.replace(arrowPlaceholder, "le "),
  },
  {
    label: "💍¡ cleanup",
    apply: (value) => value.replace(ringWithBang, "\u{1F48D} "),
  },
  {
    label: "👀Š cleanup",
    apply: (value) => value.replace(eyesWithScaron, "\u{1F440} "),
  },
  {
    label: "Š residual",
    apply: (value) => value.replace(strayScaron, ""),
  },
  {
    label: "spazi doppi",
    apply: (value) => value.replace(/ {2,}/g, " "),
  },
  {
    label: "spazi prima della punteggiatura",
    apply: (value) => value.replace(/\s+([,.;:!?])/g, "$1"),
  },
  {
    label: "spazi parentesi",
    apply: (value) => value.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")"),
  },
];

const changes = {};

function cleanValue(value, path) {
  let updated = value;
  for (const { label, apply } of replacements) {
    const next = apply(updated);
    if (next !== updated) {
      if (!changes[path]) changes[path] = new Set();
      changes[path].add(label);
      updated = next;
    }
  }
  return updated;
}

function walk(node, path = "") {
  if (typeof node === "string") {
    return cleanValue(node, path);
  }

  if (Array.isArray(node)) {
    return node.map((item, index) => walk(item, `${path}[${index}]`));
  }

  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      const nextPath = path ? `${path}.${key}` : key;
      node[key] = walk(value, nextPath);
    }
  }

  return node;
}

walk(json);

if (Object.keys(changes).length === 0) {
  console.log("✅ Nessuna sostituzione necessaria.");
  process.exit(0);
}

const backupPath = `${filePath}.before-fix`;
fs.writeFileSync(backupPath, originalContent, "utf8");
fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf8");

console.log(`💾 Backup creato: ${backupPath}`);
console.log("🧹 Sostituzioni applicate:");
for (const [path, labels] of Object.entries(changes)) {
  console.log(` - ${path}: ${[...labels].join(", ")}`);
}
