import fs from 'fs';

const filePath = './src/messages/it.json';

// Leggi il file come testo UTF-8
let content = fs.readFileSync(filePath, 'utf8');

// Pattern di sostituzione: [pattern corrotto, emoji corretto usando Unicode escapes]
const replacements = [
  // Tutti i pattern ðŸ + carattere
  [/ðŸ'/g, '\u{1F48D}'],   // 💍 Ring
  [/ðŸ'€/g, '\u{1F440}'],  // 👀 Eyes
  [/ðŸ'¡/g, '\u{1F4A1}'],  // 💡 Light bulb
  [/ðŸ'°/g, '\u{1F4B0}'],  // 💰 Money bag
  [/ðŸ'µ/g, '\u{1F4B5}'],  // 💵 Dollar bill
  [/ðŸ¦/g, '\u{1F3E6}'],   // 🏦 Bank
  [/ðŸ''/g, '\u{1F491}'],  // 💑 Couple with heart
  [/ðŸ'•/g, '\u{1F495}'],  // 💕 Two hearts
  [/ðŸ /g, '\u{1F3E0}'],   // 🏠 House
  [/ðŸŒŸ/g, '\u{1F31F}'],  // 🌟 Glowing star
  [/ðŸ'ª/g, '\u{1F4AA}'],  // 💪 Flexed biceps
  [/ðŸ"/g, '\u{1F4CB}'],   // 📋 Clipboard
  [/ðŸ¢/g, '\u{1F3E2}'],   // 🏢 Office building
  [/ðŸ"–/g, '\u{1F4D6}'],  // 📖 Open book
  [/ðŸ"/g, '\u{1F4DD}'],   // 📝 Memo
  [/ðŸ"Š/g, '\u{1F4CA}'],  // 📊 Bar chart
  [/ðŸ'¥/g, '\u{1F465}'],  // 👥 Busts in silhouette
  [/ðŸ'¾/g, '\u{1F4BE}'],  // 💾 Floppy disk
  [/ðŸ"'/g, '\u{1F512}'],  // 🔒 Lock
  [/ðŸ"¢/g, '\u{1F4E2}'],  // 📢 Loudspeaker
  [/ðŸ"‹/g, '\u{1F4CB}'],  // 📋 Clipboard
  [/ðŸ"˜/g, '\u{1F4D8}'],  // 📘 Blue book
  [/ðŸ¤µ/g, '\u{1F935}'],  // 🤵 Man in tuxedo
  
  // Em dash già fixato ma check
  [/â€"/g, '\u2014'],      // — Em dash
];

// Contatore
let totalReplacements = 0;
const details = [];

// Applica tutte le sostituzioni
for (const [pattern, replacement] of replacements) {
  const matches = content.match(pattern);
  const count = matches ? matches.length : 0;
  
  if (count > 0) {
    content = content.replace(pattern, replacement);
    const emoji = String.fromCodePoint(parseInt(replacement.replace(/[\\u{}]/g, ''), 16));
    details.push(`${count}x → ${emoji}`);
    totalReplacements += count;
  }
}

// Scrivi il file corretto
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ File completamente corretto!');
console.log(`📊 Totale sostituzioni emoji: ${totalReplacements}`);
if (details.length > 0) {
  console.log('\nDettagli:');
  details.forEach(d => console.log(`  ${d}`));
}
