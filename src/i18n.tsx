import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';

export const supportedLanguages = ['fr', 'en'];

i18n.use(Backend)
	.use(initReactI18next) // passes i18n down to react-i18next
	.use(LanguageDetector)
	.init({
		detection: {
			order: ['navigator'],
		},
		ns: ['common'],
		defaultNS: 'common',
		// lng: 'en',
		fallbackLng: 'en', // use en if detected lng is not available
		supportedLngs: supportedLanguages,
		interpolation: {
			escapeValue: false, // react already safes from xss
		},
		react: {
			useSuspense: false,
		},
	});

export default i18n;
