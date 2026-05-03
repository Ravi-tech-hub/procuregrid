import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./translations";

if (!i18n.isInitialized) {
  const stored =
    typeof window !== "undefined" ? window.localStorage.getItem("lng") : null;

  void i18n.use(initReactI18next).init({
    resources,
    lng: stored ?? "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
