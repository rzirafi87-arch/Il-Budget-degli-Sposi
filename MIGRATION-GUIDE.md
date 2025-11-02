# 🔄 Guida Migrazione Componenti Esistenti al Sistema Responsive

Questa guida mostra come convertire componenti esistenti per usare il nuovo sistema responsive.

---

## 📋 Pattern Comuni di Migrazione

### 1. **Grid/Lista Statica → ResponsiveGrid**

#### ❌ PRIMA (Non responsive)
```tsx
<div className="grid grid-cols-3 gap-4">
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
</div>
```

#### ✅ DOPO (Responsive)
```tsx
import { ResponsiveGrid } from "@/components/ResponsiveContainer";

<ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={3} gap="md">
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
</ResponsiveGrid>
```

**Risultato:**
- Mobile: 1 colonna (facile scroll verticale)
- Tablet: 2 colonne (sfrutta spazio)
- Desktop: 3 colonne (vista completa)

---

### 2. **Pulsanti Inline → ResponsiveStack**

#### ❌ PRIMA
```tsx
<div className="flex gap-4">
  <button className="btn-primary">Salva</button>
  <button className="btn-secondary">Annulla</button>
</div>
```

#### ✅ DOPO
```tsx
import { ResponsiveStack } from "@/components/ResponsiveContainer";

<ResponsiveStack 
  mobileDirection="vertical" 
  desktopDirection="horizontal" 
  spacing="md"
>
  <button className="btn-primary flex-1">Salva</button>
  <button className="btn-secondary flex-1">Annulla</button>
</ResponsiveStack>
```

**Risultato:**
- Mobile: pulsanti verticali full-width (facile tap)
- Desktop: pulsanti orizzontali side-by-side

---

### 3. **Card Semplici → ResponsiveCard**

#### ❌ PRIMA
```tsx
<div className="bg-white p-6 rounded-lg shadow-md" onClick={handleClick}>
  <h3>Titolo</h3>
  <p>Contenuto</p>
</div>
```

#### ✅ DOPO
```tsx
import ResponsiveCard from "@/components/ResponsiveCard";

<ResponsiveCard 
  hoverable 
  onClick={handleClick} 
  elevation="md"
  padding="md"
>
  <h3>Titolo</h3>
  <p>Contenuto</p>
</ResponsiveCard>
```

**Guadagni:**
- ✅ Padding adattivo (4px mobile, 6px desktop)
- ✅ Hover solo desktop (no su touch)
- ✅ Tap feedback su mobile (scale animation)
- ✅ Tap highlight disabilitato (iOS)
- ✅ Ripple effect (Android)
- ✅ Focus ring per keyboard nav

---

### 4. **Container con Padding Fisso → ResponsiveContainer**

#### ❌ PRIMA
```tsx
<div className="max-w-6xl mx-auto px-6 py-4">
  {children}
</div>
```

#### ✅ DOPO
```tsx
import ResponsiveContainer from "@/components/ResponsiveContainer";

<ResponsiveContainer maxWidth="xl" centered>
  {children}
</ResponsiveContainer>
```

**Padding automatico:**
- Mobile: 16px (touch-friendly)
- Tablet: 24px
- Desktop: 32px

---

### 5. **Navigazione Top → Bottom Nav (Mobile)**

#### ❌ PRIMA
```tsx
// Sempre in alto, difficile da raggiungere su mobile
<nav className="flex gap-2">
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/budget">Budget</Link>
</nav>
```

#### ✅ DOPO
```tsx
import BottomNav from "@/components/BottomNav";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/budget", label: "Budget", icon: "💰" },
  { href: "/invitati", label: "Invitati", icon: "👥", badge: 5 },
];

<BottomNav items={navItems} />
```

**Risultato:**
- Mobile: bottom nav (facile da raggiungere con pollice)
- Desktop: nascosto (usa top nav)

---

## 🎯 Esempi Pratici per Pagine Esistenti

### Dashboard (`src/app/dashboard/page.tsx`)

```tsx
import ResponsiveContainer, { ResponsiveGrid } from "@/components/ResponsiveContainer";
import { CardSection } from "@/components/ResponsiveCard";

export default function DashboardPage() {
  return (
    <ResponsiveContainer maxWidth="2xl" centered>
      {/* Statistiche Budget */}
      <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={3} gap="md">
        <CardSection
          title="Sposa"
          icon="👰"
          variant="rose"
          footer={<p className="text-sm text-gray-600">65% utilizzato</p>}
        >
          <p className="text-3xl font-bold text-[#8da182]">€ 8.500</p>
        </CardSection>

        <CardSection
          title="Sposo"
          icon="🤵"
          variant="beige"
          footer={<p className="text-sm text-gray-600">58% utilizzato</p>}
        >
          <p className="text-3xl font-bold text-[#8da182]">€ 7.200</p>
        </CardSection>

        <CardSection
          title="Comune"
          icon="💑"
          variant="sage"
          footer={<p className="text-sm text-gray-600">72% utilizzato</p>}
        >
          <p className="text-3xl font-bold text-[#8da182]">€ 15.300</p>
        </CardSection>
      </ResponsiveGrid>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-2xl font-serif font-bold mb-4">Azioni Rapide</h2>
        <ResponsiveStack mobileDirection="vertical" desktopDirection="horizontal" spacing="md">
          <button className="btn-primary flex-1">Aggiungi Spesa</button>
          <button className="btn-secondary flex-1">Aggiungi Invitato</button>
          <button className="btn-secondary flex-1">Cerca Fornitore</button>
        </ResponsiveStack>
      </div>
    </ResponsiveContainer>
  );
}
```

---

### Fornitori (`src/app/fornitori/page.tsx`)

```tsx
import ResponsiveContainer from "@/components/ResponsiveContainer";
import ResponsiveCard from "@/components/ResponsiveCard";

export default function FornitoriPage() {
  const vendors = [...]; // Array fornitori

  return (
    <ResponsiveContainer maxWidth="xl" centered>
      <h1 className="text-3xl font-serif font-bold mb-6">Fornitori</h1>

      {/* Lista fornitori */}
      <div className="space-y-3">
        {vendors.map((vendor) => (
          <ResponsiveCard
            key={vendor.id}
            hoverable
            onClick={() => handleSelect(vendor)}
            elevation="md"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{vendor.name}</h3>
                <p className="text-sm text-gray-600">📍 {vendor.location}</p>
                <p className="text-sm text-gray-700 mt-1">⭐ {vendor.rating}/5.0</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-[#8da182]">{vendor.price}</p>
                {/* Pulsante touch-friendly (min 48px height) */}
                <button 
                  className="mt-2 px-4 py-2 bg-[#8da182] text-white rounded-full text-sm font-semibold"
                  style={{ minHeight: "48px" }}
                >
                  Dettagli
                </button>
              </div>
            </div>
          </ResponsiveCard>
        ))}
      </div>
    </ResponsiveContainer>
  );
}
```

---

### Invitati (`src/app/invitati/page.tsx`)

```tsx
import ResponsiveContainer, { ResponsiveGrid, ResponsiveStack } from "@/components/ResponsiveContainer";
import ResponsiveCard from "@/components/ResponsiveCard";

export default function InvitatiPage() {
  return (
    <ResponsiveContainer maxWidth="xl" centered>
      <h1 className="text-3xl font-serif font-bold mb-6">Gestione Invitati</h1>

      {/* Form ricerca */}
      <ResponsiveCard padding="lg" className="mb-6">
        <input
          type="text"
          placeholder="Cerca invitato..."
          className="w-full px-4 py-3 border rounded-lg"
          style={{ minHeight: "48px" }} // Touch-friendly
        />
        
        <ResponsiveStack mobileDirection="vertical" desktopDirection="horizontal" spacing="md" className="mt-4">
          <button className="btn-primary flex-1">Cerca</button>
          <button className="btn-secondary flex-1">Reset</button>
        </ResponsiveStack>
      </ResponsiveCard>

      {/* Statistiche */}
      <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={4} gap="sm">
        <ResponsiveCard variant="sage" padding="md">
          <p className="text-sm text-gray-600">Totale</p>
          <p className="text-2xl font-bold">150</p>
        </ResponsiveCard>
        <ResponsiveCard variant="rose" padding="md">
          <p className="text-sm text-gray-600">Confermati</p>
          <p className="text-2xl font-bold">147</p>
        </ResponsiveCard>
        <ResponsiveCard variant="beige" padding="md">
          <p className="text-sm text-gray-600">In attesa</p>
          <p className="text-2xl font-bold">3</p>
        </ResponsiveCard>
        <ResponsiveCard variant="default" padding="md">
          <p className="text-sm text-gray-600">Rifiutati</p>
          <p className="text-2xl font-bold">0</p>
        </ResponsiveCard>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
}
```

---

## 📱 Safe Areas iOS

### Problema: Notch copre contenuto

#### ❌ PRIMA
```tsx
<header className="fixed top-0">
  <h1>Titolo</h1>
</header>
```

#### ✅ DOPO
```tsx
<header 
  className="fixed top-0 pt-safe-top"
  style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
>
  <h1>Titolo</h1>
</header>
```

### Bottom Navigation con Safe Area

```tsx
import BottomNav from "@/components/BottomNav";

// Automaticamente aggiunge pb-safe-bottom su iOS
<BottomNav items={navItems} />
```

---

## 🎨 Rilevamento Dispositivo Condizionale

### Usa Hook per Logica Specifica

```tsx
import { useDeviceDetection, useIsIOS, useIsMobile } from "@/hooks/useDeviceDetection";

export default function MyComponent() {
  const { deviceType, os } = useDeviceDetection();
  const isIOS = useIsIOS();
  const isMobile = useIsMobile();

  return (
    <div>
      {/* Mostra messaggio specifico per iOS */}
      {isIOS && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p>👋 Aggiungi alla Home Screen per esperienza app-like!</p>
        </div>
      )}

      {/* Layout diverso per mobile */}
      {isMobile ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}

      {/* Info debug */}
      <p className="text-xs text-gray-500">
        Device: {deviceType} | OS: {os}
      </p>
    </div>
  );
}
```

---

## ✅ Checklist Migrazione Pagina

Per ogni pagina da migrare:

1. **Container Principale**
   - [ ] Sostituisci `<div className="max-w-...">` con `<ResponsiveContainer>`

2. **Grid/Liste**
   - [ ] Converti `grid grid-cols-X` in `<ResponsiveGrid>`
   - [ ] Definisci colonne per mobile/tablet/desktop

3. **Pulsanti**
   - [ ] Wrap pulsanti multipli in `<ResponsiveStack>`
   - [ ] Aggiungi `flex-1` per width uguale
   - [ ] Verifica min-height 44-48px

4. **Card**
   - [ ] Sostituisci div con `<ResponsiveCard>`
   - [ ] Aggiungi `hoverable` se cliccabili
   - [ ] Usa varianti colore (`variant="sage"`)

5. **Form**
   - [ ] Input min-height 48px
   - [ ] Stack verticale pulsanti su mobile
   - [ ] Label visibili e touch-friendly

6. **Navigazione**
   - [ ] Considera `<BottomNav>` per mobile
   - [ ] Aggiungi badge per notifiche

7. **Safe Areas (iOS)**
   - [ ] Header fisso: aggiungi `pt-safe-top`
   - [ ] Footer fisso: aggiungi `pb-safe-bottom`

8. **Testing**
   - [ ] Testa su mobile (portrait + landscape)
   - [ ] Testa su tablet
   - [ ] Testa su desktop
   - [ ] Verifica hover solo desktop
   - [ ] Verifica tap feedback mobile

---

## 🚀 Quick Wins (5 minuti per pagina)

### Migrazione Veloce in 3 Step

```tsx
// 1. Import componenti responsive
import ResponsiveContainer, { ResponsiveGrid, ResponsiveStack } from "@/components/ResponsiveContainer";
import ResponsiveCard from "@/components/ResponsiveCard";

// 2. Wrap contenuto in ResponsiveContainer
export default function MyPage() {
  return (
    <ResponsiveContainer maxWidth="xl" centered>
      {/* Il tuo contenuto esistente */}
    </ResponsiveContainer>
  );
}

// 3. Sostituisci grid/flex con componenti responsive
// PRIMA: <div className="grid grid-cols-3">
// DOPO:  <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={3}>
```

---

**🎉 Fatto! Pagina ora responsive in 5 minuti!**
