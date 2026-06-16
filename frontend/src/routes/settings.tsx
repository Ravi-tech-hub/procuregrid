import { createFileRoute } from "@tanstack/react-router";
import { Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProtectedPlaceholderPage } from "@/components/app/ProtectedPlaceholderPage";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation();

  return (
    <ProtectedPlaceholderPage
      title={t("workspace.pages.settings.title")}
      description={t("workspace.pages.settings.description")}
      icon={Settings2}
    />
  );
}
