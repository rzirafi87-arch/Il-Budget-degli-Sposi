// Configurazione immagini per ogni pagina
// Usando Unsplash come placeholder - sostituire con immagini reali

export const PAGE_IMAGES: Record<string, string[]> = {
  dashboard: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop", // Wedding planning
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=400&fit=crop", // Checklist
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&h=400&fit=crop", // Budget planning
  ],
  budget: [
    "https://images.unsplash.com/photo-1554224311-beee4f0d696c?w=1200&h=400&fit=crop", // Calculator
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=400&fit=crop", // Finance
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=400&fit=crop", // Notes
  ],
  spese: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop", // Charts
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=400&fit=crop", // Money
    "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1200&h=400&fit=crop", // Expenses
  ],
  entrate: [
    "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=1200&h=400&fit=crop", // Gifts
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&h=400&fit=crop", // Cash
    "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1200&h=400&fit=crop", // Income
  ],
  fornitori: [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&h=400&fit=crop", // Wedding services
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&h=400&fit=crop", // Flowers
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&h=400&fit=crop", // Catering
  ],
  location: [
    "https://images.unsplash.com/photo-1519167758481-83f29da8856c?w=1200&h=400&fit=crop", // Venue hall
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=400&fit=crop", // Garden venue
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200&h=400&fit=crop", // Outdoor venue
  ],
  chiese: [
    "https://images.unsplash.com/photo-1518599807935-37015b9cefcb?w=1200&h=400&fit=crop", // Church
    "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200&h=400&fit=crop", // Cathedral
    "https://images.unsplash.com/photo-1583468323330-9032ad490fed?w=1200&h=400&fit=crop", // Chapel
  ],
  invitati: [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&h=400&fit=crop", // Guests
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=400&fit=crop", // Party
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=400&fit=crop", // Celebration
  ],
  "save-the-date": [
    "https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=1200&h=400&fit=crop", // Invitations
    "https://images.unsplash.com/photo-1522673607212-f2f1e5b3d389?w=1200&h=400&fit=crop", // Cards
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&h=400&fit=crop", // Stationery
  ],
  "musica-cerimonia": [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop", // Orchestra
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=400&fit=crop", // Church music
    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&h=400&fit=crop", // Violin
  ],
  "musica-ricevimento": [
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=400&fit=crop", // Live band
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&h=400&fit=crop", // DJ
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=400&fit=crop", // Music
  ],
  "wedding-planner": [
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&h=400&fit=crop", // Planning
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&h=400&fit=crop", // Organization
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop", // Coordination
  ],
  "cose-matrimonio": [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=400&fit=crop", // Wedding day
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&h=400&fit=crop", // Ceremony
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&h=400&fit=crop", // Decorations
  ],
};

// Immagini di default se non specificato
export const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&h=400&fit=crop",
];
