import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  Factory,
  LogOut,
  Menu,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  buyerNavItems,
  supplierNavItems,
  type WorkspaceMode,
  type WorkspaceNavItem,
} from "@/components/app/workspace-data";

export function AppWorkspaceShell({
  mode,
  activeSection,
  onSectionChange,
  onModeChange,
  children,
}: {
  mode: WorkspaceMode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onModeChange?: (mode: WorkspaceMode) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, company, membership, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navItems = mode === "buyer" ? buyerNavItems : supplierNavItems;
  const displayName =
    user?.user_metadata.full_name ||
    user?.email?.split("@")[0] ||
    user?.phone ||
    t("workspace.shell.account");

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login", replace: true });
  }

  function selectSection(item: WorkspaceNavItem) {
    onSectionChange(item.id);
    setMobileOpen(false);
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-[#071d35] text-white">
      <div className="flex h-17 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2b84b] text-[#071d35]">
          <Factory className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold tracking-tight">ProcureGrid</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            {t(`workspace.shell.${mode}Workspace`)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="iconSm"
          className="ml-auto text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
          aria-label={t("workspace.shell.closeNavigation")}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = activeSection === item.id;

          return (
            <Button
              key={item.id}
              type="button"
              onClick={() => selectSection(item)}
              variant="ghost"
              className={cn(
                "h-auto w-full justify-start gap-3 px-3 py-2.5 text-left text-sm font-medium",
                selected
                  ? "bg-[#123d69] text-white shadow-[inset_3px_0_0_#f2b84b]"
                  : "text-white/68 hover:bg-white/7 hover:text-white",
              )}
            >
              <Icon className={cn("h-4 w-4", selected && "text-[#f2b84b]")} />
              <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
              {item.badge ? (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                  {item.badge}
                </span>
              ) : null}
            </Button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-3 px-3 py-2.5 text-sm text-white/65 hover:bg-white/7 hover:text-white"
          type="button"
        >
          <CircleHelp className="h-4 w-4" />
          {t("workspace.shell.helpSupport")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#14243a]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#071d35]/45 backdrop-blur-sm"
            aria-label={t("workspace.shell.closeNavigation")}
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[min(19rem,88vw)] shadow-2xl">{sidebar}</aside>
        </div>
      ) : null}

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-17 items-center gap-3 border-b border-[#dce4ee] bg-white/94 px-4 backdrop-blur md:px-6">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="border-[#dce4ee] text-[#38506c] lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t("workspace.shell.openNavigation")}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden items-center gap-2 rounded-lg border border-[#dce4ee] bg-[#f8fafc] px-3 py-2 text-xs font-medium text-[#4f6279] sm:flex">
            <Building2 className="h-4 w-4 text-[#1d5b91]" />
            <span className="max-w-32 truncate">
              {company?.name ?? t("workspace.shell.company")}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[#8290a2]" />
          </div>

          <div className="relative mx-auto hidden max-w-2xl flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b9aae]" />
            <Input
              className="border-[#dce4ee] bg-[#f8fafc] pl-10 pr-4 placeholder:text-[#9aa8b8] focus-visible:border-[#1d5b91] focus-visible:bg-white focus-visible:ring-[#1d5b91]/10"
              placeholder={
                mode === "buyer"
                  ? t("workspace.shell.searchBuyer")
                  : t("workspace.shell.searchSupplier")
              }
            />
          </div>

          {onModeChange ? (
            <div className="hidden rounded-lg bg-[#edf3f9] p-1 xl:flex">
              {(["buyer", "supplier"] as WorkspaceMode[]).map((workspace) => (
                <Button
                  key={workspace}
                  type="button"
                  onClick={() => onModeChange(workspace)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "capitalize",
                    mode === workspace
                      ? "bg-white text-[#0b3158] shadow-sm"
                      : "text-[#6b7d90] hover:text-[#0b3158]",
                  )}
                >
                  {t(`workspace.shell.${workspace}`)}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative text-[#41566d]"
            aria-label={t("workspace.shell.notifications")}
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#e9a72d] ring-2 ring-white" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 gap-2 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b3158] text-xs font-bold text-white">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="max-w-28 truncate text-xs font-semibold text-[#17283d]">
                    {displayName}
                  </p>
                  <p className="text-[10px] capitalize text-[#78889a]">
                    {membership?.role
                      ? t(`workspace.roles.${membership.role}`)
                      : t(`workspace.shell.${mode}Account`)}
                  </p>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-[#8795a7] sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <span className="block truncate">{displayName}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {user?.email ?? user?.phone}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onSectionChange("settings")}>
                <Settings2 className="h-4 w-4" />
                {t("workspace.shell.workspaceSettings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void handleSignOut()} className="text-destructive">
                <LogOut className="h-4 w-4" />
                {t("common.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="min-h-[calc(100vh-4.25rem)] min-w-0 overflow-x-hidden px-3 py-4 sm:px-4 md:p-6 xl:p-7">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>

      <Modal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title={t("workspace.shell.notifications")}
        footer={
          <Button variant="outline" onClick={() => setNotificationsOpen(false)}>
            {t("common.close", { defaultValue: "Close" })}
          </Button>
        }
      >
        <div className="rounded-xl border border-dashed border-[#ced9e5] bg-[#f8fafc] px-5 py-8 text-center">
          <Bell className="mx-auto h-7 w-7 text-[#6f8298]" />
          <p className="mt-3 text-sm font-semibold text-[#273b52]">
            {t("workspace.shell.notifications")}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#7b8b9d]">
            {t("workspace.placeholder.recentActivity")}
          </p>
        </div>
      </Modal>
    </div>
  );
}
