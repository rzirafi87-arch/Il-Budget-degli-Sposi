import fs from 'fs';

// Leggi il file
const content = fs.readFileSync('src/messages/it.json', 'utf8');

// Fix caratteri corrotti
let fixed = content
  // Vocali accentate
  .replace(/Ã¨/g, 'è')
  .replace(/Ã /g, 'à')
  .replace(/Ã²/g, 'ò')
  .replace(/Ã¹/g, 'ù')
  .replace(/Ã©/g, 'é')
  .replace(/Ãˆ/g, 'È')
  .replace(/Ã¬/g, 'ì')
  .replace(/Ã¹/g, 'ù')
  // Simboli
  .replace(/â€"/g, '—')
  .replace(/â€¢/g, '•')
  .replace(/âœ¨/g, '✨')
  // Emoji
  .replace(/ðŸ'/g, '💍')
  .replace(/ðŸŽ‰/g, '🎉')
  .replace(/ðŸ'€/g, '👀')
  .replace(/ðŸ'•/g, '💕')
  .replace(/ðŸŽŠ/g, '🎊')
  .replace(/ðŸ /g, '🏠')
  .replace(/ðŸ"Š/g, '📊')
  .replace(/ðŸ"…/g, '📅')
  .replace(/ðŸ'°/g, '💰')
  .replace(/ðŸ"/g, '📝')
  .replace(/ðŸ'Œ/g, '💌')
  .replace(/ðŸŽ¯/g, '🎯')
  // HTML entities
  .replace(/&apos;/g, "'")
  .replace(/&quot;/g, '"')
  // Rimuovi tag HTML problematici
  .replace(/"subtitleHtml":/g, '"subtitle":')
  .replace(/"textHtml":/g, '"text":')
  .replace(/<strong>/g, '')
  .replace(/<\/strong>/g, '')
  .replace(/<br \/>/g, ' ');

// Scrivi il file corretto
fs.writeFileSync('src/messages/it.json', fixed, 'utf8');

console.log('✅ File corretto! Caratteri UTF-8 ripristinati e tag HTML rimossi.');
