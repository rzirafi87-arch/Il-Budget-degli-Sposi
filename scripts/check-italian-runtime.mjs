import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const roots = ["src/app", "src/components", "src/hooks", "src/lib"];
const ignored = /(?:^|\/)(?:__tests__|data)(?:\/|$)|\.(?:test|spec)\.[cm]?[jt]sx?$/;
const uiAttributes = new Set(["alt", "aria-label", "aria-description", "description", "eyebrow", "label", "placeholder", "title"]);
const uiCalls = new Set(["alert", "confirm", "prompt", "setError", "setMessage", "showToast"]);
const italian = /\b(?:accedi|aggiungi|annulla|apri|caricamento|cerca|conferma|continua|crea|devi|elimina|errore|evento|famiglia|fornitore|impossibile|impostazioni|invitato|matrimonio|modifica|nessun[ao]?|profilo|riprova|richiesta|salva|salvataggio|scegli|seleziona|spesa|verifica)\b/i;
const invariant = new Set(["SIAE", "Wikidata", "OpenStreetMap", "Made in Italy", "Email", "Password", "Dashboard", "Budget", "Save the Date"]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : /\.[jt]sx?$/.test(entry.name) && !ignored.test(file) ? [file] : [];
  });
}
function value(node) { return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node) ? node.text.trim() : ""; }
function callName(node) { const expression = node.expression; return ts.isIdentifier(expression) ? expression.text : ts.isPropertyAccessExpression(expression) ? expression.name.text : ""; }
function uiContext(node) {
  if (ts.isJsxText(node)) return { userFacing:true, context:"JSX text", category:"A", action:"translate with next-intl" };
  const parent = node.parent;
  if (ts.isJsxAttribute(parent) && uiAttributes.has(parent.name.getText())) return { userFacing:true, context:`JSX attribute ${parent.name.getText()}`, category:"B", action:"translate accessible/presentation attribute" };
  if (ts.isCallExpression(parent)) {
    const name = callName(parent);
    if (uiCalls.has(name)) return { userFacing:true, context:`runtime call ${name}`, category:name === "setError" ? "D" : "A", action:"translate presentation message" };
    if (name === "Error") return { userFacing:false, context:"runtime Error", category:"C", action:"replace presentation leak with stable code" };
  }
  let current = parent;
  while (current && !ts.isStatement(current) && !ts.isSourceFile(current)) {
    if (ts.isJsxExpression(current)) return { userFacing:true, context:"JSX expression", category:"A", action:"translate with next-intl" };
    current = current.parent;
  }
  return null;
}
function moduleName(file) {
  const route = file.match(/\(routes\)\/([^/]+)/)?.[1];
  if (route) return route;
  if (file.includes("/api/")) return "api";
  if (file.includes("/components/")) return "shared";
  if (file.includes("/hooks/")) return "hooks";
  return "runtime";
}

const findings = [];
for (const file of roots.flatMap(walk)) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(node) {
    const text = value(node), audit = text && italian.test(text) && !invariant.has(text) ? uiContext(node) : null;
    if (audit) {
      const point = source.getLineAndCharacterOfPosition(node.getStart(source));
      findings.push({ file, line:point.line + 1, column:point.character + 1, astType:ts.SyntaxKind[node.kind], text, context:audit.context, module:moduleName(file), userFacing:audit.userFacing, category:audit.category, action:audit.action });
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
const summary = findings.reduce((result, item) => { result[item.category] = (result[item.category] || 0) + 1; return result; }, {});
if (process.argv.includes("--json")) console.log(JSON.stringify({ total:findings.length, summary, findings }, null, 2));
else {
  console.log(`Hardcoded Italian runtime scanner total: ${findings.length}`);
  console.log(`Categories: ${JSON.stringify(summary)}`);
  for (const item of findings) console.log(`${item.file}:${item.line}:${item.column} [${item.category}/${item.astType}/${item.context}] ${JSON.stringify(item.text)}`);
}
if (process.argv.includes("--fail") && findings.some(item => item.userFacing || item.category === "C")) process.exit(1);
