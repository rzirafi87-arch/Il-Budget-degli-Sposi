// Re-export the official next-intl APIs so any remaining imports from
// "@/vendor/next-intl" keep working consistently with the app Provider.
// This prevents future mismatches between custom hooks and the real Provider.
export { IntlProvider, useTranslations } from 'next-intl';
export type { AbstractIntlMessages } from 'next-intl';

