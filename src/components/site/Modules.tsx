import { BadgeCheck, Workflow, Lock, Gauge, BarChart3, Network } from "lucide-react";
import { useTranslation } from "react-i18next";

const modules = [
  { icon: BadgeCheck, k: "verification" },
  { icon: Workflow, k: "workflow" },
  { icon: Lock, k: "escrow" },
  { icon: Gauge, k: "score" },
  { icon: BarChart3, k: "analytics" },
  { icon: Network, k: "credit" },
] as const;

export function Modules() {
  const { t } = useTranslation();
  return (
    <section id="platform" className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary-glow">{t("modules.eyebrow")}</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">{t("modules.title")}</h2>
          </div>
          <p className="max-w-md text-base text-muted-foreground">{t("modules.subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div
              key={m.k}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1 hover:border-primary-glow/40 hover:shadow-[var(--shadow-lg)]"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[image:var(--gradient-accent)] opacity-0 blur-3xl transition-opacity group-hover:opacity-30" />
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground">
                  <m.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{t(`modules.items.${m.k}.t`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`modules.items.${m.k}.d`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
