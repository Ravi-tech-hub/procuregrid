import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, type TableColumn, type TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function DashboardPanel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0 overflow-hidden border-[#dfe6ef] bg-white", className)}>
      <div className="flex items-center justify-between border-b border-[#edf1f5] px-5 py-4">
        <h2 className="text-sm font-bold text-[#17283d]">{title}</h2>
        {action ? (
          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-[#1d5b91]">
            {action}
          </Button>
        ) : null}
      </div>
      {children}
    </Card>
  );
}

export function MetricCard({
  label,
  value,
  delta,
  icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  delta: string;
  icon: ReactNode;
  tone?: "blue" | "amber" | "green";
}) {
  const tones = {
    blue: "bg-[#eaf3fc] text-[#1d64a3]",
    amber: "bg-[#fff4dc] text-[#b87911]",
    green: "bg-[#e7f7ef] text-[#27845d]",
  };

  return (
    <Card className="border-[#dfe6ef] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#66778b]">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#13263d]">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", tones[tone])}>
          {icon}
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1 text-[11px] text-[#7f8da0]">
        <ArrowUpRight className="h-3 w-3 text-[#299368]" />
        {delta}
      </p>
    </Card>
  );
}

export function StatusPill({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "amber" | "green" | "slate" | "red";
}) {
  const tones = {
    blue: "bg-[#eaf3fc] text-[#1d5b91]",
    amber: "bg-[#fff1d4] text-[#996213]",
    green: "bg-[#e5f6ed] text-[#287556]",
    slate: "bg-[#edf1f5] text-[#56677a]",
    red: "bg-[#fdebea] text-[#aa4741]",
  };

  return (
    <span
      className={cn("inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold", tones[tone])}
    >
      {children}
    </span>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: Array<Array<ReactNode>> }) {
  const { t } = useTranslation();
  const tableColumns: TableColumn[] = columns.map((label, index) => ({
    key: `column-${index}`,
    label,
  }));
  const tableRows: TableRow[] = rows.map((row, rowIndex) => ({
    id: String(row[0] ?? rowIndex),
    cells: Object.fromEntries(row.map((cell, cellIndex) => [`column-${cellIndex}`, cell])),
  }));

  return (
    <Table
      columns={tableColumns}
      rows={tableRows}
      actionLabel={t("workspace.common.openRowActions")}
      onRowAction={() => undefined}
    />
  );
}

export function EmptyModule({
  title,
  description,
  accent,
  children,
}: {
  title: string;
  description: string;
  accent: "buyer" | "supplier";
  children?: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#718197]">
          {t(`workspace.shell.${accent}Workspace`)}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#12263e] md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7c90]">{description}</p>
      </div>
      <DashboardPanel
        title={t("workspace.placeholder.preview")}
        action={t("workspace.placeholder.comingNext")}
      >
        <div className="grid gap-4 p-5 md:grid-cols-3">
          {children ?? (
            <>
              {[
                t("workspace.placeholder.overview"),
                t("workspace.placeholder.pendingWork"),
                t("workspace.placeholder.recentActivity"),
              ].map((item, index) => (
                <div
                  key={item}
                  className="rounded-xl border border-dashed border-[#ced9e5] bg-[#f8fafc] p-5"
                >
                  <p className="text-xs font-semibold text-[#6b7c90]">{item}</p>
                  <p className="mt-3 text-2xl font-bold text-[#183450]">{[24, 7, 13][index]}</p>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#e6edf4]">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        accent === "buyer" ? "bg-[#276aa5]" : "bg-[#22856c]",
                      )}
                      style={{ width: `${[72, 42, 58][index]}%` }}
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </DashboardPanel>
    </div>
  );
}
