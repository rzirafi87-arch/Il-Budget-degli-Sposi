import fs from 'fs';

const filePath = './src/messages/it.json';
let content = fs.readFileSync(filePath, 'utf8');

// Use character codes to avoid editor corruption
// Pattern: find the corrupted bytes and replace with correct Unicode

// Check mark: U+2713
content = content.replace(/"\u00E2\u0153\u0094/g, '"\u2713');

// X mark: U+2717  
content = content.replace(/"\u00E2\u0153\u0097/g, '"\u2717');

// Cross mark (X in circle): U+274C
content = content.replace(/"\u00E2\u008C/g, '"\u274C');

// Check box: U+2705
content = content.replace(/"\u00E2\u0153\u0085/g, '"\u2705');

// Right arrow: U+2192
content = content.replace(/\u00E2\u0086\u0092/g, '\u2192');

// Em dash: U+2014
content = content.replace(/\u00E2\u0080\u0094/g, '\u2014');

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Simboli corretti con Unicode escapes!');

// Verifica
const issues = [
  ['ðŸ', 'emoji corrotti'],
  ['Ã', 'accenti corrotti'],
  ['âœ', 'check corrotti'],
  ['âŒ', 'cross corrotti'],
];

console.log('\nVerifica:');
issues.forEach(([pattern, desc]) => {
  const count = (content.match(new RegExp(pattern, 'g')) || []).length;
  console.log(`  ${desc}: ${count}`);
});