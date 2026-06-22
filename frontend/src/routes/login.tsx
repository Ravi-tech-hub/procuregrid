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
import { beginEmailAuth } from "@/lib/email-auth";
import {
  buildE164PhoneNumber,
  EMAIL_PATTERN,
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
  const { user, company, loading } = useAuth();
  const [accountMethod, setAccountMethod] = useState<AuthIdentifierType>("email");
  const [phoneCountry, setPhoneCountry] = useState(defaultPhoneCountry.iso2);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitStage, setSubmitStage] = useState<string | null>(null);
  const parsedLoginIdentifier =
    accountMethod === "email"
      ? parseIdentifierByType("email", identifier)
      : { type: "phone" as const };
  const canSubmit =
    identifier.trim().length > 0 &&
    parsedLoginIdentifier !== null &&
    (accountMethod === "phone" || password.length > 0) &&
    !submitting &&
    !googleSubmitting;

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

  async function handleGoogleSignIn() {
    setGoogleSubmitting(true);
    setError(null);
    setSubmitStage(t("authPages.login.stageRedirectingGoogle"));

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "email profile",
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setSubmitStage(null);
        setGoogleSubmitting(false);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Google sign-in failed.");
      setSubmitStage(null);
      setGoogleSubmitting(false);
    }
  }

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
        "Login account lookup is not configured in Supabase. Run database/login-identifier-lookup.sql.",
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
      let parsedIdentifier = parseIdentifierByType("email", identifier);

      if (accountMethod === "phone") {
        const phoneResult = buildE164PhoneNumber(getPhoneCountry(phoneCountry), identifier);
        if (!phoneResult.value) {
          setError(phoneResult.error ?? t("authPages.login.invalidIdentifier"));
          shouldClearStage = true;
          return;
        }
        parsedIdentifier = { type: "phone", value: phoneResult.value };
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
            fullName: "",
            mode: "login",
          },
          replace: true,
        });
        return;
      }

      const { error: beginEmailAuthError } = await beginEmailAuth({
        supabase,
        email: parsedIdentifier.value,
        password,
        mode: "login",
      });

      if (beginEmailAuthError) {
        setError(t("authPages.login.wrongPassword"));
        shouldClearStage = true;
        return;
      }

      navigate({
        to: "/verify-email",
        search: {
          email: parsedIdentifier.value,
          mode: "login",
        },
        replace: true,
      });
      return;
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

        <div className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
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
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">{t("authPages.login.socialLabel")}</label>
                  <Button
                    className="w-full"
                    disabled={submitting || googleSubmitting}
                    onClick={handleGoogleSignIn}
                    type="button"
                    variant="outline"
                  >
                    {googleSubmitting ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21.805 10.023h-9.81v3.955h5.627c-.243 1.274-.97 2.353-2.06 3.079v2.56h3.333c1.95-1.796 3.077-4.445 3.077-7.594 0-.67-.06-1.315-.167-1.944Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M11.995 22c2.79 0 5.13-.925 6.84-2.505l-3.333-2.56c-.926.62-2.11.986-3.507.986-2.696 0-4.98-1.821-5.797-4.27H2.753v2.642A10.33 10.33 0 0 0 11.995 22Z"
                          fill="#34A853"
                        />
                        <path
                          d="M6.198 13.651a6.197 6.197 0 0 1 0-3.945V7.064H2.753a10.329 10.329 0 0 0 0 9.23l3.445-2.643Z"
                          fill="#FBBC04"
                        />
                        <path
                          d="M11.995 6.079c1.518 0 2.88.523 3.95 1.548l2.963-2.963C17.12 2.999 14.784 2 11.995 2a10.33 10.33 0 0 0-9.242 5.064l3.445 2.642c.816-2.45 3.1-4.27 5.797-4.27Z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                    {t("authPages.login.googleButton")}
                  </Button>
                </div>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/70" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
                    <span className="bg-white px-3 text-muted-foreground">
                      {t("authPages.login.dividerLabel")}
                    </span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      {t("authPages.login.methodLabel")}
                    </label>
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
                      pattern={accountMethod === "email" ? EMAIL_PATTERN : undefined}
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
                      <div className="text-right">
                        <Link
                          className="text-sm font-medium text-foreground underline underline-offset-4"
                          to="/forgot-password"
                        >
                          {t("authPages.login.forgotPasswordLink")}
                        </Link>
                      </div>
                    </div>
                  ) : null}

                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  {(submitting || googleSubmitting) && submitStage ? (
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
              </div>

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
