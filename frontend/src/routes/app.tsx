import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppWorkspaceShell } from "@/components/app/AppWorkspaceShell";
import { BuyerWorkspace } from "@/components/app/BuyerWorkspace";
import { SupplierWorkspace } from "@/components/app/SupplierWorkspace";
import type { WorkspaceMode } from "@/components/app/workspace-data";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  component: AppHomePage,
});

function AppHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, company, loading } = useAuth();
  const initialMode: WorkspaceMode = company?.company_type === "supplier" ? "supplier" : "buyer";
  const [mode, setMode] = useState<WorkspaceMode>(initialMode);
  const [activeSection, setActiveSection] = useState("dashboard");
  const displayName =
    user?.user_metadata.full_name ||
    user?.email?.split("@")[0] ||
    user?.phone ||
    t("workspace.shell.account");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (!company) {
      navigate({ to: "/onboarding/company", replace: true });
    }
  }, [company, loading, navigate, user]);

  useEffect(() => {
    if (!company) return;
    setMode(company.company_type === "supplier" ? "supplier" : "buyer");
    setActiveSection("dashboard");
  }, [company]);

  function handleModeChange(nextMode: WorkspaceMode) {
    setMode(nextMode);
    setActiveSection("dashboard");
  }

  if (loading || !user || !company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <div className="flex items-center gap-3 rounded-xl border border-[#dfe6ef] bg-white px-5 py-4 text-sm text-[#65758a] shadow-sm">
          <LoaderCircle className="h-5 w-5 animate-spin text-[#1d5b91]" />
          {t("workspace.shell.preparing", { defaultValue: "Preparing your workspace..." })}
        </div>
      </div>
    );
  }

  return (
    <AppWorkspaceShell
      mode={mode}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onModeChange={company.company_type === "hybrid" ? handleModeChange : undefined}
      footer={<Footer />}
    >
      {mode === "buyer" ? (
        <BuyerWorkspace
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          displayName={displayName}
        />
      ) : (
        <SupplierWorkspace
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          displayName={displayName}
        />
      )}
    </AppWorkspaceShell>
  );
}
