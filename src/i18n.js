import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "./locales/ru/translation.json";
import tm from "./locales/tm/translation.json";

const savedLang = localStorage.getItem("lang") || "ru";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ru: { translation: ru },
            tm: { translation: tm }
        },
        lng: savedLang,
        fallbackLng: "ru",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;