"use client";

import { usePathname, useRouter } from "next/navigation";
import { localeNames, locales } from "@/i18n/config";
import { useMemo } from "react";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const pathSegments = useMemo(() => {
    const segments = pathname ? pathname.split("/").filter(Boolean) : [];
    if (segments.length === 0) {
      return [];
    }
    return segments;
  }, [pathname]);

  const changeLang = (locale: string) => {
    const segments = [...pathSegments];
    if (segments.length === 0 || !locales.includes(segments[0] as (typeof locales)[number])) {
      segments.unshift(locale);
    } else {
      segments[0] = locale;
    }
    router.push(`/${segments.join("/")}` || "/");
  };

  return (
    <div className="flex flex-wrap gap-2">
      {locales.map((lng) => (
        <button
          key={lng}
          onClick={() => changeLang(lng)}
          className="px-2 py-1 text-xs sm:text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
        >
          {localeNames[lng]}
        </button>
      ))}
    </div>
  );
}
