import { ShieldCheck, TrendingUp, FileCheck2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const features = [
  { icon: ShieldCheck, k: "f1" },
  { icon: TrendingUp, k: "f2" },
  { icon: FileCheck2, k: "f3" },
] as const;

export function TrustLayer() {
  const { t } = useTranslation();
  return (
    <section id="trust" className="relative overflow-hidden bg-[image:var(--gradient-hero)] py-24 text-primary-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,_oklch(0.55_0.18_250_/_0.4),_transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-accent">{t("trustLayer.eyebrow")}</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">{t("trustLayer.title")}</h2>
            <p className="mt-5 text-lg text-white/75">{t("trustLayer.subtitle")}</p>

            <div className="mt-10 space-y-5">
              {features.map((f) => (
                <div key={f.k} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{t(`trustLayer.${f.k}.t`)}</div>
                    <div className="text-sm text-white/70">{t(`trustLayer.${f.k}.d`)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-[image:var(--gradient-accent)] opacity-20 blur-3xl" />
            <div className="relative rounded-2xl border border-white/15 bg-white/[0.06] p-7 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/60">{t("trustLayer.card.supplier")}</div>
                  <div className="mt-1 text-lg font-semibold">{t("trustLayer.card.name")}</div>
                  <div className="text-sm text-white/60">{t("trustLayer.card.location")}</div>
                </div>
                <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
                  {t("trustLayer.card.tier")}
                </span>
              </div>

              <div className="mt-7 rounded-xl bg-black/20 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/60">{t("trustLayer.card.score")}</div>
                    <div className="mt-1 text-5xl font-bold tabular-nums">94<span className="text-2xl text-white/40">/100</span></div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-success">{t("trustLayer.card.delta")}</div>
                    <div className="text-white/60">{t("trustLayer.card.period")}</div>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[94%] rounded-full bg-[image:var(--gradient-accent)]" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  { l: t("trustLayer.card.onTime"), v: "98%" },
                  { l: t("trustLayer.card.defect"), v: "0.4%" },
                  { l: t("trustLayer.card.repeat"), v: "73%" },
                ].map((m) => (
                  <div key={m.l} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-lg font-semibold">{m.v}</div>
                    <div className="text-[11px] uppercase tracking-wider text-white/60">{m.l}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm">
                <span className="font-semibold text-accent">{t("trustLayer.card.escrowLabel")}</span>{" "}
                <span className="text-white/85">{t("trustLayer.card.escrowValue")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
