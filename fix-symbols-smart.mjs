import fs from 'fs';

const filePath = './src/messages/it.json';

// Leggi il file
let content = fs.readFileSync(filePath, 'utf8');

// Estrai i pattern corrotti direttamente dal file
const ellipsisPattern = content.match(/Caricamento(...)/)?.[1] || '';
const checkPattern = content.match(/approved.*?("....)" Approvato/)?.[1] || '';
const xPattern = content.match(/rejected.*?("....)" Rifiutato/)?.[1] || '';
const crossPattern = content.match(/mustAuthAdd.*?("...)" Devi/)?.[1] || '';
const checkboxPattern = content.match(/successAdded.*?("......)" /)?.[1] || '';
const euroPattern = content.match(/Importo \((...)\)/)?.[1] || '';
const arrowPattern = content.match(/Esplora (...)/)?.[1] || '';

console.log('Pattern trovati:');
console.log('Ellipsis:', JSON.stringify(ellipsisPattern));
console.log('Check:', JSON.stringify(checkPattern));
console.log('X:', JSON.stringify(xPattern));
console.log('Cross:', JSON.stringify(crossPattern));
console.log('Checkbox:', JSON.stringify(checkboxPattern));
console.log('Euro:', JSON.stringify(euroPattern));
console.log('Arrow:', JSON.stringify(arrowPattern));

// Mapping
const replacements = [
  [ellipsisPattern, '…'],
  [checkPattern.replace(/"/g, ''), '✓'],
  [xPattern.replace(/"/g, ''), '✗'],
  [crossPattern.replace(/"/g, ''), '❌'],
  [checkboxPattern.replace(/"/g, ''), '✅'],
  [euroPattern, '€'],
  [arrowPattern, '→'],
];

let totalCount = 0;

console.log('\nSostituzioni:');
for (const [corrupted, correct] of replacements) {
  if (!corrupted) continue;
  
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

console.log(`\n✅ ${totalCount} sostituzioni totali!`);