"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";

const supabase = getBrowserClient();

type WeddingInfo = {
  coupleName?: string;
  weddingDate?: string;
  daysLeft?: number;
};

export default function DynamicHeader() {
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const jwt = sessionData.session?.access_token;

        if (!jwt) {
          setLoading(false);
          return;
        }

        const res = await fetch("/api/event/resolve", {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const json = await res.json();

        if (json.event) {
          const coupleName = json.event.couple_name || "Voi due";
          const weddingDate = json.event.wedding_date;

          let daysLeft = null;
          if (weddingDate) {
            const wedding = new Date(weddingDate);
            const today = new Date();
            const diff = Math.ceil(
              (wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            daysLeft = diff > 0 ? diff : 0;
          }

          setWeddingInfo({
            coupleName,
            weddingDate,
            daysLeft: daysLeft || undefined,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !weddingInfo?.weddingDate) {
    return null; // Header normale gestito dal layout
  }

  const dateFormatted = new Date(weddingInfo.weddingDate).toLocaleDateString(
    "it-IT",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="bg-gradient-to-r from-[#EAD9D4]/30 to-[#A6B5A0]/30 border-b border-[#E8E0D6]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-3 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm sm:text-base">
          <span className="font-serif font-bold text-gray-800">
            {weddingInfo.coupleName} 💍
          </span>
          <span className="hidden sm:inline text-gray-400">•</span>
          <span className="text-gray-700">{dateFormatted}</span>
          {weddingInfo.daysLeft !== undefined && (
            <>
              <span className="hidden sm:inline text-gray-400">•</span>
              <span className="font-semibold text-[#A6B5A0]">
                {weddingInfo.daysLeft === 0
                  ? "È oggi! 🎉"
                  : weddingInfo.daysLeft === 1
                  ? "Manca 1 giorno ⏰"
                  : `Mancano ${weddingInfo.daysLeft} giorni ⏰`}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
