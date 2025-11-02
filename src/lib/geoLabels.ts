export function getRegionLabel(country: string) {
  switch ((country || 'it').toLowerCase()) {
    case 'mx': return 'Stato';
    case 'es': return 'Comunidad';
    case 'fr': return 'Région';
    case 'us': return 'Stato';
    case 'gb': return 'Nazione';
    case 'in': return 'Stato / UT';
    case 'jp': return 'Prefettura';
    default: return 'Regione';
  }
}

export function getProvinceLabel(country: string) {
  switch ((country || 'it').toLowerCase()) {
    case 'mx': return 'Municipio / Provincia';
    case 'es': return 'Provincia';
    case 'fr': return 'Dipartimento';
    case 'us': return 'Contea';
    case 'gb': return 'Contea';
    case 'in': return 'Distretto';
    case 'jp': return 'Municipalità';
    default: return 'Provincia';
  }
}

