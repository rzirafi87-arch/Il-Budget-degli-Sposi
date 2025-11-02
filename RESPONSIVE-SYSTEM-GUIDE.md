# 📱 Sistema Responsive Multi-Dispositivo

Sistema completo di visualizzazione ottimizzata per **PC**, **Tablet**, **Android** e **iOS** implementato per "Il Budget degli Sposi".

## 🎯 Caratteristiche Principali

### ✅ Dispositivi Supportati
- **Desktop**: Windows, macOS, Linux (1024px+)
- **Tablet**: iPad, Android tablets (768px - 1023px)
- **Mobile**: iPhone, Android phones (<768px)

### ✅ Ottimizzazioni Specifiche

#### iOS
- ✓ Safe areas per notch (iPhone X+)
- ✓ Home indicator padding (iPhone 13+)
- ✓ Tap highlight disabilitato
- ✓ Smooth scrolling nativo
- ✓ Touch target minimo 44px (Apple HIG)
- ✓ Backdrop blur per header

#### Android
- ✓ Ripple effect su pulsanti (Material Design 3)
- ✓ Elevazioni shadow ottimizzate
- ✓ Touch target minimo 48px (Material Guidelines)
- ✓ Font rendering ottimizzato
- ✓ Splash color support

#### Desktop
- ✓ Hover states (solo mouse, non touch)
- ✓ Keyboard navigation
- ✓ Layout multi-colonna
- ✓ Padding generoso

---

## 🛠️ Componenti Disponibili

### 1. **useDeviceDetection** Hook

Hook per rilevare tipo dispositivo, OS e viewport.

```tsx
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

function MyComponent() {
  const { deviceType, os, viewportSize, isTouchDevice, isPortrait } = useDeviceDetection();
  
  return (
    <div>
      <p>Dispositivo: {deviceType}</p> {/* mobile | tablet | desktop */}
      <p>OS: {os}</p> {/* ios | android | windows | macos | linux */}
      <p>Viewport: {viewportSize}</p> {/* xs | sm | md | lg | xl | 2xl */}
      <p>Touch: {isTouchDevice ? "Sì" : "No"}</p>
      <p>Orientamento: {isPortrait ? "Portrait" : "Landscape"}</p>
    </div>
  );
}
```

**Hook semplificati:**
```tsx
import { useIsMobile, useIsTablet, useIsDesktop, useIsIOS, useIsAndroid } from "@/hooks/useDeviceDetection";

const isMobile = useIsMobile(); // boolean
const isIOS = useIsIOS(); // boolean
```

---

### 2. **ResponsiveContainer**

Container con padding e margini adattivi.

```tsx
import ResponsiveContainer from "@/components/ResponsiveContainer";

<ResponsiveContainer 
  maxWidth="xl"          // sm | md | lg | xl | 2xl | full
  centered={true}        // Centra orizzontalmente
  noPadding={false}      // Rimuovi padding
  fullWidthMobile={false} // Full width su mobile
  safeBoundaries={true}  // Safe area iOS
>
  {children}
</ResponsiveContainer>
```

**Padding automatico:**
- Mobile: `px-4 py-3`
- Tablet: `px-6 py-4`
- Desktop: `px-8 py-6`

---

### 3. **ResponsiveGrid**

Griglia adattiva con colonne responsive.

```tsx
import { ResponsiveGrid } from "@/components/ResponsiveContainer";

<ResponsiveGrid
  mobileCols={1}    // Colonne mobile (1 o 2)
  tabletCols={2}    // Colonne tablet (2, 3, 4)
  desktopCols={3}   // Colonne desktop (2, 3, 4, 5, 6)
  gap="md"          // Spaziatura (sm | md | lg)
>
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</ResponsiveGrid>
```

**Esempi pratici:**
```tsx
// 1 colonna mobile, 2 tablet, 3 desktop
<ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={3}>

// 2 colonne sempre su mobile (immagini piccole)
<ResponsiveGrid mobileCols={2} tabletCols={3} desktopCols={4}>

// 4 colonne desktop per dashboard
<ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={4}>
```

---

### 4. **ResponsiveStack**

Layout verticale/orizzontale adattivo.

```tsx
import { ResponsiveStack } from "@/components/ResponsiveContainer";

<ResponsiveStack
  mobileDirection="vertical"    // vertical | horizontal
  desktopDirection="horizontal" // vertical | horizontal
  spacing="md"                  // sm | md | lg | xl
  align="center"                // start | center | end | stretch
>
  <button>Salva</button>
  <button>Annulla</button>
</ResponsiveStack>
```

**Caso d'uso:** Pulsanti che devono essere verticali su mobile (facilità tap) e orizzontali su desktop.

---

### 5. **ResponsiveCard**

Card con interazioni touch ottimizzate.

```tsx
import ResponsiveCard, { CardSection } from "@/components/ResponsiveCard";

// Card base
<ResponsiveCard
  variant="default"      // default | sage | rose | beige
  padding="md"           // sm | md | lg
  hoverable={true}       // Hover effect (solo desktop)
  onClick={() => {}}     // Click handler
  href="/path"           // Link (alternativa a onClick)
  bordered={true}        // Mostra bordo
  elevation="md"         // none | sm | md | lg
>
  Contenuto card
</ResponsiveCard>

// Card con sezioni predefinite
<CardSection
  title="Titolo Card"
  subtitle="Sottotitolo"
  icon="💰"
  action={<button>Azione</button>}
  footer={<div>Footer</div>}
  hoverable
  onClick={() => {}}
>
  Contenuto principale
</CardSection>
```

**Features automatiche:**
- Tap highlight disabilitato (iOS)
- Ripple effect (Android)
- Scale feedback su tap (mobile)
- Hover shadow (desktop)
- Focus ring (keyboard)

---

### 6. **BottomNav**

Navigazione bottom bar (stile iOS/Android).

```tsx
import BottomNav, { BottomNavSpacer } from "@/components/BottomNav";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/budget", label: "Budget", icon: "💰" },
  { href: "/invitati", label: "Invitati", icon: "👥", badge: 5 },
  { href: "/fornitori", label: "Fornitori", icon: "🏢" },
];

<BottomNav items={navItems} showOnDesktop={false} />

// Aggiungi spacer per evitare contenuto nascosto
<BottomNavSpacer />
```

**Auto-styling:**
- iOS: icone grandi, arrotondato, backdrop blur
- Android: elevazione shadow, Material Design
- Badge notifiche automatico

---

### 7. **ResponsiveLayout**

Layout principale con header, footer, nav.

```tsx
import ResponsiveLayout from "@/components/ResponsiveLayout";

<ResponsiveLayout
  showBottomNav={true}
  navItems={navItems}
  header={<MyHeader />}
  hideHeaderOnScroll={true}  // Nascondi header scrollando (mobile)
>
  {children}
</ResponsiveLayout>
```

---

## 🎨 CSS Utilities

### Safe Areas (iOS)

```tsx
// Singole aree
className="pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right"

// Tutte le aree
className="p-safe-all"

// Custom style
style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
```

### Classi Responsive

```css
/* Touch targets minimi */
button, a {
  min-height: 44px; /* iOS */
  min-height: 48px; /* Android */
}

/* Grids adattive */
.tablet-grid-2 /* 2 colonne su tablet */

/* Stack mobile */
.mobile-stack { flex-direction: column; }
.mobile-full-width { width: 100%; }
```

---

## 📐 Breakpoints

Basati su Tailwind CSS 4:

| Breakpoint | Min Width | Dispositivo Tipico |
|------------|-----------|-------------------|
| `xs`       | 0px       | Mobile portrait   |
| `sm`       | 640px     | Mobile landscape  |
| `md`       | 768px     | Tablet portrait   |
| `lg`       | 1024px    | Desktop, tablet landscape |
| `xl`       | 1280px    | Desktop largo     |
| `2xl`      | 1536px    | Desktop ultra-wide |

**Media queries custom:**
```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Portrait mobile */
@media (orientation: portrait) and (max-width: 640px) { }

/* Landscape mobile */
@media (orientation: landscape) and (max-height: 500px) { }
```

---

## 🚀 Esempi Pratici

### Esempio 1: Dashboard Responsive

```tsx
import ResponsiveLayout from "@/components/ResponsiveLayout";
import ResponsiveContainer, { ResponsiveGrid } from "@/components/ResponsiveContainer";
import { CardSection } from "@/components/ResponsiveCard";

export default function DashboardPage() {
  return (
    <ResponsiveLayout showBottomNav navItems={navItems}>
      <ResponsiveContainer maxWidth="2xl" centered>
        <h1 className="text-3xl font-serif font-bold mb-6">Dashboard</h1>
        
        <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={3}>
          <CardSection
            title="Budget Totale"
            icon="💰"
            footer={<button className="btn-primary w-full">Dettagli</button>}
          >
            <p className="text-4xl font-bold text-[#8da182]">€ 31.000</p>
          </CardSection>
          
          {/* Altre card... */}
        </ResponsiveGrid>
      </ResponsiveContainer>
    </ResponsiveLayout>
  );
}
```

### Esempio 2: Form Mobile-Friendly

```tsx
import { ResponsiveStack } from "@/components/ResponsiveContainer";
import ResponsiveCard from "@/components/ResponsiveCard";

<ResponsiveCard padding="lg">
  <form>
    <div className="space-y-4">
      <input 
        type="text" 
        className="w-full min-h-[48px] px-4 rounded-lg border"
        placeholder="Nome fornitor" 
      />
      
      <ResponsiveStack 
        mobileDirection="vertical" 
        desktopDirection="horizontal"
      >
        <button type="submit" className="btn-primary flex-1">
          Salva
        </button>
        <button type="button" className="btn-secondary flex-1">
          Annulla
        </button>
      </ResponsiveStack>
    </div>
  </form>
</ResponsiveCard>
```

### Esempio 3: Lista con Card Interattive

```tsx
import ResponsiveCard from "@/components/ResponsiveCard";

const items = [...]; // Array di fornitori

<div className="space-y-3">
  {items.map(item => (
    <ResponsiveCard
      key={item.id}
      hoverable
      onClick={() => handleSelect(item)}
      elevation="md"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold">{item.name}</h3>
          <p className="text-sm text-gray-600">{item.location}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-[#8da182]">{item.price}</p>
        </div>
      </div>
    </ResponsiveCard>
  ))}
</div>
```

---

## ✅ Checklist Implementazione

Quando crei una nuova pagina/componente:

- [ ] Usa `ResponsiveContainer` per margini/padding automatici
- [ ] Usa `ResponsiveGrid` per layout multi-colonna
- [ ] Usa `ResponsiveStack` per pulsanti (vertical mobile, horizontal desktop)
- [ ] Usa `ResponsiveCard` per contenuti cliccabili
- [ ] Touch targets minimo 44-48px (pulsanti, link)
- [ ] Font size minimo 15px su mobile
- [ ] Testa su portrait e landscape
- [ ] Verifica safe areas su iOS (notch)
- [ ] Aggiungi `BottomNav` se applicabile
- [ ] Testa hover states (solo desktop)
- [ ] Verifica tap feedback (mobile)

---

## 🧪 Testing

### Desktop
```bash
# Chrome DevTools
1. F12 → Toggle device toolbar
2. Seleziona "Responsive"
3. Testa 1920×1080, 1366×768, 1280×720
```

### iPad
```bash
# Safari Responsive Design Mode
1. Develop → Enter Responsive Design Mode
2. iPad Pro 12.9" (1024×1366)
3. iPad Air (820×1180)
```

### iPhone
```bash
# Safari iOS Simulator (Xcode required)
1. iPhone 14 Pro (393×852 - notch)
2. iPhone SE (375×667)
3. Testa portrait e landscape
```

### Android
```bash
# Chrome DevTools
1. Galaxy S20 (360×800)
2. Pixel 7 (412×915)
3. OnePlus 9 (360×780)
```

---

## 📚 Risorse

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design 3 (Android)](https://m3.material.io/)
- [Tailwind CSS Breakpoints](https://tailwindcss.com/docs/responsive-design)
- [Safe Area Insets (iOS)](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

---

## 🎯 Pagina Demo

Visita `/responsive-showcase` per vedere tutti i componenti in azione con informazioni real-time sul dispositivo corrente.
