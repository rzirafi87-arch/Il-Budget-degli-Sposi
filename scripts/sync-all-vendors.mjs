#!/usr/bin/env node

/**
 * Batch sync script for all Italian regions
 * Run: node scripts/sync-all-vendors.mjs
 * 
 * Syncs vendors from Google Places API and OpenStreetMap
 * for all Italian regions and vendor types.
 */

import "dotenv/config";

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const REGIONS = [
  "Sicilia",
  "Lombardia",
  "Lazio",
  "Toscana",
  "Campania",
  "Veneto",
  "Piemonte",
  "Emilia-Romagna",
  "Puglia",
  "Calabria",
  "Sardegna",
  "Liguria",
  "Marche",
  "Umbria",
  "Abruzzo",
  "Basilicata",
  "Molise",
  "Friuli-Venezia Giulia",
  "Trentino-Alto Adige",
  "Valle d'Aosta",
];

const VENDOR_TYPES = [
  "location",
  "church",
  "planner",
  "band",
  "dj",
  "photographer",
  "videographer",
  "florist",
  "caterer",
];

// Province mapping for OSM church sync
const PROVINCES = {
  Sicilia: [
    "Provincia di Agrigento",
    "Provincia di Caltanissetta",
    "Provincia di Catania",
    "Provincia di Enna",
    "Provincia di Messina",
    "Provincia di Palermo",
    "Provincia di Ragusa",
    "Provincia di Siracusa",
    "Provincia di Trapani",
  ],
  Lombardia: [
    "Provincia di Bergamo",
    "Provincia di Brescia",
    "Provincia di Como",
    "Provincia di Cremona",
    "Città Metropolitana di Milano",
    "Provincia di Pavia",
    "Provincia di Varese",
  ],
  // Add more as needed...
};

const stats = {
  totalSyncs: 0,
  successfulSyncs: 0,
  failedSyncs: 0,
  totalVendors: 0,
  newVendors: 0,
  estimatedCost: 0,
};

/**
 * Sync Google Places for one region and type
 */
async function syncGooglePlaces(region, type, force = false) {
  const url = `${API_BASE}/api/sync/places?region=${encodeURIComponent(
    region
  )}&type=${type}&force=${force}`;

  console.log(`\n🔍 Syncing Google Places: ${type} in ${region}...`);

  try {
    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      console.log(`✅ ${result.message}`);
      stats.successfulSyncs++;
      stats.totalVendors += result.count || 0;
      stats.newVendors += result.newCount || 0;

      // Estimate cost ($32 per 1000 searches + $0.017 per field)
      const searchCost = (3 * 32) / 1000; // 3 keywords
      const detailsCost = ((result.newCount || 0) * 5 * 0.017); // 5 fields
      stats.estimatedCost += searchCost + detailsCost;
    } else {
      console.error(`❌ Failed: ${result.error}`);
      stats.failedSyncs++;
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    stats.failedSyncs++;
  }

  stats.totalSyncs++;
}

/**
 * Sync OpenStreetMap for one province and type
 */
async function syncOSM(area, type, region) {
  const url = `${API_BASE}/api/sync/osm?area=${encodeURIComponent(
    area
  )}&type=${type}&region=${encodeURIComponent(region)}`;

  console.log(`\n🗺️  Syncing OSM: ${type} in ${area}...`);

  try {
    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      console.log(`✅ ${result.message}`);
      stats.successfulSyncs++;
      stats.totalVendors += result.count || 0;
      stats.newVendors += result.newCount || 0;
    } else {
      console.error(`❌ Failed: ${result.error}`);
      stats.failedSyncs++;
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    stats.failedSyncs++;
  }

  stats.totalSyncs++;

  // Rate limiting for OSM (be respectful)
  await sleep(2000);
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main sync workflow
 */
async function main() {
  console.log("🚀 Starting batch vendor sync...\n");
  console.log(`📍 Regions: ${REGIONS.length}`);
  console.log(`🏷️  Types: ${VENDOR_TYPES.join(", ")}\n`);

  const startTime = Date.now();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const syncGoogle = !args.includes("--osm-only");
  const syncOSMData = !args.includes("--google-only");
  const force = args.includes("--force");
  const dryRun = args.includes("--dry-run");

  const selectedRegions = args.find((arg) => arg.startsWith("--region="))
    ?.split("=")[1]
    ?.split(",") || REGIONS;

  const selectedTypes = args.find((arg) => arg.startsWith("--type="))
    ?.split("=")[1]
    ?.split(",") || VENDOR_TYPES;

  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Google Places: ${syncGoogle ? "✅" : "❌"}`);
  console.log(`OpenStreetMap: ${syncOSMData ? "✅" : "❌"}`);
  console.log(`Force resync: ${force ? "✅" : "❌"}\n`);

  if (dryRun) {
    console.log("⚠️  DRY RUN MODE - No actual syncs will be performed\n");
  }

  // 1. Sync Google Places (prioritize locations and churches)
  if (syncGoogle && !dryRun) {
    console.log("\n" + "=".repeat(60));
    console.log("📍 GOOGLE PLACES SYNC");
    console.log("=".repeat(60));

    for (const region of selectedRegions) {
      for (const type of selectedTypes) {
        await syncGooglePlaces(region, type, force);

        // Rate limiting between syncs
        await sleep(3000);
      }

      // Longer delay between regions
      await sleep(5000);
    }
  }

  // 2. Sync OpenStreetMap churches (FREE!)
  if (syncOSMData && !dryRun) {
    console.log("\n" + "=".repeat(60));
    console.log("🗺️  OPENSTREETMAP SYNC");
    console.log("=".repeat(60));

    // Only sync churches from OSM (most comprehensive data)
    for (const region of selectedRegions.filter((r) => PROVINCES[r])) {
      const provinces = PROVINCES[region] || [region];

      for (const province of provinces) {
        await syncOSM(province, "church", region);
      }

      // Delay between regions
      await sleep(5000);
    }
  }

  // Print summary
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);

  console.log("\n" + "=".repeat(60));
  console.log("📊 SYNC SUMMARY");
  console.log("=".repeat(60));
  console.log(`⏱️  Duration: ${duration} minutes`);
  console.log(`✅ Successful syncs: ${stats.successfulSyncs}`);
  console.log(`❌ Failed syncs: ${stats.failedSyncs}`);
  console.log(`📦 Total vendors processed: ${stats.totalVendors}`);
  console.log(`🆕 New vendors added: ${stats.newVendors}`);
  console.log(`💰 Estimated Google cost: $${stats.estimatedCost.toFixed(2)}`);
  console.log("=".repeat(60) + "\n");

  if (dryRun) {
    // Calculate estimates for dry run
    const estimatedSyncs = selectedRegions.length * selectedTypes.length;
    const estimatedCost =
      estimatedSyncs * 3 * (32 / 1000) + // Text search
      estimatedSyncs * 20 * 5 * 0.017; // Place details

    console.log("📋 DRY RUN ESTIMATES:");
    console.log(`   Total syncs: ${estimatedSyncs}`);
    console.log(`   Estimated cost: $${estimatedCost.toFixed(2)}`);
    console.log(`   Estimated time: ${(estimatedSyncs * 10 / 60).toFixed(2)} minutes\n`);
  }

  console.log("✨ Sync complete!\n");
}

// Run
main().catch((error) => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});

// Help text
if (process.argv.includes("--help")) {
  console.log(`
Vendor Sync Script - Il Budget degli Sposi

Usage: node scripts/sync-all-vendors.mjs [options]

Options:
  --dry-run            Show what would be synced without actually syncing
  --force              Force resync even if cached (ignore 7-day cache)
  --google-only        Only sync Google Places (skip OSM)
  --osm-only           Only sync OpenStreetMap (skip Google)
  --region=REGIONS     Comma-separated list of regions (default: all)
  --type=TYPES         Comma-separated list of types (default: all)
  --help               Show this help message

Examples:
  # Dry run to see estimates
  node scripts/sync-all-vendors.mjs --dry-run

  # Sync only Sicilia locations
  node scripts/sync-all-vendors.mjs --region=Sicilia --type=location

  # Force resync all churches from both sources
  node scripts/sync-all-vendors.mjs --type=church --force

  # Sync multiple regions, OSM only (free)
  node scripts/sync-all-vendors.mjs --region=Sicilia,Lombardia --osm-only

Environment:
  NEXT_PUBLIC_APP_URL   Base URL for API (default: http://localhost:3000)
  GOOGLE_PLACES_API_KEY Google API key (required for --google-only)
  SUPABASE_SERVICE_ROLE Supabase service role key (required)
  `);
  process.exit(0);
}
