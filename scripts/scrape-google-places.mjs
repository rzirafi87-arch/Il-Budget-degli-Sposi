// =========================================
// GOOGLE PLACES API - LOCATION SCRAPER
// =========================================
// Script Node.js per popolare il database con location reali da Google Places
// Usa Google Places API (New) con Text Search e Place Details

import { config } from 'dotenv';
config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

// =========================================
// CONFIGURAZIONE RICERCHE
// =========================================
const SEARCH_CONFIGS = {
  locations: {
    includedTypes: ['wedding_venue', 'banquet_hall', 'event_venue'],
    keywords: ['location matrimonio', 'villa matrimonio', 'castello matrimonio'],
  },
  churches: {
    includedTypes: ['place_of_worship', 'church'],
    keywords: ['chiesa cattolica', 'chiesa matrimonio'],
  },
  planners: {
    includedTypes: ['point_of_interest'],
    keywords: ['wedding planner', 'organizzazione matrimoni'],
  },
  music: {
    includedTypes: ['point_of_interest'],
    keywords: ['band matrimonio', 'DJ matrimonio', 'musica matrimonio'],
  },
};

// Regioni italiane con coordinate centrali per la ricerca
const ITALIAN_REGIONS = [
  { name: 'Lombardia', lat: 45.4654, lng: 9.1859, radius: 50000 },
  { name: 'Lazio', lat: 41.9028, lng: 12.4964, radius: 50000 },
  { name: 'Toscana', lat: 43.7696, lng: 11.2558, radius: 50000 },
  { name: 'Campania', lat: 40.8518, lng: 14.2681, radius: 50000 },
  { name: 'Sicilia', lat: 37.5999, lng: 14.0153, radius: 70000 },
  { name: 'Veneto', lat: 45.4408, lng: 12.3155, radius: 50000 },
  { name: 'Piemonte', lat: 45.0703, lng: 7.6869, radius: 50000 },
  { name: 'Emilia-Romagna', lat: 44.4949, lng: 11.3426, radius: 50000 },
  { name: 'Puglia', lat: 41.1171, lng: 16.8719, radius: 60000 },
  { name: 'Liguria', lat: 44.4056, lng: 8.9463, radius: 40000 },
];

// =========================================
// GOOGLE PLACES API CALLS
// =========================================

/**
 * Text Search con Google Places API (New)
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 */
async function searchPlaces(query, region, includedTypes) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  const body = {
    textQuery: query,
    locationBias: {
      circle: {
        center: {
          latitude: region.lat,
          longitude: region.lng,
        },
        radius: region.radius,
      },
    },
    includedType: includedTypes[0], // Primary type
    maxResultCount: 20,
    languageCode: 'it',
    regionCode: 'IT',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.internationalPhoneNumber,places.websiteUri',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error(`❌ Google Places API error: ${response.status}`);
    return [];
  }

  const data = await response.json();
  return data.places || [];
}

/**
 * Place Details per arricchire i dati
 * https://developers.google.com/maps/documentation/places/web-service/place-details
 */
async function getPlaceDetails(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,types,internationalPhoneNumber,nationalPhoneNumber,websiteUri,rating,userRatingCount,photos,editorialSummary,priceLevel',
    },
  });

  if (!response.ok) {
    console.error(`❌ Place Details error for ${placeId}: ${response.status}`);
    return null;
  }

  return await response.json();
}

// =========================================
// DATA TRANSFORMATION
// =========================================

/**
 * Estrae provincia e città dall'indirizzo formattato
 */
function parseAddress(formattedAddress) {
  // Formato: "Via Nome, Città PROV, CAP, Italia"
  const parts = formattedAddress.split(',').map(s => s.trim());
  
  let city = '';
  let province = '';
  
  // Cerca il pattern "Città PROV" o "Città (PROV)"
  for (const part of parts) {
    const match = part.match(/^([A-Za-zÀ-ÿ\s]+)\s+([A-Z]{2})$/);
    if (match) {
      city = match[1].trim();
      province = match[2];
      break;
    }
  }
  
  return { city, province, address: parts[0] || '' };
}

/**
 * Determina il tipo di location
 */
function getLocationType(types) {
  if (types.includes('wedding_venue')) return 'Villa';
  if (types.includes('banquet_hall')) return 'Sala ricevimenti';
  if (types.includes('event_venue')) return 'Location eventi';
  if (types.includes('church')) return 'Chiesa';
  if (types.includes('place_of_worship')) return 'Luogo di culto';
  return 'Altro';
}

/**
 * Trasforma i dati di Google Places nel formato del database
 */
function transformToLocation(place, regionName) {
  const { city, province, address } = parseAddress(place.formattedAddress);
  
  return {
    name: place.displayName?.text || 'Nome non disponibile',
    region: regionName,
    province: province || 'N/A',
    city: city || 'N/A',
    address: address,
    phone: place.internationalPhoneNumber || place.nationalPhoneNumber || null,
    email: null, // Google non fornisce email
    website: place.websiteUri || null,
    description: place.editorialSummary?.text || `Location per matrimoni in ${city || regionName}`,
    capacity_min: null,
    capacity_max: null,
    location_type: getLocationType(place.types || []),
    verified: place.rating >= 4.0, // Verifica automatica se ha rating >= 4
    google_place_id: place.id,
    google_rating: place.rating || null,
    google_rating_count: place.userRatingCount || null,
  };
}

// =========================================
// SUPABASE INTEGRATION
// =========================================

/**
 * Inserisce location nel database Supabase
 */
async function insertLocations(locations) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
      'Prefer': 'resolution=ignore-duplicates', // Ignora duplicati
    },
    body: JSON.stringify(locations),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Supabase insert error:', error);
    return { success: false, error };
  }

  return { success: true, data: await response.json() };
}

/**
 * Controlla se una location esiste già (per evitare duplicati)
 */
async function locationExists(name, city, region) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/locations?name=eq.${encodeURIComponent(name)}&city=eq.${encodeURIComponent(city)}&region=eq.${encodeURIComponent(region)}&select=id`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
      },
    }
  );

  if (!response.ok) return false;
  const data = await response.json();
  return data.length > 0;
}

// =========================================
// MAIN SCRAPER LOGIC
// =========================================

/**
 * Scrape locations per una singola regione
 */
async function scrapeRegion(region, searchConfig, category = 'locations') {
  console.log(`\n🔍 Cercando ${category} in ${region.name}...`);
  
  const allResults = [];
  
  for (const keyword of searchConfig.keywords) {
    console.log(`  → Query: "${keyword}"`);
    
    try {
      const places = await searchPlaces(
        `${keyword} ${region.name}`,
        region,
        searchConfig.includedTypes
      );
      
      console.log(`    ✅ Trovati ${places.length} risultati`);
      
      for (const place of places) {
        // Verifica se esiste già
        const exists = await locationExists(
          place.displayName?.text,
          parseAddress(place.formattedAddress).city,
          region.name
        );
        
        if (exists) {
          console.log(`    ⏭️  Skip: ${place.displayName?.text} (già presente)`);
          continue;
        }
        
        // Arricchisci con Place Details
        const details = await getPlaceDetails(place.id);
        if (details) {
          const location = transformToLocation(details, region.name);
          allResults.push(location);
          console.log(`    ✨ Aggiunto: ${location.name}`);
        }
        
        // Rate limiting: 50ms tra una richiesta e l'altra
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
    } catch (error) {
      console.error(`    ❌ Errore durante la ricerca: ${error.message}`);
    }
  }
  
  return allResults;
}

/**
 * Esegue lo scraping per tutte le regioni
 */
async function scrapeAllRegions() {
  console.log('🚀 Inizio scraping location da Google Places API\n');
  console.log(`📍 Regioni: ${ITALIAN_REGIONS.length}`);
  console.log(`🔑 API Key: ${GOOGLE_PLACES_API_KEY ? '✅ Configurata' : '❌ Mancante'}\n`);
  
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('❌ ERRORE: Aggiungi GOOGLE_PLACES_API_KEY al file .env.local');
    process.exit(1);
  }
  
  let totalLocations = 0;
  
  for (const region of ITALIAN_REGIONS) {
    const locations = await scrapeRegion(region, SEARCH_CONFIGS.locations);
    
    if (locations.length > 0) {
      console.log(`\n💾 Inserendo ${locations.length} location in Supabase...`);
      const result = await insertLocations(locations);
      
      if (result.success) {
        console.log(`✅ ${locations.length} location inserite con successo!`);
        totalLocations += locations.length;
      } else {
        console.error(`❌ Errore nell'inserimento: ${result.error}`);
      }
    }
    
    // Pausa tra regioni per evitare rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\n🎉 COMPLETATO! Totale location aggiunte: ${totalLocations}`);
}

// =========================================
// ESECUZIONE
// =========================================

// Esegui lo scraper
scrapeAllRegions().catch(error => {
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});
