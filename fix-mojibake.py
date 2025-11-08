import json
import codecs

# Leggi file con encoding UTF-8
with codecs.open('./src/messages/it.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Sostituzioni mojibake
replacements = {
    'â€"': '—',  # em-dash
    'â€¦': '…',  # ellipsis
    '→nz': '→ Funz',  # arrow + text
    'â€œ': '"',  # left quote
    'â€': '"',   # right quote
}

count = 0
for old, new in replacements.items():
    occurrences = content.count(old)
    if occurrences > 0:
        content = content.replace(old, new)
        print(f'✓ {old} → {new} ({occurrences}x)')
        count += occurrences

if count > 0:
    # Backup
    with codecs.open('./src/messages/it.json.backup-py', 'w', encoding='utf-8') as f:
        f.write(content)

    # Verifica JSON valido
    try:
        json.loads(content)
        # Scrivi file
        with codecs.open('./src/messages/it.json', 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'\n✅ {count} sostituzioni totali!')
    except json.JSONDecodeError as e:
        print(f'\n❌ Errore JSON: {e}')
else:
    print('Nessuna sostituzione necessaria')
