import { createFileRoute } from "@tanstack/react-router";
import { Settings2 } from "lucide-react";
import { ProtectedPlaceholderPage } from "@/components/app/ProtectedPlaceholderPage";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <ProtectedPlaceholderPage
      title="Settings"
      description="Manage account and workspace-level configuration."
      icon={Settings2}
    />
  );
}
