import fs from 'fs';

const filePath = './src/messages/it.json';

// Leggi il file come testo UTF-8
let content = fs.readFileSync(filePath, 'utf8');

// Pattern di sostituzione per emoji corrotti
// Ogni riga: [pattern corrotto, emoji corretto]
const replacements = [
  ['ðŸ'', '💍'],  // Ring
  ['ðŸ'€', '👀'],  // Eyes
  ['ðŸ'¡', '💡'],  // Light bulb
  ['ðŸ'°', '💰'],  // Money bag
  ['ðŸ'µ', '💵'],  // Dollar bill
  ['ðŸ¦', '🏦'],  // Bank
  ['ðŸ''', '💑'],  // Couple with heart
  ['ðŸ'•', '💕'],  // Two hearts
  ['ðŸ ', '🏠'],  // House
  ['ðŸŒŸ', '🌟'],  // Glowing star
  ['ðŸ'ª', '�'],  // Flexed biceps
  ['ðŸ"', '📋'],  // Clipboard
  ['ðŸ¢', '🏢'],  // Office building
  ['ðŸ"–', '�'],  // Open book
  ['ðŸ"', '📝'],  // Memo
  ['ðŸ"Š', '📊'],  // Bar chart
  ['ðŸ'¥', '👥'],  // Busts in silhouette
  ['ðŸ'¾', '💾'],  // Floppy disk
  ['ðŸ"'', '🔒'],  // Lock
  ['ðŸ"¢', '📢'],  // Loudspeaker
  ['ðŸ"‹', '📋'],  // Clipboard
  ['ðŸ"˜', '📘'],  // Blue book
  ['ðŸ¤µ', '🤵'],  // Man in tuxedo
  ['â€"', '—'],   // Em dash
];

// Contatore per le sostituzioni
let totalReplacements = 0;

// Applica tutte le sostituzioni
for (const [pattern, replacement] of replacements) {
  const beforeCount = (content.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  
  // Usa una regex globale con escape dei caratteri speciali
  const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  content = content.replace(regex, replacement);
  
  if (beforeCount > 0) {
    console.log(`✓ ${pattern} → ${replacement} (${beforeCount} sostituzioni)`);
    totalReplacements += beforeCount;
  }
}

// Scrivi il file corretto
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ File completamente corretto!`);
console.log(`📊 Totale sostituzioni: ${totalReplacements}`);
