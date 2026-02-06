// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from './config';

export default getRequestConfig(async () => {
  // Get locale from cookie or use default
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');

  let locale: Locale = defaultLocale;

  if (localeCookie?.value && locales.includes(localeCookie.value as Locale)) {
    locale = localeCookie.value as Locale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
