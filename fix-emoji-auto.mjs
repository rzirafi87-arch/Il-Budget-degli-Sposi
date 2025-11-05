import fs from 'fs';

const filePath = './src/messages/it.json';

// Leggi il file
let content = fs.readFileSync(filePath, 'utf8');

// Trova TUTTI i pattern ðŸ + qualsiasi carattere (2 caratteri perché gli emoji corrotti sono sempre 2 caratteri)
const allCorruptedPatterns = content.match(/ðŸ[\s\S]/g) || [];
const uniquePatterns = [...new Set(allCorruptedPatterns)];

console.log(`Trovati ${uniquePatterns.length} pattern corrotti unici`);

// Costruisci il mapping usando Unicode code points
// Lista dei 50 emoji più usati nel wedding planning
const emojiCodepoints = [
  0x1F48D, // 💍 Ring
  0x1F440, // 👀 Eyes
  0x1F4A1, // 💡 Bulb
  0x1F4B0, // 💰 Money bag
  0x1F4B5, // 💵 Dollar
  0x1F3E6, // 🏦 Bank
  0x1F491, // 💑 Couple
  0x1F495, // 💕 Hearts
  0x1F3E0, // 🏠 House
  0x1F31F, // 🌟 Star
  0x1F4AA, // 💪 Muscle
  0x1F4CB, // 📋 Clipboard
  0x1F3E2, // 🏢 Building
  0x1F4D6, // 📖 Book
  0x1F4DD, // 📝 Memo
  0x1F4CA, // 📊 Chart
  0x1F465, // 👥 People
  0x1F4BE, // 💾 Disk
  0x1F512, // 🔒 Lock
  0x1F4E2, // 📢 Loudspeaker
  0x1F4D8, // 📘 Blue book
  0x1F935, // 🤵 Tuxedo
  0x1F4F8, // 📸 Camera
  0x1F4F2, // 📲 Phone
  0x1F310, // 🌐 Globe
  0x1F4DE, // 📞 Telephone
  0x1F389, // 🎉 Party
  0x2728,  // ✨ Sparkles
  0x2022,  // • Bullet
];

// Genera gli emoji corretti
const correctEmojis = emojiCodepoints.map(cp => String.fromCodePoint(cp));

// Match i pattern corrotti con gli emoji corretti (per ordine di apparizione)
const replacementMap = {};
uniquePatterns.forEach((corrupted, index) => {
  if (index < correctEmojis.length) {
    replacementMap[corrupted] = correctEmojis[index];
  }
});

console.log('\nMapping generato:');
Object.entries(replacementMap).forEach(([c, e]) => {
  console.log(`  ${JSON.stringify(c)} → ${e}`);
});

// Applica sostituzioni
let totalCount = 0;
for (const [corrupted, correct] of Object.entries(replacementMap)) {
  const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const count = (content.match(regex) || []).length;
  
  if (count > 0) {
    content = content.replace(regex, correct);
    totalCount += count;
  }
}

// Scrivi file
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ Completato! ${totalCount} sostituzioni totali.`);

// Check remaining
const remaining = content.match(/ðŸ[\s\S]/g) || [];
if (remaining.length > 0) {
  console.log(`\n⚠️  ${remaining.length} pattern ancora presenti`);
}