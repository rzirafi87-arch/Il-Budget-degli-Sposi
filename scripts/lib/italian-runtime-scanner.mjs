import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const defaultRoots = ["src/app", "src/components", "src/hooks", "src/lib"];
const ignored = /(?:^|\/)(?:__tests__|data)(?:\/|$)|\.(?:test|spec)\.[cm]?[jt]sx?$/;
const uiAttributes = new Set(["alt", "aria-label", "aria-description", "aria-describedby", "description", "eyebrow", "helperText", "label", "placeholder", "title"]);
const implementationAttributes = new Set(["filename"]);
const uiCalls = new Set(["alert", "confirm", "prompt", "setError", "setMessage", "showToast"]);
const implementationCalls = new Set(["getPageImages"]);
const uiProperties = new Set(["alt", "ariaLabel", "breadcrumb", "description", "empty", "error", "eyebrow", "helper", "label", "placeholder", "tab", "title", "tooltip"]);
const uiCollectionNames = /(?:breadcrumbs?|columns?|headers?|labels?|menu|options?|statuses|tabs?|tooltips?)$/i;
const italian = /\b(?:accedi|aggiungi|allergi[ae]|annulla|apri|assegna|azioni|bombonier[ae]|caricamento|cerca|chiudi|comun[ei]|conferma|confermat[ao]|confetti|contatto|continua|crea|data|devi|elimina|errore|evento|famigli[ae]|fornitore|impossibile|impostazioni|invit(?:at[ioe]?|o|a)|matrimonio|modifica|nessun[ao]?|nome|note|partecipa|persona|posti?|preferenze|profilo|ricevuta|rifiutat[ao]|riprova|richiesta|risposta|salva|salvataggio|scegli|segnalat[ae]|seleziona|senza|spesa|spos[ao]|tavol[oi]|totale|verifica)\b/i;
const invariant = new Set(["SIAE", "Wikidata", "OpenStreetMap", "Made in Italy", "Email", "Password", "Dashboard", "Budget", "Save the Date"]);
const stableCode = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/;
const implementationString = /^(?:\.?\.?\/.*|\/.*|https?:\/\/.*|[\w@.-]+\.(?:css|json|sql|tsx?|jsx?|mjs|png|jpe?g|svg|pdf))$/i;
const sql = /^\s*(?:select|insert|update|delete|alter|create|drop|grant|revoke)\b/i;

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : /\.[jt]sx?$/.test(entry.name) && !ignored.test(file) ? [file] : [];
  });
}
function textValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node)) return node.text.trim();
  if (ts.isTemplateExpression(node)) return [node.head.text, ...node.templateSpans.map(span => span.literal.text)].join(" ").trim();
  return "";
}
function callName(node) { const expression = node.expression; return ts.isIdentifier(expression) ? expression.text : ts.isPropertyAccessExpression(expression) ? expression.name.text : ""; }
function isTranslationCall(node) {
  if (!ts.isCallExpression(node)) return false;
  if (callName(node) === "t") return true;
  const expression = node.expression;
  return ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression) && expression.expression.text === "t";
}
function propertyName(node) { return node?.name && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) ? node.name.text : ""; }
function variableName(node) {
  let current = node.parent;
  while (current && !ts.isStatement(current) && !ts.isSourceFile(current)) current = current.parent;
  if (!current || !ts.isVariableStatement(current)) return "";
  const declaration = current.declarationList.declarations[0];
  return declaration && ts.isIdentifier(declaration.name) ? declaration.name.text : "";
}
function uiContext(node) {
  if (ts.isJsxText(node)) return { userFacing:true, context:"JSX text", category:"A", action:"translate with next-intl" };
  let current = node.parent;
  while (current && !ts.isStatement(current) && !ts.isSourceFile(current)) {
    if (ts.isJsxAttribute(current) && implementationAttributes.has(current.name.getText())) return null;
    if (ts.isJsxExpression(current) && ts.isJsxAttribute(current.parent) && implementationAttributes.has(current.parent.name.getText())) return null;
    if (ts.isJsxAttribute(current) && uiAttributes.has(current.name.getText())) return { userFacing:true, context:`JSX attribute ${current.name.getText()}`, category:"B", action:"translate accessible/presentation attribute" };
    if (ts.isJsxExpression(current)) return { userFacing:true, context:"JSX expression", category:"A", action:"translate with next-intl" };
    if (ts.isPropertyAssignment(current) && uiProperties.has(propertyName(current))) return { userFacing:true, context:`UI object property ${propertyName(current)}`, category:"A", action:"translate UI configuration" };
    if (ts.isCallExpression(current)) {
      const name = callName(current);
      if (isTranslationCall(current)) return null;
      if (implementationCalls.has(name)) return null;
      if (uiCalls.has(name)) return { userFacing:true, context:`runtime call ${name}`, category:name === "setError" ? "D" : "A", action:"translate presentation message" };
      if (name === "Error") return { userFacing:false, context:"runtime Error", category:"C", action:"replace presentation leak with stable code" };
    }
    current = current.parent;
  }
  const name = variableName(node);
  if (name && uiCollectionNames.test(name)) return { userFacing:true, context:`UI collection ${name}`, category:"A", action:"translate UI configuration" };
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

export function scanSource(sourceText, file = "fixture.tsx") {
  if (ignored.test(file)) return [];
  const source = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const findings = [];
  function visit(node) {
    const text = textValue(node);
    const auditable = text && italian.test(text) && !invariant.has(text) && !stableCode.test(text) && !implementationString.test(text) && !sql.test(text);
    const audit = auditable ? uiContext(node) : null;
    if (audit) {
      const point = source.getLineAndCharacterOfPosition(node.getStart(source));
      findings.push({ file, line:point.line + 1, column:point.character + 1, astType:ts.SyntaxKind[node.kind], text, context:audit.context, module:moduleName(file), userFacing:audit.userFacing, category:audit.category, action:audit.action });
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return findings;
}
export function scanRuntimeRoots(roots = defaultRoots) {
  const findings = roots.flatMap(walk).flatMap(file => scanSource(fs.readFileSync(file, "utf8"), file));
  const summary = findings.reduce((result, item) => { result[item.category] = (result[item.category] || 0) + 1; return result; }, {});
  return { total:findings.length, summary, findings };
}
