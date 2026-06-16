import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { languages, type LanguageCode } from "@/i18n/translations";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = languages.find((l) => l.code === i18n.language) ?? languages[0];

  const change = (code: LanguageCode) => {
    void i18n.changeLanguage(code);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lng", code);
      document.documentElement.lang = code;
      document.documentElement.dir = code === "ur" ? "rtl" : "ltr";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={t("language.label")} className="gap-1.5">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{current.native}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => change(l.code)}
            className={l.code === current.code ? "font-semibold" : ""}
          >
            <span className="flex w-full items-center justify-between">
              <span>{l.native}</span>
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
