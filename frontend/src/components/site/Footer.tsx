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
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
                <Factory className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">ProcureGrid</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>

          {cols.map((c) => (
            <div key={c.h}>
              <div className="text-sm font-semibold">{c.h}</div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {c.l.map((x) => (
                  <li key={x}>
                    <a href="#" className="hover:text-foreground">
                      {x}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>
            © {new Date().getFullYear()} {t("footer.rights")}
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">
              {t("footer.privacy")}
            </a>
            <a href="#" className="hover:text-foreground">
              {t("footer.terms")}
            </a>
            <a href="#" className="hover:text-foreground">
              {t("footer.security")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
