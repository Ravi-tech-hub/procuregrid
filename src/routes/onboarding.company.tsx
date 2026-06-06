import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, LoaderCircle, LogOut, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import heroImg from "@/assets/hero-factory.jpg";

export const Route = createFileRoute("/onboarding/company")({
  component: CompanyOnboardingPage,
});

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(message));
    }, ms);

    promise
      .then((value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
  });
}

function CompanyOnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, company, loading, refreshMembership, signOut } = useAuth();
  const [name, setName] = useState("");
  const [companyType, setCompanyType] = useState<"buyer" | "supplier" | "hybrid">("buyer");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [industryCategory, setIndustryCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitStage, setSubmitStage] = useState<string | null>(null);
  const canSubmit = !!user && name.trim().length > 0 && !submitting;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (company) {
      navigate({ to: "/app", replace: true });
    }
  }, [company, loading, navigate, user]);

  async function createCompanyViaRpc() {
    const supabase = getSupabaseBrowserClient();
    const { error } = await withTimeout(
      supabase.rpc("create_company_with_owner", {
        p_name: name,
        p_company_type: companyType,
        p_industry_category: industryCategory || null,
        p_gst_number: gstNumber || null,
        p_pan_number: panNumber || null,
      }),
      15000,
      "Company creation timed out after 15 seconds.",
    );

    return { error };
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    navigate({ to: "/login", replace: true });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setError(t("authPages.onboarding.userRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    setSubmitStage(t("authPages.onboarding.stagePreparing"));
    let shouldClearStage = false;

    try {
      setSubmitStage(t("authPages.onboarding.stageConnecting"));
      setSubmitStage(t("authPages.onboarding.stageCreating"));
      const creationResult = await createCompanyViaRpc();

      if (creationResult.error) {
        if (
          creationResult.error.message?.includes(
            "Could not find the function public.create_company_with_owner",
          )
        ) {
          setError(
            "Company creation is not configured in Supabase. Create the public.create_company_with_owner(...) RPC first.",
          );
        } else if (creationResult.error.message?.includes("company_memberships_role_check")) {
          setError(
            "Company creation failed because the Supabase membership roles are outdated. Run docs/supabase/fix-membership-role-constraint.sql in the Supabase SQL Editor, then try again.",
          );
        } else {
          setError(`Company creation failed: ${creationResult.error.message}`);
        }
        shouldClearStage = true;
        return;
      }

      setSubmitStage(t("authPages.onboarding.stageRefreshing"));
      await refreshMembership();
      setSubmitStage(t("authPages.onboarding.stageRedirecting"));
      navigate({ to: "/app", replace: true });
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Unknown onboarding error";
      setError(`Unexpected onboarding error: ${message}`);
      shouldClearStage = true;
    } finally {
      setSubmitting(false);
      if (shouldClearStage) {
        setSubmitStage(null);
      }
    }
  }

  if (loading || (!!user && company)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-subtle)]">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/80 px-5 py-4 shadow-[var(--shadow-md)] backdrop-blur">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            {t("authPages.onboarding.checkingWorkspace")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[image:var(--gradient-subtle)]">
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden lg:block">
          <img
            src={heroImg}
            alt="Indian manufacturing factory floor with CNC machines"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.18_0.06_255_/_0.88)] via-[oklch(0.22_0.08_255_/_0.74)] to-[oklch(0.32_0.12_250_/_0.52)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.55_0.18_250_/_0.22),_transparent_60%)]" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                {t("authPages.onboarding.heroBadge")}
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight">
                {t("authPages.onboarding.heroTitle")}
              </h1>
              <p className="mt-4 text-lg text-white/75">{t("authPages.onboarding.heroSubtitle")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 lg:px-10">
          <Card className="w-full max-w-2xl border-border/70 bg-white/92 shadow-[var(--shadow-lg)] backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t("authPages.onboarding.title")}</CardTitle>
                <CardDescription className="mt-2">
                  {t("authPages.onboarding.description")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex justify-end">
                <Button variant="outline" onClick={handleSignOut} type="button">
                  {signingOut ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  {t("common.signOut")}
                </Button>
              </div>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium" htmlFor="companyName">
                    {t("authPages.onboarding.companyNameLabel")}
                  </label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder={t("authPages.onboarding.companyNamePlaceholder")}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("authPages.onboarding.companyTypeLabel")}
                  </label>
                  <Select
                    value={companyType}
                    onValueChange={(value) => setCompanyType(value as typeof companyType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("authPages.onboarding.companyTypePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">
                        {t("authPages.onboarding.companyTypeBuyer")}
                      </SelectItem>
                      <SelectItem value="supplier">
                        {t("authPages.onboarding.companyTypeSupplier")}
                      </SelectItem>
                      <SelectItem value="hybrid">
                        {t("authPages.onboarding.companyTypeHybrid")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="industryCategory">
                    {t("authPages.onboarding.industryCategoryLabel")}
                  </label>
                  <Input
                    id="industryCategory"
                    type="text"
                    placeholder={t("authPages.onboarding.industryCategoryPlaceholder")}
                    value={industryCategory}
                    onChange={(event) => setIndustryCategory(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="gstNumber">
                    {t("authPages.onboarding.gstLabel")}
                  </label>
                  <Input
                    id="gstNumber"
                    type="text"
                    placeholder={t("authPages.onboarding.gstPlaceholder")}
                    value={gstNumber}
                    onChange={(event) => setGstNumber(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="panNumber">
                    {t("authPages.onboarding.panLabel")}
                  </label>
                  <Input
                    id="panNumber"
                    type="text"
                    placeholder={t("authPages.onboarding.panPlaceholder")}
                    value={panNumber}
                    onChange={(event) => setPanNumber(event.target.value)}
                  />
                </div>

                {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
                {submitting && submitStage ? (
                  <p className="text-sm text-muted-foreground md:col-span-2">{submitStage}</p>
                ) : null}

                <div className="md:col-span-2">
                  <Button className="w-full md:w-auto" disabled={!canSubmit} type="submit">
                    {submitting ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      t("authPages.onboarding.submit")
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
