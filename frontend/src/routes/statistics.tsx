import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProtectedPlaceholderPage } from "@/components/app/ProtectedPlaceholderPage";

export const Route = createFileRoute("/statistics")({
  component: StatisticsPage,
});

function StatisticsPage() {
  const { t } = useTranslation();

  return (
    <ProtectedPlaceholderPage
      title={t("workspace.pages.statistics.title")}
      description={t("workspace.pages.statistics.description")}
      icon={BarChart3}
    />
  );
}
