import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationPT from './locales/pt/translation.json';

const resources = {
    en: { translation: translationEN },
    pt: { translation: translationPT },
};

const savedLanguage = localStorage.getItem('i18nextLng') || 'en'; // Define 'en' como padrão se não houver idioma salvo

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        keySeparator: false,
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
