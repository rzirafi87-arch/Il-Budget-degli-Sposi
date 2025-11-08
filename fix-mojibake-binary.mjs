import fs from 'fs';

const filePath = './src/messages/it.json';

console.log('🔧 Fix mojibake binario\n');

// Leggi buffer
let buffer = fs.readFileSync(filePath);

// Backup
fs.writeFileSync(filePath + '.hex-bak', buffer);

// Sostituzioni byte-level
const replacements = [
  {
    // â€" (em-dash corrotto: c3a2 e282ac e2809d) → — (em-dash corretto: e28094)
    from: Buffer.from([0xC3, 0xA2, 0xE2, 0x82, 0xAC, 0xE2, 0x80, 0x9D]),
    to: Buffer.from([0xE2, 0x80, 0x94]),
    name: 'em-dash'
  },
];

let total = 0;

for (const { from, to, name } of replacements) {
  let count = 0;
  let pos = 0;

  while ((pos = buffer.indexOf(from, pos)) !== -1) {
    // Crea nuovo buffer con sostituzione
    buffer = Buffer.concat([
      buffer.slice(0, pos),
      to,
      buffer.slice(pos + from.length)
    ]);

    count++;
    pos += to.length;
  }

  if (count > 0) {
    console.log(`✓ ${name}: ${count}x`);
    total += count;
  }
}

if (total > 0) {
  // Verifica JSON valido
  try {
    JSON.parse(buffer.toString('utf8'));
    fs.writeFileSync(filePath, buffer);
    console.log(`\n✅ ${total} sostituzioni! File normalizzato.`);
  } catch (e) {
    console.error('❌ Errore JSON:', e.message);
  }
} else {
  console.log('✅ Nessun mojibake trovato');
}
