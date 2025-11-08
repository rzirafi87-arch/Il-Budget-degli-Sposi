# Config Data Encoding Guidelines

Tutti i file JSON in questa cartella (`languages.json`, `events.json`, `countries.json`, ecc.) devono essere salvati in **UTF-8 senza BOM**.

## Perché
Emoji (bandiere, simboli religiosi, caratteri non latini) vanno persi se il file viene salvato come Windows-1252 / ISO-8859-1 causando mojibake (�, caratteri di controllo, sostituzioni). Questi byte corrotti impediscono il rendering corretto nelle componenti React e possono far fallire la logica di selezione.

## Regole
- Editor: assicurati che VS Code mostri `UTF-8` nella barra di stato.
- Non convertire manualmente in ANSI.
- Le bandiere devono essere coppie di Regional Indicator (es. 🇮🇹, 🇬🇧) e non immagini inline.
- Evita doppie codifiche (copia/incolla da Word / Excel può introdurre BOM nascosto).

## Verifica Rapida
1. Apri il file.
2. Cerca il carattere `�` (Replacement Character). Se presente, il file è sospetto.
3. Usa comando: "Reopen with Encoding" → `UTF-8` se necessario.

## Se devi aggiungere nuove lingue/eventi
Mantieni struttura coerente:
```jsonc
// languages.json entry
{
  "slug": "xx",       // codice interno breve
  "label": "Nome",    // nome visualizzato
  "locale": "xx-XX",  // locale BCP-47
  "dir": "ltr|rtl",   // direzione testo
  "emoji": "🇽🇽",     // bandiera o simbolo
  "available": false   // true quando completamente tradotta
}
```
```jsonc
// events.json entry
{
  "slug": "evento-unico",
  "label": "Nome evento visibile",
  "emoji": "🎉",
  "group": "personale|famiglia|professionale",
  "available": true
}
```

## Strumenti Consigliati
- Estensione VS Code: "EditorConfig" per enforce dell'encoding.
- Script di controllo (TODO): uno script Node che legge i file e valida che nessun carattere abbia code point `0xFFFD`.

## Recupero da Mojibake
Se un file è stato corrotto:
1. Recupera la versione precedente da Git (`git show <commit>:path/to/file.json`).
2. Se non esiste, ricopia il contenuto da una fonte originale (documento master, export).
3. Reincolla in VS Code configurato su UTF-8.
4. Salva e committa.

## Nota
Questo README serve come promemoria per evitare regressioni future.
