import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LoaderCircle, ShieldCheck, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { normalizePhoneNumber } from "@/lib/auth-identifiers";
import { completePhoneSignup, isManualPhoneAuthEnabled, verifyPhoneAuth } from "@/lib/phone-auth";
import { upsertProfileForUser } from "@/lib/profile-sync";
import signupImg from "@/assets/signup-procurement-illustration.svg";

export const Route = createFileRoute("/verify-phone")({
  validateSearch: (search: Record<string, unknown>) => ({
    phone: typeof search.phone === "string" ? search.phone : "",
    fullName: typeof search.fullName === "string" ? search.fullName : "",
    mode: search.mode === "login" ? ("login" as const) : ("signup" as const),
  }),
  component: VerifyPhonePage,
});

function VerifyPhonePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { phone, fullName, mode } = Route.useSearch();
  const { user, company, loading, refreshSession } = useAuth();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalizedPhone = normalizePhoneNumber(phone);
  const canSubmit = code.trim().length === 6 && !submitting;

  useEffect(() => {
    if (loading) return;
    if (user && company) {
      navigate({ to: "/app", replace: true });
      return;
    }
    if (user && !company) {
      navigate({ to: "/onboarding/company", replace: true });
    }
  }, [company, loading, navigate, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedPhone) {
      setError(t("authPages.verifyPhone.missingPhone"));
      return;
    }

    if (!/^\d{6}$/.test(code.trim())) {
      setError(t("authPages.verifyPhone.invalidCode"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: verifyError } = await verifyPhoneAuth({
        supabase,
        phone: normalizedPhone,
        code: code.trim(),
        mode,
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      if (mode === "signup" && isManualPhoneAuthEnabled()) {
        const { error: completeSignupError } = await completePhoneSignup({
          supabase,
          phone: normalizedPhone,
          fullName,
        });

        if (completeSignupError) {
          setError(completeSignupError.message);
          return;
        }
      }

      const nextState = await refreshSession();
      if (nextState.user) {
        const { error: profileError } = await upsertProfileForUser(nextState.user, {
          fullName: fullName || nextState.user.user_metadata.full_name || null,
          authIdentifierType: "phone",
          contactEmail: null,
          contactPhoneE164: normalizedPhone,
        });

        if (profileError) {
          setError(profileError.message);
          return;
        }

        navigate({ to: "/onboarding/company", replace: true });
        return;
      }

      setError(t("authPages.login.missingSession"));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unknown verification error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[image:var(--gradient-subtle)]">
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative hidden overflow-hidden lg:block">
          <img
            src={signupImg}
            alt="Procurement analytics and supplier onboarding illustration"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.18_0.06_255_/_0.76)] via-[oklch(0.22_0.08_255_/_0.58)] to-[oklch(0.32_0.12_250_/_0.42)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.55_0.18_250_/_0.18),_transparent_58%)]" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                {t("authPages.signup.heroBadge")}
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight">
                {t("authPages.verifyPhone.title")}
              </h1>
              <p className="mt-4 text-lg text-white/75">{t("authPages.verifyPhone.description")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
          <Card className="w-full max-w-md border-border/70 bg-white/92 shadow-[var(--shadow-lg)] backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t("authPages.verifyPhone.title")}</CardTitle>
                <CardDescription className="mt-2">
                  {t("authPages.verifyPhone.description")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="code">
                    {t("authPages.verifyPhone.codeLabel")}
                  </label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={t("authPages.verifyPhone.codePlaceholder")}
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    required
                  />
                </div>

                {normalizedPhone ? (
                  <p className="text-sm text-muted-foreground">{normalizedPhone}</p>
                ) : null}
                {isManualPhoneAuthEnabled() ? (
                  <p className="text-sm text-muted-foreground">
                    Temporary manual OTP is enabled for phone authentication.
                  </p>
                ) : null}
                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <Button className="w-full" disabled={!canSubmit} type="submit">
                  {submitting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    t("authPages.verifyPhone.submit")
                  )}
                </Button>
              </form>

              <p className="mt-6 text-sm text-muted-foreground">
                <Link
                  className="font-medium text-foreground underline underline-offset-4"
                  to={mode === "login" ? "/login" : "/signup"}
                >
                  {mode === "login"
                    ? t("authPages.verifyPhone.backToLogin", { defaultValue: "Back to sign in" })
                    : t("authPages.verifyPhone.backToSignup")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
