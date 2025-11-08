import fs from 'fs';

const filePath = './src/messages/it.json';

console.log('🔧 Fix manuale mojibake con JSON parse/stringify\n');

// Leggi e parse JSON
const content = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(content);

// Funzione ricorsiva per trovare e sostituire
function fixMojibake(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Sostituisci mojibake
      const original = obj[key];
      obj[key] = obj[key]
        .replace(/â€"/g, '—')                    // em-dash mojibake
        .replace(/→funzion/gi, '→ Funzion')       // arrow + testo
        .replace(/Responsabi→/g, 'Responsabile ') // fix "Responsabile"
        .replace(/💍•/g, '💍')                    // fix emoji
        .replace(/›‹/g, '')                       // rimuovi caratteri strani
        .replace(/👀‹/g, '👀');                   // fix emoji occhi

      if (original !== obj[key]) {
        console.log(`✓ Fixed: "${original.substring(0, 50)}..."`);
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      fixMojibake(obj[key]);
    }
  }
}

// Applica fix
fixMojibake(data);

// Backup
fs.writeFileSync(filePath + '.before-fix', content, 'utf8');

// Scrivi JSON formattato
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log('\n✅ File normalizzato! Backup: it.json.before-fix');
