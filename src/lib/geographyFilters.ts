// Mappa dei livelli geografici per ogni paese
// Ogni entry definisce la gerarchia dei filtri da mostrare

export const FILTER_LEVELS_BY_COUNTRY: Record<string, Array<{ key: string; label: string }>> = {
  IT: [
    { key: "region", label: "Regione" },
    { key: "province", label: "Provincia" },
    { key: "type", label: "Tipologia Location" },
  ],
  GB: [
    { key: "nation", label: "Nazione" },
    { key: "region", label: "Regione" },
    { key: "county", label: "Contea" },
    { key: "type", label: "Tipologia Location" },
  ],
  BR: [
    { key: "state", label: "Stato" },
    { key: "type", label: "Tipologia Location" },
  ],
  CN: [
    { key: "province", label: "Provincia" },
    { key: "type", label: "Tipologia Location" },
  ],
  CA: [
    { key: "province", label: "Provincia" },
    { key: "type", label: "Tipologia Location" },
  ],
  DE: [
    { key: "state", label: "Land" },
    { key: "type", label: "Tipologia Location" },
  ],
  ID: [
    { key: "province", label: "Provincia" },
    { key: "type", label: "Tipologia Location" },
  ],
  SA: [
    { key: "region", label: "Regione" },
    { key: "type", label: "Tipologia Location" },
  ],
  // Aggiungi altri paesi qui
};

// Funzione di utilità per ottenere i livelli geografici
export function getGeographyLevels(countryCode: string) {
  const code = (countryCode || "").toUpperCase();
  return FILTER_LEVELS_BY_COUNTRY[code] || [];
}
