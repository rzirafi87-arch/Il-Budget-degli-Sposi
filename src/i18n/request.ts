import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from './config';
import { getMessages } from './getMessages';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: await getMessages(locale as Locale),
    timeZone: 'Europe/Rome',
  };
});
