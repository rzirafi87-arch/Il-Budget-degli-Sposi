"use client";

import { visibleLanguages } from "@/i18n/languageCapabilities";
import { localizedHref, persistLocalePreference, pushLocalizedRoute } from "@/i18n/runtimeRouting";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("languageSwitcher");
  const pathSegments = useMemo(() => pathname ? pathname.split("/").filter(Boolean) : [], [pathname]);
  const currentLocale = visibleLanguages.some((language) => language.locale === pathSegments[0]) ? pathSegments[0] : "it";

  const changeLang = (locale: string) => {
    persistLocalePreference(locale);
    pushLocalizedRoute(router, pathname || "/", locale as Parameters<typeof localizedHref>[1], window.location.search, window.location.hash);
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={t("ariaLabel")}>
      {visibleLanguages.map((language) => (
        <button
          key={language.locale}
          type="button"
          onClick={() => language.selectable && changeLang(language.locale)}
          disabled={!language.selectable}
          aria-disabled={!language.selectable}
          aria-pressed={currentLocale === language.locale}
          className="px-2 py-1 text-xs sm:text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {language.nativeLabel}{!language.selectable ? ` · ${t("comingSoon")}` : ""}
        </button>
      ))}
    </div>
  );
}
