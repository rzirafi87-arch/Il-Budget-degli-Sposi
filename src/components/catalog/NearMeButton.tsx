"use client";

import { AppButton } from "@/components/ui/AppButton";
import { LocateFixed } from "lucide-react";
import { useState } from "react";

export type CurrentPosition = { latitude: number; longitude: number };
export function NearMeButton({ onPosition, label, unavailableLabel }: { onPosition: (position: CurrentPosition) => void; label: string; unavailableLabel: string }) {
  const [pending, setPending] = useState(false); const [error, setError] = useState(false);
  function locate() {
    if (!navigator.geolocation) { setError(true); return; }
    setPending(true); setError(false);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { onPosition({ latitude: coords.latitude, longitude: coords.longitude }); setPending(false); },
      () => { setError(true); setPending(false); },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }
  return <div><AppButton type="button" variant="outline" onClick={locate} loading={pending} aria-label={label}><LocateFixed size={17} aria-hidden />{label}</AppButton>{error ? <p role="status" className="mt-1 text-xs text-amber-700">{unavailableLabel}</p> : null}</div>;
}
