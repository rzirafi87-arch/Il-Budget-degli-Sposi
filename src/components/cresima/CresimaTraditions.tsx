"use client";
import React from "react";
import WeddingTraditionInfo, { type WeddingTradition } from "@/components/WeddingTraditionInfo";

export default function CresimaTraditions() {
  const [tradition, setTradition] = React.useState<WeddingTradition | null>(null);

  React.useEffect(() => {
    try {
      const lsCountry = localStorage.getItem("country");
      const ckCountry = document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1];
      const country = lsCountry || ckCountry || "it";
      fetch(`/api/traditions?country=${encodeURIComponent(country)}`)
        .then((r) => r.json())
        .then((d) => setTradition((d?.traditions && d.traditions[0]) || null))
        .catch(() => setTradition(null));
    } catch {
      setTradition(null);
    }
  }, []);

  return <WeddingTraditionInfo tradition={tradition} />;
}

