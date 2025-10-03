import React from 'react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
      <Button
        variant={language === 'tr' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('tr')}
        className={`text-xs px-2 py-1 h-7 ${
          language === 'tr' 
            ? 'bg-white text-primary hover:bg-white/90' 
            : 'text-white hover:bg-white/20'
        }`}
      >
        TR
      </Button>
      <div className="w-px h-4 bg-white/30"></div>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className={`text-xs px-2 py-1 h-7 ${
          language === 'en' 
            ? 'bg-white text-primary hover:bg-white/90' 
            : 'text-white hover:bg-white/20'
        }`}
      >
        EN
      </Button>
    </div>
  );
}