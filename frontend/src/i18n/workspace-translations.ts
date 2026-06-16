import { buildLocalized } from "./workspace-builder";
import { workspaceEn } from "./workspace-en";
import { hiWorkspaceLocale } from "./workspace-locales/hi";
import { knWorkspaceLocale } from "./workspace-locales/kn";
import { mlWorkspaceLocale } from "./workspace-locales/ml";
import { teWorkspaceLocale } from "./workspace-locales/te";
import { bnWorkspaceLocale } from "./workspace-locales/bn";
import { guWorkspaceLocale } from "./workspace-locales/gu";
import { urWorkspaceLocale } from "./workspace-locales/ur";

export const workspaceResources = {
  en: workspaceEn,
  hi: buildLocalized(hiWorkspaceLocale),
  kn: buildLocalized(knWorkspaceLocale),
  ml: buildLocalized(mlWorkspaceLocale),
  te: buildLocalized(teWorkspaceLocale),
  bn: buildLocalized(bnWorkspaceLocale),
  gu: buildLocalized(guWorkspaceLocale),
  ur: buildLocalized(urWorkspaceLocale),
};
