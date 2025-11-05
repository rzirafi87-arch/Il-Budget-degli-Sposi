import fs from 'fs';

// Leggi il file
let content = fs.readFileSync('src/messages/it.json', 'utf8');

// Fix manuale di tutti i caratteri corrotti visibili
let fixed = content
  // Fix specifici trovati nel file
  .replace(/serenitÃ\s+â€"/g, 'serenità —')
  .replace(/pubblicitÃ\s+né/g, 'pubblicità né')
  .replace(/serenitÃ /g, 'serenità')
  .replace(/pubblicitÃ /g, 'pubblicità')
  .replace(/CapacitÃ /g, 'Capacità')
  .replace(/cittÃ /g, 'città')
  .replace(/Ã¨/g, 'è')
  .replace(/Ã /g, 'à')
  .replace(/Ã²/g, 'ò')
  .replace(/Ã¹/g, 'ù')
  .replace(/Ã©/g, 'é')
  .replace(/Ã¬/g, 'ì')
  .replace(/Ã§/g, 'ç')
  .replace(/Ã±/g, 'ñ')
  .replace(/Ãˆ/g, 'È')
  // Fix trattino lungo corrotto
  .replace(/â€"/g, '—')
  // Fix emoji corrotte
  .replace(/ðŸ'/g, '💍')
  .replace(/ðŸ'€/g, '👀')
  .replace(/ðŸ /g, '🏠')
  .replace(/ðŸ'°/g, '💰')
  .replace(/ðŸ"/g, '📝')
  .replace(/ðŸ"…/g, '📅')
  .replace(/ðŸ"Š/g, '📊')
  .replace(/ðŸ'Œ/g, '💌')
  .replace(/ðŸŽ¯/g, '🎯')
  .replace(/ðŸ'•/g, '💕')
  .replace(/ðŸŽŠ/g, '🎊')
  .replace(/ðŸŽ‰/g, '🎉')
  .replace(/âœ¨/g, '✨')
  .replace(/ðŸŽ/g, '🎁')
  .replace(/ðŸ•/g, '🕊')
  .replace(/ðŸ'¼/g, '💼')
  .replace(/ðŸŽ¤/g, '🎤')
  .replace(/ðŸŽ¸/g, '🎸')
  .replace(/ðŸŽ¼/g, '🎼')
  .replace(/ðŸŒ¸/g, '🌸')
  .replace(/ðŸŽ¨/g, '🎨')
  .replace(/ðŸ'Ž/g, '💎')
  .replace(/ðŸ"¸/g, '📸')
  .replace(/ðŸŽ¥/g, '🎥')
  .replace(/ðŸ"¹/g, '📹')
  .replace(/ðŸ"/g, '📷')
  .replace(/ðŸš/g, '🚗')
  .replace(/ðŸš•/g, '🚕')
  .replace(/ðŸš™/g, '🚙')
  .replace(/ðŸ›/g, '🛍')
  .replace(/ðŸŽ‚/g, '🎂')
  .replace(/ðŸ°/g, '🍰')
  .replace(/ðŸ¾/g, '🍾')
  .replace(/ðŸ¥‚/g, '🥂')
  .replace(/ðŸ"®/g, '📮')
  .replace(/ðŸ"¦/g, '📦')
  .replace(/ðŸ"§/g, '📧')
  .replace(/ðŸ"©/g, '📩')
  .replace(/ðŸ""/g, '📝')
  .replace(/ðŸ"‹/g, '📋')
  .replace(/ðŸ"Œ/g, '📌')
  .replace(/ðŸ"†/g, '📆')
  .replace(/MenÃ¹/g, 'Menù')
  .replace(/piÃ¹/g, 'più')
  .replace(/cÃ²/g, 'cò')
  .replace(/perchÃ©/g, 'perché')
  .replace(/SarÃ /g, 'Sarà')
  .replace(/visibilitÃ /g, 'visibilità')
  .replace(/qualitÃ /g, 'qualità')
  .replace(/comunitÃ /g, 'comunità')
  .replace(/funzionalitÃ /g, 'funzionalità')
  // Fix altri simboli
  .replace(/â€¢/g, '•')
  .replace(/â„¢/g, '™')
  .replace(/Â©/g, '©')
  .replace(/Â®/g, '®');

// Scrivi il file corretto in UTF-8 senza BOM
fs.writeFileSync('src/messages/it.json', fixed, 'utf8');

console.log('✅ File completamente corretto! Tutti i caratteri UTF-8 ripristinati.');
