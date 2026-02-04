// src/i18n/config.ts

export const locales = ['de', 'en', 'fr', 'it', 'sr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';

export const localeNames: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  sr: 'Srpski',
};

export const localeFlags: Record<Locale, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  fr: '🇫🇷',
  it: '🇮🇹',
  sr: '🇷🇸',
};
