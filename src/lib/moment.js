import moment from 'moment';
import 'moment/locale/it';
import 'moment/locale/de';
import 'moment/locale/es';

// Map of supported locales
const supportedLocales = {
  en: 'en',
  it: 'it',
  de: 'de',
  es: 'es'
};

// Function to set moment locale
export const setMomentLocale = (locale) => {
  const momentLocale = supportedLocales[locale] || 'en';
  moment.locale(momentLocale);
};

// Export moment instance
export default moment; 