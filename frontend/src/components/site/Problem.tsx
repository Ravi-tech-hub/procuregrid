import {
  FileSpreadsheet,
  MessageSquare,
  AlertTriangle,
  Clock,
  EyeOff,
  Banknote,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const pains = [
  { icon: FileSpreadsheet, k: "excel" },
  { icon: MessageSquare, k: "whatsapp" },
  { icon: AlertTriangle, k: "trust" },
  { icon: Clock, k: "payments" },
  { icon: EyeOff, k: "visibility" },
  { icon: Banknote, k: "credit" },
] as const;

export function Problem() {
  const { t } = useTranslation();
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary-glow">
            {t("problem.eyebrow")}
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
            {t("problem.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("problem.subtitle")}</p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {pains.map((p) => (
            <div key={p.k} className="group bg-card p-7 transition-colors hover:bg-surface">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold">{t(`problem.items.${p.k}.t`)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {t(`problem.items.${p.k}.d`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
