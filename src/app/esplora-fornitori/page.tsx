"use client";

import VendorExplorer from "@/components/VendorExplorer";

/**
 * Vendor Explorer Page
 * Route: /esplora-fornitori
 * 
 * Public page for browsing wedding vendors from Google Places and OSM
 */

export default function EsploraFornitoriPage() {
  return (
    <div>
      <VendorExplorer initialType="location" initialRegion="" />
    </div>
  );
}
