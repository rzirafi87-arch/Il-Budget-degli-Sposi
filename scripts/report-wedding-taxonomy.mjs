import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../src/constants/budgetCategories.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const loaded = { exports: {} };
vm.runInNewContext(js, { module: loaded, exports: loaded.exports, require: () => new Proxy({}, { get: () => () => [] }) });
const rows = loaded.exports.WEDDING_BUDGET_TAXONOMY;
console.table(rows.map(({ key, label, aliases, category, contexts }) => ({ key, label, aliases: aliases.join(" | "), category, contexts: contexts.join(" | ") })));
console.log(`Canonical items: ${rows.length}; keys: ${new Set(rows.map((row) => row.key)).size}`);
