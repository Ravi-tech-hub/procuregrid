import { createFileRoute } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { ProtectedPlaceholderPage } from "@/components/app/ProtectedPlaceholderPage";

export const Route = createFileRoute("/preferences")({
  component: PreferencesPage,
});

function PreferencesPage() {
  return (
    <ProtectedPlaceholderPage
      title="Preferences"
      description="Control personal defaults, view behavior, and workspace experience."
      icon={SlidersHorizontal}
    />
  );
}
