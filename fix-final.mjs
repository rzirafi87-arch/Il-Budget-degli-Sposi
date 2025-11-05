import fs from 'fs';

const filePath = './src/messages/it.json';

// Leggi il file
let content = fs.readFileSync(filePath, 'utf8');

// Replacements manuali e precisi
// ATTENZIONE: usare pattern molto specifici per evitare false positive
const replacements = [
  // Check e simboli - pattern completi per evitare falsi positivi
  ['"âœ"', '"✓'],    // Check mark all'inizio di stringa
  ['"âœ—', '"✗'],    // X mark all'inizio di stringa
  ['"âŒ', '"❌'],    // Cross all'inizio di stringa
  ['"âœ…', '"✅'],   // Checkbox all'inizio di stringa
  
  // Freccia - solo nel contesto specifico
  ['Esplora â†'', 'Esplora →'],
  ['â†' ', '→ '],    // Arrow seguito da spazio (nei breadcrumb)
  
  // Em dash - solo se seguito da spazio
  ['â€" ', '— '],
];

let totalCount = 0;

console.log('Sostituzioni sicure:');
for (const [corrupted, correct] of replacements) {
  const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const count = (content.match(regex) || []).length;
  
  if (count > 0) {
    content = content.replace(regex, correct);
    console.log(`✓ ${JSON.stringify(corrupted)} → ${JSON.stringify(correct)} (${count}x)`);
    totalCount += count;
  }
}

// Scrivi file
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ ${totalCount} sostituzioni sicure completate!`);

// Final check
console.log('\nVerifica finale:');
console.log('  ðŸ patterns:', (content.match(/ðŸ/g) || []).length);
console.log('  Ã patterns:', (content.match(/Ã/g) || []).length);
console.log('  â patterns (rimanenti):', (content.match(/â/g) || []).length);
