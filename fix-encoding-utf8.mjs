import fs from 'fs';

const filePath = './src/messages/it.json';

console.log('🔧 Fix mojibake in it.json\n');

// Leggi come buffer per preservare encoding
const buffer = fs.readFileSync(filePath);
let content = buffer.toString('utf8');

// Backup
fs.writeFileSync(filePath + '.bak', content, 'utf8');

// Sostituzioni esplicite carattere per carattere
const fixes = [
  { from: '\u00E2\u0080\u0094', to: '\u2014', name: 'em-dash' },          // â€" → —
  { from: '\u00E2\u0080\u00A6', to: '\u2026', name: 'ellipsis' },         // â€¦ → …
  { from: '\u00E2\u0086\u0092', to: '\u2192', name: 'right-arrow' },      // â†' → →
  { from: '\u00E2\u0080\u009C', to: '\u201C', name: 'left-quote' },       // â€œ → "
  { from: '\u00E2\u0080\u009D', to: '\u201D', name: 'right-quote' },      // â€ → "
];

let total = 0;

for (const fix of fixes) {
  const count = (content.match(new RegExp(fix.from, 'g')) || []).length;
  if (count > 0) {
    content = content.split(fix.from).join(fix.to);
    console.log(`✓ ${fix.name}: ${count}x`);
    total += count;
  }
}

if (total > 0) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n✅ ${total} sostituzioni! Backup: ${filePath}.bak`);
} else {
  console.log('✅ Nessun mojibake trovato');
}
