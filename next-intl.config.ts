import { defineConfig } from "next-intl";

import { locales, defaultLocale } from "./src/i18n/config";

export default defineConfig({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
});
