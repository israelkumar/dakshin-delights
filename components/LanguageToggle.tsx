
import React from 'react';
import { useLanguage } from '../LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, t, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-sm font-bold hover:bg-primary/10 transition-colors"
      aria-label={language === 'en' ? 'Switch to Tamil' : 'Switch to English'}
      title={language === 'en' ? 'Switch to Tamil' : 'Switch to English'}
    >
      <span className="material-icons text-base text-primary" aria-hidden="true">translate</span>
      <span className="text-primary">{t.langToggle}</span>
    </button>
  );
};
