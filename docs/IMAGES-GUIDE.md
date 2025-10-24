# 🎨 Immagini Consigliate per SEO

## Open Graph Image (og-image.jpg)

Per apparire bene quando il sito viene condiviso su social media.

**Specifiche Tecniche:**
- Dimensioni: **1200x630 px** (proporzione 1.91:1)
- Formato: JPG o PNG
- Peso: < 300 KB
- Posizionamento: `public/og-image.jpg`

**Contenuto Consigliato:**
```
+------------------------------------------+
|                                          |
|    💍 Il Budget degli Sposi              |
|                                          |
|    Organizza il Tuo Matrimonio           |
|    Gratis e Senza Stress                 |
|                                          |
|    ✓ Gestione Budget                     |
|    ✓ 300+ Fornitori                      |
|    ✓ Location in tutta Italia            |
|                                          |
|    [Immagine sfondo: coppia o anelli]    |
|                                          |
+------------------------------------------+
```

**Strumenti Gratuiti per Crearla:**
- Canva.com (template "Facebook Post" 1200x630)
- Figma.com
- Photopea.com (Photoshop online gratuito)

**Template Canva Consigliato:**
1. Cerca "Open Graph Template Wedding"
2. Usa palette colori del brand: #A3B59D (verde salvia)
3. Font: Playfair Display per titolo, Inter per testo

---

## Favicon e App Icons

**Favicon.ico:**
- Dimensioni: 32x32 px e 16x16 px
- File: `public/favicon.ico`
- Icona semplice: 💍 o iniziali "BS"

**Apple Touch Icon:**
- Dimensioni: 180x180 px
- File: `public/apple-touch-icon.png`
- Usata quando aggiungi sito a Home Screen iOS

**Android Chrome:**
- Dimensioni: 192x192 px e 512x512 px
- File: `public/icon-192.png`, `public/icon-512.png`

---

## Immagini Placeholder per Fornitori

Quando i fornitori non hanno foto:

**Location Placeholder:**
- `public/placeholder-location.jpg` (400x300 px)
- Immagine generica di venue matrimonio

**Chiesa Placeholder:**
- `public/placeholder-church.jpg` (400x300 px)
- Immagine generica di chiesa

**Fornitore Generico:**
- `public/placeholder-vendor.jpg` (400x300 px)
- Logo o icona servizio matrimonio

---

## Risorse Immagini Gratuite

**Siti con immagini royalty-free:**
- Unsplash.com (già configurato in next.config.ts)
- Pexels.com
- Pixabay.com

**Cerca:**
- "wedding venue italy"
- "italian wedding"
- "wedding rings"
- "bride and groom"
- "wedding planning"

---

## Current Status

**Già Configurato:**
- ✅ Unsplash come remote pattern in next.config.ts
- ✅ Next.js Image optimization automatica
- ✅ Lazy loading immagini

**Da Aggiungere:**
- [ ] og-image.jpg (1200x630)
- [ ] favicon.ico
- [ ] apple-touch-icon.png
- [ ] icon-192.png
- [ ] icon-512.png
- [ ] Placeholder images

---

## Quick Start - Favicon Generator

Usa **RealFaviconGenerator.net**:
1. Carica logo/icona 260x260 px
2. Genera tutti i formati
3. Scarica pacchetto
4. Copia file in `public/`
5. Copia tag HTML nel `<head>`

Fatto! ✨
