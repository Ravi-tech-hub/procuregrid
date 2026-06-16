import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TableColumn = {
  key: string;
  label: string;
  className?: string;
};

export type TableRow = {
  id: string;
  cells: Record<string, ReactNode>;
};

export function Table({
  columns,
  rows,
  actionLabel,
  onRowAction,
  emptyMessage = "No records found.",
}: {
  columns: TableColumn[];
  rows: TableRow[];
  actionLabel?: string;
  onRowAction?: (row: TableRow) => void;
  emptyMessage?: string;
}) {
  return (
    <div className="w-full overflow-x-auto overscroll-x-contain">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#edf1f5] bg-[#fbfcfe]">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8391a3] sm:px-5",
                  column.className,
                )}
              >
                {column.label}
              </th>
            ))}
            {onRowAction ? <th scope="col" className="w-12 px-3 py-3" /> : null}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#edf1f5] transition-colors last:border-0 hover:bg-[#fbfcfe]"
              >
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className={cn(
                      "whitespace-nowrap px-4 py-3.5 text-xs text-[#4c5e73] sm:px-5",
                      index === 0 && "font-semibold text-[#1b5d96]",
                      column.className,
                    )}
                  >
                    {row.cells[column.key]}
                  </td>
                ))}
                {onRowAction ? (
                  <td className="px-3 py-3.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="iconSm"
                      aria-label={actionLabel}
                      onClick={() => onRowAction(row)}
                      className="text-[#8492a3] hover:text-[#344a62]"
                    >
                      <MoreHorizontal />
                    </Button>
                  </td>
                ) : null}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (onRowAction ? 1 : 0)}
                className="px-5 py-10 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
