import assert from "node:assert/strict";
import test from "node:test";
import { scanSource } from "./italian-runtime-scanner.mjs";

test("finds JSX and UI configuration presentation strings", () => {
  const source = `
    const columns = [{label: "Nome famiglia"}];
    const options = ["Confermato", "In attesa", "Rifiutato"];
    function View({condition, count, label}) { return <main aria-label="Gestione invitati" title="Elimina invitato">
      Nessun invitato presente
      {"Nome famiglia"}
      {condition ? "Invitato confermato" : "In attesa"}
      {condition && "Elimina invitato"}
      {\`Invitati totali: \${count}\`}
      {label || "Nome famiglia"}{label ?? "Senza nome"}
      <input placeholder="Nome invitato" />
      <table><thead><tr><th>Nome famiglia</th></tr></thead></table>
      <select><option>Famiglia</option></select>
    </main> }
  `;
  const texts = scanSource(source).map(item => item.text);
  for (const expected of ["Nome famiglia", "Confermato", "Gestione invitati", "Elimina invitato", "Nessun invitato presente", "Invitato confermato", "Invitati totali:", "Senza nome", "Nome invitato", "Famiglia"]) assert.ok(texts.includes(expected), `missing ${expected}`);
});

test("ignores implementation strings and test-only files", () => {
  const source = `const code="GUEST_SAVE_FAILED", route="/api/my/guests", taxonomy="wedding_bag_fan", query="SELECT * FROM guests", filename="invitati.json";`;
  assert.deepEqual(scanSource(source), []);
  assert.deepEqual(scanSource(`<div>Nessun invitato</div>`, "component.test.tsx"), []);
  assert.deepEqual(scanSource(`function View(){return <><span>{t("nonInvited.confetti")}</span><a href={\`/\${locale}/invitati\`}>x</a><Export filename="invitati" /></>}`), []);
  assert.deepEqual(scanSource(`function View(){return <Carousel images={getPageImages("invitati", country)} />}`), []);
});
