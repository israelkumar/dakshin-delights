
import React from 'react';
import { useLanguage } from '../LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary/30 text-sm font-bold hover:bg-primary hover:text-white transition-all"
      aria-label={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
      title={language === 'en' ? 'Switch to Spanish' : 'Switch to English'}
    >
      <span className="material-icons text-sm" aria-hidden="true">language</span>
      <span>{language === 'en' ? 'ES' : 'EN'}</span>
    </button>
  );
};
