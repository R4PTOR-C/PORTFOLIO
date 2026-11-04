'use client';
import { useEffect } from 'react';
import i18n from '@/lib/i18n';

export default function I18nProvider({ children }) {
  useEffect(() => {
    const syncLang = (lng) => { document.documentElement.lang = lng; };

    const saved = localStorage.getItem('i18nextLng');
    if (saved && saved !== i18n.language) i18n.changeLanguage(saved);
    syncLang(i18n.language);

    i18n.on('languageChanged', syncLang);
    return () => i18n.off('languageChanged', syncLang);
  }, []);

  return <>{children}</>;
}
