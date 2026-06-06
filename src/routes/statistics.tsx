import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { ProtectedPlaceholderPage } from "@/components/app/ProtectedPlaceholderPage";

export const Route = createFileRoute("/statistics")({
  component: StatisticsPage,
});

function StatisticsPage() {
  return (
    <ProtectedPlaceholderPage
      title="Statistics"
      description="Review usage and platform metrics tied to your authenticated workspace."
      icon={BarChart3}
    />
  );
}
