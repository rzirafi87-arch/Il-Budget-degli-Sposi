import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const patterns = [
  { name: "Google API key", regex: /AIza[0-9A-Za-z_-]{30,}/g },
  { name: "OpenAI API key", regex: /sk-(?:proj-)?[0-9A-Za-z_-]{20,}/g },
  { name: "Stripe secret", regex: /(?:sk_(?:live|test)|whsec)_[0-9A-Za-z]{16,}/g },
  { name: "GitHub token", regex: /gh[pousr]_[0-9A-Za-z]{20,}/g },
  {
    name: "Supabase service-role JWT",
    regex: /eyJ[0-9A-Za-z_-]+\.[0-9A-Za-z_-]*InNlcnZpY2Vfcm9sZSI[0-9A-Za-z_-]*\.[0-9A-Za-z_-]+/g,
  },
];

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const findings = [];

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (content.includes("\0")) continue;

  for (const { name, regex } of patterns) {
    regex.lastIndex = 0;
    for (const match of content.matchAll(regex)) {
      const line = content.slice(0, match.index).split("\n").length;
      findings.push(`${file}:${line}: ${name}`);
    }
  }
}

if (findings.length > 0) {
  console.error("[check-secrets] Potential committed secrets found:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log("[check-secrets] OK: no supported secret patterns found in tracked files.");
