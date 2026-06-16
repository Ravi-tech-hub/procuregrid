import { en } from "./locales/en";
import { hi } from "./locales/hi";
import { kn } from "./locales/kn";
import { ml } from "./locales/ml";
import { te } from "./locales/te";
import { bn } from "./locales/bn";
import { gu } from "./locales/gu";
import { ur } from "./locales/ur";
import { workspaceResources } from "./workspace-translations";

export const resources = {
  en: { translation: { ...workspaceResources.en, ...en.translation } },
  hi: { translation: { ...workspaceResources.hi, ...hi.translation } },
  kn: { translation: { ...workspaceResources.kn, ...kn.translation } },
  ml: { translation: { ...workspaceResources.ml, ...ml.translation } },
  te: { translation: { ...workspaceResources.te, ...te.translation } },
  bn: { translation: { ...workspaceResources.bn, ...bn.translation } },
  gu: { translation: { ...workspaceResources.gu, ...gu.translation } },
  ur: { translation: { ...workspaceResources.ur, ...ur.translation } },
} as const;

export const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "ur", label: "Urdu", native: "اردو" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];
