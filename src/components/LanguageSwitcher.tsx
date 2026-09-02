"use client";

import { usePathname, useRouter } from "next/navigation";
import { visibleLanguages } from "@/i18n/languageCapabilities";
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
    if (segments.length === 0 || !visibleLanguages.some((language) => language.locale === segments[0])) {
      segments.unshift(locale);
    } else {
      segments[0] = locale;
    }
    router.push(`/${segments.join("/")}` || "/");
  };

  return (
    <div className="flex flex-wrap gap-2">
      {visibleLanguages.map((language) => (
        <button
          key={language.locale}
          type="button"
          onClick={() => language.selectable && changeLang(language.locale)}
          disabled={!language.selectable}
          aria-disabled={!language.selectable}
          className="px-2 py-1 text-xs sm:text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
        >
          {language.nativeLabel}
          {!language.selectable ? " · In arrivo" : ""}
        </button>
      ))}
    </div>
  );
}
