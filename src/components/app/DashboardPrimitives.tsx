import type { ReactNode } from "react";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";
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
    <section
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border border-[#dfe6ef] bg-white shadow-[0_8px_25px_rgba(17,42,70,0.035)]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-[#edf1f5] px-5 py-4">
        <h2 className="text-sm font-bold text-[#17283d]">{title}</h2>
        {action ? (
          <button
            className="text-xs font-semibold text-[#1d5b91] hover:text-[#0b3158]"
            type="button"
          >
            {action}
          </button>
        ) : null}
      </div>
      {children}
    </section>
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
    <div className="rounded-xl border border-[#dfe6ef] bg-white p-4 shadow-[0_8px_25px_rgba(17,42,70,0.03)]">
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
    </div>
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
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left">
        <thead>
          <tr className="border-b border-[#edf1f5] bg-[#fbfcfe]">
            {columns.map((column) => (
              <th
                key={column}
                className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8391a3]"
              >
                {column}
              </th>
            ))}
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-[#edf1f5] last:border-0 hover:bg-[#fbfcfe]"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    "whitespace-nowrap px-5 py-3.5 text-xs text-[#4c5e73]",
                    cellIndex === 0 && "font-semibold text-[#1b5d96]",
                  )}
                >
                  {cell}
                </td>
              ))}
              <td className="px-4 py-3.5">
                <button
                  type="button"
                  className="rounded-md p-1 text-[#8492a3] hover:bg-[#edf2f7] hover:text-[#344a62]"
                  aria-label="Open row actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#718197]">
          {accent} workspace
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#12263e] md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7c90]">{description}</p>
      </div>
      <DashboardPanel title="Frontend preview" action="Coming next">
        <div className="grid gap-4 p-5 md:grid-cols-3">
          {children ?? (
            <>
              {["Overview", "Pending work", "Recent activity"].map((item, index) => (
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
