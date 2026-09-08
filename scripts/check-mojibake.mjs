import fs from "node:fs";
import path from "node:path";
const roots = [path.join(process.cwd(), "src", "messages")];
const forbidden = [/Tota→/u, /â(?:†||€|™)/u, /Ã[\u0080-\u00BF]/u, /Â(?=\s|\p{S})/u, /�/u, /[\p{L}]→[\p{L}]/u];
const failures = [];
for (const root of roots) {
  for (const name of fs.readdirSync(root)) {
    if (!/^(it|landing\.it)\.json$/.test(name)) continue;
    const file = path.join(root, name);
    const text = fs.readFileSync(file, "utf8");
    for (const pattern of forbidden) if (pattern.test(text)) failures.push(`${file}: ${pattern}`);
  }
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("Semantic mojibake check passed");
