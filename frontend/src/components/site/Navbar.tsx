import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  ChevronDown,
  Factory,
  LogOut,
  Menu,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, company, signOut } = useAuth();
  const homeTarget = user ? (company ? "/app" : "/onboarding/company") : "/";

  if (pathname === "/app" || pathname.startsWith("/app/")) {
    return null;
  }

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to={homeTarget} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <Factory className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">ProcureGrid</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="/#platform"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nav.platform")}
          </a>
          <a
            href="/#workflow"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nav.workflow")}
          </a>
          <a
            href="/#trust"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nav.trust")}
          </a>
          <a
            href="/#pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nav.pricing")}
          </a>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          {!user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label={t("workspace.shell.openNavigation")}
                >
                  <Menu />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 md:hidden">
                {[
                  ["platform", t("nav.platform")],
                  ["workflow", t("nav.workflow")],
                  ["trust", t("nav.trust")],
                  ["pricing", t("nav.pricing")],
                ].map(([id, label]) => (
                  <DropdownMenuItem key={id} asChild>
                    <a href={`/#${id}`}>{label}</a>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/login">{t("nav.signIn")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/signup">{t("nav.requestDemo")}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {t("workspace.shell.account")}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings2 className="h-4 w-4" />
                    {t("workspace.pages.settings.title")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/preferences">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t("workspace.pages.preferences.title")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/statistics">
                    <BarChart3 className="h-4 w-4" />
                    {t("workspace.pages.statistics.title")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void handleSignOut()}>
                  <LogOut className="h-4 w-4" />
                  {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">{t("nav.signIn")}</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden bg-foreground text-background hover:bg-foreground/90 sm:inline-flex"
              >
                <Link to="/signup">{t("nav.requestDemo")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
