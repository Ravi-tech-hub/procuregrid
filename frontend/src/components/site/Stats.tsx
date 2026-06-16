import { useTranslation } from "react-i18next";

const keys = ["suppliers", "processed", "categories", "onTime"] as const;
const values = ["12,400+", "₹840Cr", "47", "99.2%"];

export function Stats() {
  const { t } = useTranslation();
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
        {keys.map((k, i) => (
          <div key={k} className="bg-surface px-6 py-8 text-center md:py-10">
            <div className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {values[i]}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {t(`stats.${k}`)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
