import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const stepKeys = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;
const numbers = ["01", "02", "03", "04", "05", "06"];

export function Workflow() {
  const { t } = useTranslation();
  return (
    <section id="workflow" className="relative overflow-hidden bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary-glow">
            {t("workflow.eyebrow")}
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
            {t("workflow.title")}
          </h2>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stepKeys.map((k, i) => (
            <div
              key={k}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-mono font-semibold text-primary-glow">
                  {numbers[i]}
                </span>
                {i < stepKeys.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold">{t(`workflow.steps.${k}.t`)}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t(`workflow.steps.${k}.d`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
