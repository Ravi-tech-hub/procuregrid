import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Factory, LoaderCircle, ShieldCheck } from "lucide-react";
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
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  buildE164PhoneNumber,
  parseIdentifierByType,
  type AuthIdentifierType,
} from "@/lib/auth-identifiers";
import { beginPhoneAuth } from "@/lib/phone-auth";
import { defaultPhoneCountry, getPhoneCountry, phoneCountries } from "@/lib/phone-countries";
import heroImg from "@/assets/hero-factory.jpg";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, company, loading, refreshSession } = useAuth();
  const [accountMethod, setAccountMethod] = useState<AuthIdentifierType>("email");
  const [phoneCountry, setPhoneCountry] = useState(defaultPhoneCountry.iso2);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitStage, setSubmitStage] = useState<string | null>(null);
  const canSubmit =
    identifier.trim().length > 0 &&
    (accountMethod === "phone" || password.length > 0) &&
    !submitting;

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

  async function doesProfileExist(
    identifier: { type: "email"; value: string } | { type: "phone"; value: string },
  ) {
    const supabase = getSupabaseBrowserClient();

    const { data, error: lookupError } = await supabase.rpc("login_identifier_exists", {
      p_identifier_type: identifier.type,
      p_identifier_value: identifier.value,
    });

    if (lookupError) {
      throw new Error(
        "Login account lookup is not configured in Supabase. Run docs/supabase/login-identifier-lookup.sql.",
      );
    }

    return data === true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSubmitStage(t("authPages.login.stageSigningIn"));
    let shouldClearStage = false;

    try {
      const parsedIdentifier =
        accountMethod === "email"
          ? parseIdentifierByType("email", identifier)
          : (() => {
              const result = buildE164PhoneNumber(getPhoneCountry(phoneCountry), identifier);
              return "value" in result ? { type: "phone" as const, value: result.value } : result;
            })();

      if (accountMethod === "phone" && parsedIdentifier && "error" in parsedIdentifier) {
        setError(parsedIdentifier.error);
        shouldClearStage = true;
        return;
      }

      if (!parsedIdentifier) {
        setError(
          accountMethod === "email"
            ? t("authPages.signup.invalidEmail")
            : t("authPages.login.invalidIdentifier"),
        );
        shouldClearStage = true;
        return;
      }

      const profileExists = await doesProfileExist(parsedIdentifier);

      if (!profileExists) {
        setError(
          parsedIdentifier.type === "email"
            ? t("authPages.login.emailNotFound")
            : t("authPages.login.phoneNotFound"),
        );
        shouldClearStage = true;
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (parsedIdentifier.type === "phone") {
        const { error: phoneAuthError } = await beginPhoneAuth({
          supabase,
          phone: parsedIdentifier.value,
          mode: "login",
        });

        if (phoneAuthError) {
          setError(phoneAuthError.message);
          shouldClearStage = true;
          return;
        }

        navigate({
          to: "/verify-phone",
          search: {
            phone: parsedIdentifier.value,
            mode: "login",
          },
          replace: true,
        });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: parsedIdentifier.value,
        password,
      });

      if (signInError) {
        setError(t("authPages.login.wrongPassword"));
        shouldClearStage = true;
        return;
      }

      setSubmitStage(t("authPages.login.stageLoadingWorkspace"));
      const nextState = await refreshSession();

      if (nextState.user) {
        setSubmitStage(t("authPages.login.stageLoadingWorkspaceDetails"));
        return;
      }

      setError(t("authPages.login.missingSession"));
      shouldClearStage = true;
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Unknown sign-in error";
      setError(message);
      shouldClearStage = true;
    } finally {
      setSubmitting(false);
      if (shouldClearStage) {
        setSubmitStage(null);
      }
    }
  }

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
                {t("authPages.login.heroTitle")}
              </h1>
              <p className="mt-4 text-lg text-white/75">{t("authPages.login.heroSubtitle")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 lg:px-10">
          <Card className="w-full max-w-md border-border/70 bg-white/92 shadow-[var(--shadow-lg)] backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground">
                <Factory className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t("authPages.login.title")}</CardTitle>
                <CardDescription className="mt-2">
                  {t("authPages.login.description")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <label className="text-sm font-medium">{t("authPages.login.methodLabel")}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={accountMethod === "email" ? "default" : "outline"}
                      onClick={() => setAccountMethod("email")}
                    >
                      {t("common.email")}
                    </Button>
                    <Button
                      type="button"
                      variant={accountMethod === "phone" ? "default" : "outline"}
                      onClick={() => setAccountMethod("phone")}
                    >
                      {t("common.phone")}
                    </Button>
                  </div>
                </div>

                {accountMethod === "phone" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("authPages.login.countryCodeLabel")}
                    </label>
                    <Select value={phoneCountry} onValueChange={setPhoneCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {phoneCountries.map((country) => (
                          <SelectItem key={country.iso2} value={country.iso2}>
                            {country.name} (+{country.dialCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="identifier">
                    {accountMethod === "email" ? t("common.email") : t("common.phone")}
                  </label>
                  <Input
                    id="identifier"
                    type={accountMethod === "email" ? "email" : "tel"}
                    autoComplete={accountMethod === "email" ? "username" : "tel"}
                    placeholder={
                      accountMethod === "email"
                        ? t("authPages.login.identifierPlaceholder")
                        : getPhoneCountry(phoneCountry).exampleNational
                    }
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    required
                  />
                </div>

                {accountMethod === "email" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="password">
                      {t("authPages.login.passwordLabel")}
                    </label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder={t("authPages.login.passwordPlaceholder")}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                ) : null}

                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                {submitting && submitStage ? (
                  <p className="text-sm text-muted-foreground">{submitStage}</p>
                ) : null}

                <Button className="w-full" disabled={!canSubmit} type="submit">
                  {submitting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    t("authPages.login.submit")
                  )}
                </Button>
              </form>

              <p className="mt-6 text-sm text-muted-foreground">
                {t("authPages.login.signupPrompt")}{" "}
                <Link
                  className="font-medium text-foreground underline underline-offset-4"
                  to="/signup"
                >
                  {t("authPages.login.signupLink")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
