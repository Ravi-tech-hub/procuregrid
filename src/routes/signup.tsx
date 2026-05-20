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
import { buildE164PhoneNumber, parseIdentifierByType, type AuthIdentifierType } from "@/lib/auth-identifiers";
import { defaultPhoneCountry, getPhoneCountry, phoneCountries } from "@/lib/phone-countries";
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedPhoneCountry = getPhoneCountry(phoneCountry);
  const parsedSignupIdentifier =
    accountMethod === "email"
      ? parseIdentifierByType("email", identifier)
      : (() => {
          const result = buildE164PhoneNumber(selectedPhoneCountry, identifier);
          return "value" in result ? { type: "phone" as const, value: result.value } : null;
        })();
  const canSubmit =
    fullName.trim().length > 0 &&
    password.length >= 8 &&
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

    const parsedIdentifier =
      accountMethod === "email"
        ? parseIdentifierByType("email", identifier)
        : (() => {
            const result = buildE164PhoneNumber(selectedPhoneCountry, identifier);
            return "value" in result ? { type: "phone" as const, value: result.value } : result;
          })();

    if (accountMethod === "phone" && parsedIdentifier && "error" in parsedIdentifier) {
      setError(parsedIdentifier.error);
      setSubmitting(false);
      return;
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

    const supabase = getSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      ...(parsedIdentifier.type === "email"
        ? { email: parsedIdentifier.value }
        : { phone: parsedIdentifier.value }),
      password,
      options: {
        data: {
          full_name: fullName,
        },
        ...(parsedIdentifier.type === "phone" ? { channel: "sms" as const } : {}),
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    const nextUser = data.user;
    if (nextUser) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: nextUser.id,
        full_name: fullName,
        auth_identifier_type: parsedIdentifier.type,
        contact_email: parsedIdentifier.type === "email" ? parsedIdentifier.value : null,
        contact_phone_e164: parsedIdentifier.type === "phone" ? parsedIdentifier.value : null,
      });

      if (profileError) {
        setError(profileError.message);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);

    if (!data.session) {
      if (parsedIdentifier.type === "phone") {
        navigate({
          to: "/verify-phone",
          search: { phone: parsedIdentifier.value },
          replace: true,
        });
        return;
      }

      setError(t("authPages.signup.checkEmailNotice"));
      return;
    }

    navigate({ to: "/onboarding/company", replace: true });
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
              <p className="mt-4 text-lg text-white/75">
                {t("authPages.signup.heroSubtitle")}
              </p>
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
                    <p className="text-xs text-muted-foreground">{t("authPages.signup.phoneVerificationNotice")}</p>
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
                    <label className="text-sm font-medium">{t("authPages.signup.countryCodeLabel")}</label>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    {t("authPages.signup.passwordLabel")}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    placeholder={t("authPages.signup.passwordPlaceholder")}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <Button className="w-full" disabled={!canSubmit} type="submit">
                  {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : t("authPages.signup.submit")}
                </Button>
              </form>

              <p className="mt-6 text-sm text-muted-foreground">
                {t("authPages.signup.loginPrompt")}{" "}
                <Link className="font-medium text-foreground underline underline-offset-4" to="/login">
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
