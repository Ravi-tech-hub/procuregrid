import { Link } from "@tanstack/react-router";
import { Factory } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  const pl = t("footer.platformLinks", { returnObjects: true });
  const cl = t("footer.companyLinks", { returnObjects: true });
  const platformLinks = Array.isArray(pl) ? (pl as string[]) : [];
  const companyLinks = Array.isArray(cl) ? (cl as string[]) : [];

  const cols = [
    { h: t("footer.platform"), l: platformLinks },
    { h: t("footer.company"), l: companyLinks },
  ];

  return (
    <footer className="border-t border-[#1d3148] bg-[#0f2237] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
                <Factory className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">ProcureGrid</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-white/68">{t("footer.tagline")}</p>
          </div>

          {cols.map((c) => (
            <div key={c.h}>
              <div className="text-sm font-semibold text-white">{c.h}</div>
              <ul className="mt-4 space-y-2 text-sm text-white/68">
                {c.l.map((x) => (
                  <li key={x}>
                    <a href="#" className="transition-colors hover:text-white">
                      {x}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/58 md:flex-row md:items-center">
          <div>
            © {new Date().getFullYear()} {t("footer.rights")}
          </div>
          <div className="flex gap-5">
            <Link to="/privacy" className="transition-colors hover:text-white">
              {t("footer.privacy")}
            </Link>
            <Link to="/terms" className="transition-colors hover:text-white">
              {t("footer.terms")}
            </Link>
            <a href="#" className="transition-colors hover:text-white">
              {t("footer.security")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
