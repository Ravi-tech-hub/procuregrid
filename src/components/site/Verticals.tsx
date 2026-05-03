import { useTranslation } from "react-i18next";

export function Verticals() {
  const { t } = useTranslation();
  const items = t("verticals.items", { returnObjects: true }) as string[];
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary-glow">{t("verticals.eyebrow")}</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{t("verticals.title")}</h2>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {items.map((v) => (
            <span
              key={v}
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-primary-glow/40 hover:shadow-[var(--shadow-md)]"
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
