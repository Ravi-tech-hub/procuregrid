import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import heroImg from "@/assets/hero-factory.jpg";

export function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Indian manufacturing factory floor with CNC machines"
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.18_0.06_255_/_0.85)] via-[oklch(0.22_0.08_255_/_0.7)] to-[oklch(0.32_0.12_250_/_0.55)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.55_0.18_250_/_0.25),_transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            {t("hero.badge")}
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            {t("hero.title1")} <br />
            <span className="bg-gradient-to-r from-accent to-[oklch(0.9_0.14_85)] bg-clip-text text-transparent">
              {t("hero.title2")}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">
            {t("hero.subtitle")}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground shadow-[var(--shadow-lg)] hover:bg-accent/90"
            >
              {t("hero.startSourcing")}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/25 bg-white/5 text-white backdrop-blur hover:bg-white/10 hover:text-white"
            >
              {t("hero.listSupplier")}
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-white/70">
            {(["trust1", "trust2", "trust3"] as const).map((k) => (
              <div key={k} className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                {t(`hero.${k}`)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
