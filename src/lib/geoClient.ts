"use client";
import { GEO, getUserCountrySafe } from "@/constants/geo";
import { useEffect, useMemo, useRef, useState } from "react";

const provincesCache = new Map<string, string[]>();

export function useRegionList() {
  const [country] = useState<string>(() => getUserCountrySafe());
  const regions = useMemo(() => (GEO[country]?.regions || GEO.it.regions).map(r => r.name), [country]);
  return { country, regions };
}

export function useProvinceList(country: string, selectedRegion: string, deriveFromItems?: () => string[]) {
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState<string[]>([]);
  const mounted = useRef(true);

  useEffect(() => { return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    if (!selectedRegion) { setProvinces([]); return; }
    const key = `${country}|${selectedRegion}`;
    const geoProv = (GEO[country]?.regions || GEO.it.regions).find(r => r.name === selectedRegion)?.provinces;
    if (geoProv && geoProv.length) { setProvinces(geoProv); return; }
    if (provincesCache.has(key)) { setProvinces(provincesCache.get(key)!); return; }

    let aborted = false;
    (async () => {
      setLoading(true);
      // Try dynamic file from public/geo/<country>/<region>.json
      try {
        const url = `/geo/${country}/${encodeURIComponent(selectedRegion)}.json`;
        const res = await fetch(url, { cache: "force-cache" });
        if (res.ok) {
          const arr = await res.json();
          if (Array.isArray(arr) && !aborted) {
            provincesCache.set(key, arr);
            if (mounted.current) setProvinces(arr);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Ignore fetch errors
      }
      // Fallback from items provided by caller
      try {
        const fromItems = deriveFromItems?.() || [];
        if (!aborted) {
          if (mounted.current) setProvinces(fromItems);
        }
      } finally {
        if (!aborted && mounted.current) setLoading(false);
      }
    })();
    return () => { aborted = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, selectedRegion]);

  return { provinces, loading };
}
