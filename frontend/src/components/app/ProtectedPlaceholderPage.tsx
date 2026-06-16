import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LoaderCircle, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export function ProtectedPlaceholderPage({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, company, loading } = useAuth();

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Card className="border-border/70 shadow-[var(--shadow-lg)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Icon className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("workspace.placeholder.protectedDescription")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
