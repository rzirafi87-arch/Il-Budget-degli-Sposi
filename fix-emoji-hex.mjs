import fs from 'fs';

// Leggi il file in modalità binaria e poi converti
const buffer = fs.readFileSync('src/messages/it.json');
let content = buffer.toString('utf8');

// Definisci le sostituzioni con codici esatti
const replacements = [
  // Emoji corrotte (pattern hex)
  [/\xC3\xB0\xC5\xB8\xE2\x80\x99/g, '💍'], // ðŸ'
  [/\xC3\xB0\xC5\xB8\xE2\x80\x99\xE2\x82\xAC/g, '👀'], // ðŸ'€
  [/\xC3\xB0\xC5\xB8\xC2\xA0/g, '🏠'], // ðŸ 
  [/\xC3\xA2\xE2\x82\xAC\xE2\x80\x9D/g, '—'], // â€"
  [/\xC3\xA2\xC5\x93\xC2\xA8/g, '✨'], // âœ¨
  [/\xC3\xA2\xE2\x82\xAC\xC2\xA2/g, '•'], // â€¢
];

// Applica tutte le sostituzioni
for (const [pattern, replacement] of replacements) {
  content = content.replace(pattern, replacement);
}

// Scrivi il file
fs.writeFileSync('src/messages/it.json', content, 'utf8');

console.log('✅ File corretto con pattern esadecimali!');
