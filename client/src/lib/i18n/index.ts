export { LanguageProvider, useLanguage } from './LanguageProvider';
export { useTranslation } from './useTranslation';

/**
 * Language utility functions for formatting dates, numbers, etc.
 * based on the current language
 */

/**
 * Format a date according to the current language/locale
 */
export function formatDate(date: Date, language: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  const locale = language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Format a number according to the current language/locale
 */
export function formatNumber(num: number, language: string): string {
  const locale = language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format currency according to the current language/locale
 */
export function formatCurrency(amount: number, language: string, currency = 'BDT'): string {
  const locale = language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency 
  }).format(amount);
}