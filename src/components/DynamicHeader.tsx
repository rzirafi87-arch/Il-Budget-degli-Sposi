
"use client";
import LocaleSwitcher from "@/components/LocaleSwitcher";

import { formatDate } from "@/lib/locale";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

const supabase = getBrowserClient();

type WeddingInfo = {
  coupleName?: string;
  weddingDate?: string;
  daysLeft?: number;
};

export default function DynamicHeader() {
  const t = useTranslations("header");
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
        const res = await fetch("/api/event/resolve", { headers: { Authorization: `Bearer ${jwt}` } });
        const json = await res.json();
        if (json.event) {
          const coupleName = json.event.couple_name || "Voi due";
          const weddingDate = json.event.wedding_date as string | undefined;
          let daysLeft: number | null = null;
          if (weddingDate) {
            const wedding = new Date(weddingDate);
            const today = new Date();
            const diff = Math.ceil((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            daysLeft = diff > 0 ? diff : 0;
          }
          setWeddingInfo({ coupleName, weddingDate, daysLeft: daysLeft ?? undefined });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !weddingInfo?.weddingDate) return null;

  const dateFormatted = formatDate(new Date(weddingInfo.weddingDate), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="border-b border-border bg-linear-to-r from-[#f4e8e4]/75 to-[#e5eee8]/75">
      <div className="mx-auto max-w-7xl px-4 py-2 text-center sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm sm:text-base">
          <span className="inline-flex items-center gap-1.5 font-serif font-bold text-gray-800">
            {weddingInfo.coupleName} <Heart size={15} fill="currentColor" className="text-[#a66367]" aria-label="insieme" />
          </span>
          <span className="hidden sm:inline text-gray-400" aria-hidden>
            ·
          </span>
          <span className="text-gray-700">{dateFormatted}</span>
          {weddingInfo.daysLeft !== undefined && (
            <>
              <span className="hidden sm:inline text-gray-400" aria-hidden>
                ·
              </span>
              <span className="font-semibold text-[#A6B5A0]">
                {weddingInfo.daysLeft === 0
                  ? t("today")
                  : weddingInfo.daysLeft === 1
                  ? t("dayLeft")
                  : t("daysLeft", { count: weddingInfo.daysLeft })}
              </span>
            </>
          )}
        </div>
        <div className="mt-2 flex justify-center">
          <LocaleSwitcher />
        </div>
      </div>
    </div>
  );
}
