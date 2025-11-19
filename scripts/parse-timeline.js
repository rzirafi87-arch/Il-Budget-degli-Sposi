const fs = require('fs');
const text = fs.readFileSync('supabase-timeline-wedding-restore.sql', 'utf-8');
const lines = text.split(/\r?\n/);
const entries = {};
let currentKey = null;
for (const line of lines) {
  const keyMatch = line.match(/AND ety\.code = 'WEDDING' AND et\.key = '([^']+)'/);
  if (keyMatch) {
    currentKey = keyMatch[1];
    continue;
  }
  if (!currentKey) continue;
  let itMatch = line.match(/VALUES \(v_timeline_id, 'it-IT', '([^']+)', '([^']+)'\);/);
  if (itMatch) {
    entries[currentKey] = entries[currentKey] || { key: currentKey };
    entries[currentKey].title_it = itMatch[1];
    entries[currentKey].desc_it = itMatch[2];
    currentKey = null;
    continue;
  }
  let enMatch = line.match(/VALUES \(v_timeline_id, 'en-GB', '([^']+)', '([^']+)'\);/);
  if (enMatch) {
    entries[currentKey] = entries[currentKey] || { key: currentKey };
    entries[currentKey].title_en = enMatch[1];
    entries[currentKey].desc_en = enMatch[2];
    currentKey = null;
    continue;
  }
}
console.log(JSON.stringify(Object.values(entries), null, 2));
