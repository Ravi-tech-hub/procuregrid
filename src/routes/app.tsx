import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, LoaderCircle, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { getUserPrimaryIdentifier } from "@/lib/auth-identifiers";

export const Route = createFileRoute("/app")({
  component: AppHomePage,
});

function AppHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, membership, company, loading, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const primaryIdentifier = getUserPrimaryIdentifier(user ?? {});

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

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    navigate({ to: "/login", replace: true });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-primary-glow">{t("appShell.sprintLabel")}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{t("appShell.title")}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {t("appShell.description")}
            </p>
          </div>

          <Button variant="outline" onClick={handleSignOut}>
            {signingOut ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {t("common.signOut")}
          </Button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-4 w-4 text-primary" />
                {t("appShell.companyCardTitle")}
              </CardTitle>
              <CardDescription>{t("appShell.companyCardDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">{t("appShell.companyNameLabel")}:</span> {company?.name ?? t("common.notSet")}</p>
              <p><span className="font-medium">{t("appShell.companyTypeLabel")}:</span> {company?.company_type ?? t("common.notSet")}</p>
              <p><span className="font-medium">{t("appShell.companyIndustryLabel")}:</span> {company?.industry_category ?? t("common.notSet")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserRound className="h-4 w-4 text-primary" />
                {t("appShell.userCardTitle")}
              </CardTitle>
              <CardDescription>{t("appShell.userCardDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">{t("appShell.userIdentifierLabel")}:</span> {primaryIdentifier ?? t("common.unknown")}</p>
              <p><span className="font-medium">{t("appShell.userIdLabel")}:</span> {user?.id ?? t("common.unknown")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {t("appShell.accessCardTitle")}
              </CardTitle>
              <CardDescription>{t("appShell.accessCardDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">{t("appShell.accessRoleLabel")}:</span> {membership?.role ?? t("common.notSet")}</p>
              <p><span className="font-medium">{t("appShell.accessMembershipLabel")}:</span> {membership?.status ?? t("common.notSet")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
