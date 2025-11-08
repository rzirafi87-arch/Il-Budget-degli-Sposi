import fs from 'fs';

const filePath = './src/messages/it.json';

console.log('Normalizzazione mojibake em-dash...\n');

let content = fs.readFileSync(filePath, 'utf8');
const originalContent = content;

// Pattern specifici trovati nel file
const replacements = [
  // Em-dash corrotto: â€" → —
  [/â€"/g, '—'],
  // Ellipsis corrotto se presente
  [/â€¦/g, '…'],
  // Right arrow se corrotto
  [/â†'/g, '→'],
];

let totalCount = 0;

for (const [pattern, replacement] of replacements) {
  const matches = content.match(pattern);
  const count = matches ? matches.length : 0;

  if (count > 0) {
    content = content.replace(pattern, replacement);
    console.log(`✓ Sostituiti ${count} caratteri corrotti con "${replacement}"`);
    totalCount += count;
  }
}

if (totalCount > 0) {
  // Backup
  const backupPath = filePath + '.backup';
  fs.writeFileSync(backupPath, originalContent, 'utf8');

  // Scrivi normalizzato
  fs.writeFileSync(filePath, content, 'utf8');

  console.log(`\n✅ ${totalCount} sostituzioni totali!`);
  console.log(`📦 Backup: ${backupPath}`);
} else {
  console.log('✅ Nessun mojibake trovato!');
}
