import { useLanguageContext, type Language } from '../context/LanguageContext';

export function useLanguage() {
  const { language, setLanguage, t } = useLanguageContext();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mk' : 'en');
  };

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isEnglish: language === 'en',
    isMacedonian: language === 'mk',
  };
}

export type { Language };
