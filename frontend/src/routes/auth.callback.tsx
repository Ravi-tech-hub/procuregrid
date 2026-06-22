import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Factory, LoaderCircle, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { upsertProfileForUser } from "@/lib/profile-sync";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import heroImg from "@/assets/hero-factory.jpg";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    error: typeof search.error === "string" ? search.error : "",
    error_description: typeof search.error_description === "string" ? search.error_description : "",
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { refreshMembership, refreshSession } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function completeGoogleAuth() {
      if (search.error || search.error_description) {
        setError(
          search.error_description || search.error || t("authPages.oauthCallback.errorFallback"),
        );
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const nextState = await refreshSession();
        const user = nextState.user;

        if (!user) {
          setError(t("authPages.oauthCallback.errorFallback"));
          return;
        }

        const fullName =
          (typeof user.user_metadata.full_name === "string" && user.user_metadata.full_name) ||
          (typeof user.user_metadata.name === "string" && user.user_metadata.name) ||
          null;

        if (user.email) {
          const { error: profileError } = await upsertProfileForUser(user, {
            fullName,
            authIdentifierType: "email",
            contactEmail: user.email,
            contactPhoneE164: null,
          });

          if (profileError) {
            setError(profileError.message);
            return;
          }
        }

        const membershipState = await refreshMembership();
        if (cancelled) return;

        navigate({
          to: membershipState.company ? "/app" : "/onboarding/company",
          replace: true,
        });
      } catch (nextError) {
        if (cancelled) return;
        setError(
          nextError instanceof Error
            ? nextError.message
            : t("authPages.oauthCallback.errorFallback"),
        );
      }
    }

    void completeGoogleAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate, refreshMembership, refreshSession, search.error, search.error_description, t]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[image:var(--gradient-subtle)]">
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.1fr_0.9fr]">
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
                {t("authPages.login.heroBadge")}
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight">
                {t("authPages.oauthCallback.title")}
              </h1>
              <p className="mt-4 text-lg text-white/75">
                {t("authPages.oauthCallback.description")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
          <Card className="w-full max-w-md border-border/70 bg-white/92 shadow-[var(--shadow-lg)] backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground">
                <Factory className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t("authPages.oauthCallback.title")}</CardTitle>
                <CardDescription className="mt-2">
                  {t("authPages.oauthCallback.description")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <>
                  <p className="text-sm text-destructive">{error}</p>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/login">{t("authPages.oauthCallback.backToLogin")}</Link>
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
                  <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                  {t("authPages.oauthCallback.description")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
