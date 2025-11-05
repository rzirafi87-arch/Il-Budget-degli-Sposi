import fs from 'fs';

const filePath = './src/messages/it.json';

// Leggi il file
let content = fs.readFileSync(filePath, 'utf8');

// Pattern rimanenti da fixare
const replacements = [
  // Ellipsis
  ['â€¦', '…'],
  
  // Checkmarks e simboli
  ['âœ"', '✓'],
  ['âœ—', '✗'],
  ['âŒ', '❌'],
  ['âœ…', '✅'],
  
  // Euro
  ['â‚¬', '€'],
  
  // Em dash (se ancora presente)
  ['â€"', '—'],
  
  // Frecce
  ['â†'', '→'],
];

let totalCount = 0;

console.log('Sostituzioni simboli:');
for (const [corrupted, correct] of replacements) {
  const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const count = (content.match(regex) || []).length;
  
  if (count > 0) {
    content = content.replace(regex, correct);
    console.log(`✓ ${JSON.stringify(corrupted)} → ${correct} (${count}x)`);
    totalCount += count;
  }
}

// Scrivi file
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ Completato! ${totalCount} sostituzioni di simboli.`);

// Check remaining corruption
const remaining = (content.match(/â/g) || []).length;
if (remaining > 0) {
  console.log(`\n⚠️  ${remaining} caratteri â ancora presenti (potrebbero essere legittimi)`);
}