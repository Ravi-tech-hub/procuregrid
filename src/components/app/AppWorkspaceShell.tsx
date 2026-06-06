import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  Factory,
  Globe2,
  LogOut,
  Menu,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const navigate = useNavigate();
  const { user, company, membership, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = mode === "buyer" ? buyerNavItems : supplierNavItems;
  const displayName =
    user?.user_metadata.full_name || user?.email?.split("@")[0] || user?.phone || "Account";

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
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">{mode} workspace</p>
        </div>
        <button
          className="ml-auto rounded-md p-1.5 text-white/70 hover:bg-white/10 lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectSection(item)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition",
                selected
                  ? "bg-[#123d69] text-white shadow-[inset_3px_0_0_#f2b84b]"
                  : "text-white/68 hover:bg-white/7 hover:text-white",
              )}
            >
              <Icon className={cn("h-4 w-4", selected && "text-[#f2b84b]")} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 hover:bg-white/7 hover:text-white"
          type="button"
        >
          <CircleHelp className="h-4 w-4" />
          Help & Support
        </button>
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
            aria-label="Close navigation overlay"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[min(19rem,88vw)] shadow-2xl">{sidebar}</aside>
        </div>
      ) : null}

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-17 items-center gap-3 border-b border-[#dce4ee] bg-white/94 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            className="rounded-lg border border-[#dce4ee] p-2 text-[#38506c] lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 rounded-lg border border-[#dce4ee] bg-[#f8fafc] px-3 py-2 text-xs font-medium text-[#4f6279] sm:flex">
            <Building2 className="h-4 w-4 text-[#1d5b91]" />
            <span className="max-w-32 truncate">{company?.name ?? "Company"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#8290a2]" />
          </div>

          <div className="relative mx-auto hidden max-w-2xl flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b9aae]" />
            <input
              className="h-10 w-full rounded-lg border border-[#dce4ee] bg-[#f8fafc] pl-10 pr-4 text-sm outline-none transition placeholder:text-[#9aa8b8] focus:border-[#1d5b91] focus:bg-white focus:ring-3 focus:ring-[#1d5b91]/10"
              placeholder={
                mode === "buyer"
                  ? "Search RFQs, suppliers, POs, invoices..."
                  : "Search RFQs, orders, products, buyers..."
              }
            />
          </div>

          {onModeChange ? (
            <div className="hidden rounded-lg bg-[#edf3f9] p-1 xl:flex">
              {(["buyer", "supplier"] as WorkspaceMode[]).map((workspace) => (
                <button
                  key={workspace}
                  type="button"
                  onClick={() => onModeChange(workspace)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition",
                    mode === workspace
                      ? "bg-white text-[#0b3158] shadow-sm"
                      : "text-[#6b7d90] hover:text-[#0b3158]",
                  )}
                >
                  {workspace}
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            className="hidden items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#41566d] hover:bg-[#f1f5f9] sm:flex"
          >
            <Globe2 className="h-4 w-4" />
            EN
          </button>

          <button
            type="button"
            className="relative rounded-lg p-2 text-[#41566d] hover:bg-[#f1f5f9]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#e9a72d] ring-2 ring-white" />
          </button>

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
                    {membership?.role?.replaceAll("_", " ") ?? `${mode} account`}
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
                Workspace settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void handleSignOut()} className="text-destructive">
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="min-h-[calc(100vh-4.25rem)] min-w-0 overflow-x-hidden p-4 md:p-6 xl:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
