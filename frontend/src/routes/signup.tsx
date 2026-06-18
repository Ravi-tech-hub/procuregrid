import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Circle, Eye, EyeOff, Factory, LoaderCircle, ShieldCheck } from "lucide-react";
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
  parseIdentifierByType,
  type AuthIdentifierType,
} from "@/lib/auth-identifiers";
import { beginPhoneAuth } from "@/lib/phone-auth";
import { defaultPhoneCountry, getPhoneCountry, phoneCountries } from "@/lib/phone-countries";
import {
  getPasswordRequirements,
  isPasswordValid,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/password-policy";
import signupImg from "@/assets/signup-procurement-illustration.svg";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, company, loading } = useAuth();
  const [accountMethod, setAccountMethod] = useState<AuthIdentifierType>("email");
  const [phoneCountry, setPhoneCountry] = useState(defaultPhoneCountry.iso2);
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedPhoneCountry = getPhoneCountry(phoneCountry);
  const passwordRequirements = getPasswordRequirements(password);
  const passwordIsValid = isPasswordValid(password);
  const passwordsMatch = password === confirmPassword;
  const parsedSignupIdentifier =
    accountMethod === "email"
      ? parseIdentifierByType("email", identifier)
      : (() => {
          const result = buildE164PhoneNumber(selectedPhoneCountry, identifier);
          return "value" in result ? { type: "phone" as const, value: result.value } : null;
        })();
  const canSubmit =
    fullName.trim().length > 0 &&
    (accountMethod === "phone" ||
      (passwordIsValid && passwordsMatch && confirmPassword.length > 0)) &&
    !submitting &&
    parsedSignupIdentifier !== null;

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
    setSubmitting(true);
    setError(null);

    let parsedIdentifier = parseIdentifierByType("email", identifier);

    if (accountMethod === "phone") {
      const phoneResult = buildE164PhoneNumber(selectedPhoneCountry, identifier);
      if (!phoneResult.value) {
        setError(phoneResult.error ?? t("authPages.signup.invalidPhone"));
        setSubmitting(false);
        return;
      }
      parsedIdentifier = { type: "phone", value: phoneResult.value };
    }

    if (!parsedIdentifier) {
      setError(
        accountMethod === "email"
          ? t("authPages.signup.invalidEmail")
          : t("authPages.signup.invalidPhone"),
      );
      setSubmitting(false);
      return;
    }

    if (parsedIdentifier.type === "email" && !passwordIsValid) {
      setError(t("authPages.signup.passwordPolicyError"));
      setSubmitting(false);
      return;
    }

    if (parsedIdentifier.type === "email" && !passwordsMatch) {
      setError(t("authPages.signup.confirmPasswordError"));
      setSubmitting(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (parsedIdentifier.type === "phone") {
      const { error: phoneAuthError } = await beginPhoneAuth({
        supabase,
        phone: parsedIdentifier.value,
        fullName,
        mode: "signup",
      });

      if (phoneAuthError) {
        setError(phoneAuthError.message);
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      navigate({
        to: "/verify-phone",
        search: {
          phone: parsedIdentifier.value,
          fullName,
          mode: "signup",
        },
        replace: true,
      });
      return;
    }

    const { error: beginEmailAuthError } = await beginEmailAuth({
      supabase,
      email: parsedIdentifier.value,
      fullName,
      password,
      mode: "signup",
    });

    if (beginEmailAuthError) {
      setError(beginEmailAuthError.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    navigate({
      to: "/verify-email",
      search: {
        email: parsedIdentifier.value,
        mode: "signup",
      },
      replace: true,
    });
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
                {t("authPages.signup.heroTitle")}
              </h1>
              <p className="mt-4 text-lg text-white/75">{t("authPages.signup.heroSubtitle")}</p>
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
                <CardTitle className="text-2xl">{t("authPages.signup.title")}</CardTitle>
                <CardDescription className="mt-2">
                  {t("authPages.signup.description")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <label className="text-sm font-medium">{t("authPages.signup.methodLabel")}</label>
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
                  {accountMethod === "phone" ? (
                    <p className="text-xs text-muted-foreground">
                      {t("authPages.signup.phoneVerificationNotice")}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="fullName">
                    {t("authPages.signup.fullNameLabel")}
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder={t("authPages.signup.fullNamePlaceholder")}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                  />
                </div>

                {accountMethod === "phone" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("authPages.signup.countryCodeLabel")}
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
                    {accountMethod === "email"
                      ? t("authPages.signup.emailLabel")
                      : t("authPages.signup.phoneLabel")}
                  </label>
                  <Input
                    id="identifier"
                    type={accountMethod === "email" ? "email" : "tel"}
                    autoComplete={accountMethod === "email" ? "email" : "tel"}
                    placeholder={
                      accountMethod === "email"
                        ? t("authPages.signup.emailPlaceholder")
                        : selectedPhoneCountry.exampleNational
                    }
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    required
                  />
                </div>

                {accountMethod === "email" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="password">
                      {t("authPages.signup.passwordLabel")}
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        minLength={PASSWORD_MIN_LENGTH}
                        maxLength={PASSWORD_MAX_LENGTH}
                        placeholder={t("authPages.signup.passwordPlaceholder")}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        aria-describedby="password-requirements"
                        aria-invalid={password.length > 0 && !passwordIsValid}
                        className="pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <label className="text-sm font-medium" htmlFor="confirmPassword">
                      {t("authPages.signup.confirmPasswordLabel")}
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        minLength={PASSWORD_MIN_LENGTH}
                        maxLength={PASSWORD_MAX_LENGTH}
                        placeholder={t("authPages.signup.confirmPasswordPlaceholder")}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
                        className="pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((current) => !current)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={
                          showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div
                      id="password-requirements"
                      className="rounded-lg border border-border bg-muted/35 p-3"
                    >
                      <p className="text-xs font-semibold text-foreground">
                        {t("authPages.signup.passwordRequirementsLabel")}
                      </p>
                      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {passwordRequirements.map((requirement) => {
                          const RequirementIcon = requirement.isMet ? Check : Circle;

                          return (
                            <li
                              key={requirement.id}
                              className={
                                requirement.isMet
                                  ? "flex items-center gap-2 text-xs text-emerald-700"
                                  : "flex items-center gap-2 text-xs text-muted-foreground"
                              }
                            >
                              <RequirementIcon className="h-3.5 w-3.5 shrink-0" />
                              {t(`authPages.signup.passwordRequirements.${requirement.id}`)}
                            </li>
                          );
                        })}
                        <li
                          className={
                            confirmPassword.length > 0 && passwordsMatch
                              ? "flex items-center gap-2 text-xs text-emerald-700"
                              : "flex items-center gap-2 text-xs text-muted-foreground"
                          }
                        >
                          {confirmPassword.length > 0 && passwordsMatch ? (
                            <Check className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 shrink-0" />
                          )}
                          {t("authPages.signup.confirmPasswordLabel")}
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : null}

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <Button className="w-full" disabled={!canSubmit} type="submit">
                  {submitting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    t("authPages.signup.submit")
                  )}
                </Button>
              </form>

              <p className="mt-6 text-sm text-muted-foreground">
                {t("authPages.signup.loginPrompt")}{" "}
                <Link
                  className="font-medium text-foreground underline underline-offset-4"
                  to="/login"
                >
                  {t("authPages.signup.loginLink")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
