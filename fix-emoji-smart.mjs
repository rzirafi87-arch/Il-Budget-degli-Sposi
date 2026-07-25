import fs from 'fs';

const filePath = './src/messages/it.json';

// Leggi il file
let content = fs.readFileSync(filePath, 'utf8');

// Trova TUTTI i pattern ðŸ + qualsiasi carattere
const allCorruptedPatterns = content.match(/ðŸ./g) || [];
const uniquePatterns = [...new Set(allCorruptedPatterns)];

console.log(`Trovati ${uniquePatterns.length} pattern corrotti unici:`);
uniquePatterns.forEach(p => console.log(`  ${JSON.stringify(p)}`));

// Mapping manuale dei pattern più comuni ai loro emoji corretti
const emojiMap = {
  [`ðŸ'`]: '💍',   // Ring
  [`ðŸ'€`]: '👀',   // Eyes
  [`ðŸ'¡`]: '💡',   // Bulb
  [`ðŸ'°`]: '💰',   // Money bag
  [`ðŸ'µ`]: '💵',   // Dollar
  [`ðŸ¦`]: '🏦',   // Bank
  [`ðŸ''`]: '💑',   // Couple
  [`ðŸ'•`]: '💕',   // Hearts
  [`ðŸ `]: '🏠',   // House
  [`ðŸŒŸ`]: '🌟',   // Star
  [`ðŸ'ª`]: '💪',   // Muscle
  [`ðŸ"`]: '�',   // Clipboard
  [`ðŸ¢`]: '🏢',   // Building
  [`ðŸ"–`]: '📖',   // Book
  [`ðŸ"`]: '�',   // Memo
  [`ðŸ"Š`]: '📊',   // Chart
  [`ðŸ'¥`]: '👥',   // People
  [`ðŸ'¾`]: '💾',   // Disk
  [`ðŸ"'`]: '🔒',   // Lock
  [`ðŸ"¢`]: '📢',   // Loudspeaker
  [`ðŸ"‹`]: '📋',   // Clipboard
  [`ðŸ"˜`]: '�',   // Blue book
  [`ðŸ¤µ`]: '🤵',   // Tuxedo
  [`ðŸ"¸`]: '📸',   // Camera
  [`ðŸ"²`]: '📲',   // Phone
  [`ðŸŒ`]: '🌐',   // Globe
  [`ðŸ"ž`]: '�',   // Telephone
};

let totalCount = 0;

console.log('\nSostituzioni:');
for (const [corrupted, correct] of Object.entries(emojiMap)) {
  const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const count = (content.match(regex) || []).length;

  if (count > 0) {
    content = content.replace(regex, correct);
    console.log(`✓ ${JSON.stringify(corrupted)} → ${correct} (${count}x)`);
    totalCount += count;
  }
}

// Scrivi il file
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ Completato! ${totalCount} sostituzioni totali.`);

// Controlla se ci sono ancora pattern corrotti
const remaining = content.match(/ðŸ./g) || [];
if (remaining.length > 0) {
  console.log(`\n⚠️  Attenzione: ${remaining.length} pattern corrotti ancora presenti:`);
  const uniqueRemaining = [...new Set(remaining)];
  uniqueRemaining.forEach(p => console.log(`  ${JSON.stringify(p)}`));
}
