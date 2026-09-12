import { scanRuntimeRoots } from "./lib/italian-runtime-scanner.mjs";

const result = scanRuntimeRoots();
if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Hardcoded Italian runtime scanner total: ${result.total}`);
  console.log(`Categories: ${JSON.stringify(result.summary)}`);
  for (const item of result.findings) console.log(`${item.file}:${item.line}:${item.column} [${item.category}/${item.astType}/${item.context}] ${JSON.stringify(item.text)}`);
}
if (process.argv.includes("--fail") && result.findings.some(item => item.userFacing || item.category === "C")) process.exit(1);
