import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./translations";

if (!i18n.isInitialized) {
  const stored = typeof window !== "undefined" ? window.localStorage.getItem("lng") : null;

  void i18n.use(initReactI18next).init({
    resources,
    lng: stored ?? "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

if (typeof document !== "undefined") {
  const applyDocumentLanguage = (language: string) => {
    const code = language.split("-")[0];
    document.documentElement.lang = code;
    document.documentElement.dir = code === "ur" ? "rtl" : "ltr";
  };

  applyDocumentLanguage(i18n.resolvedLanguage ?? i18n.language ?? "en");
  i18n.on("languageChanged", applyDocumentLanguage);
}

export default i18n;
