import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Factory } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <Factory className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">ProcureGrid</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#platform" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{t("nav.platform")}</a>
          <a href="/#workflow" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{t("nav.workflow")}</a>
          <a href="/#trust" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{t("nav.trust")}</a>
          <a href="/#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{t("nav.pricing")}</a>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">{t("nav.signIn")}</Link>
          </Button>
          <Button asChild size="sm" className="bg-foreground text-background hover:bg-foreground/90">
            <Link to="/signup">{t("nav.requestDemo")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
