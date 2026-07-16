import { useEffect, useState } from "react";
import {
  Plus,
  FileInput,
  Search,
  Filter,
  Eye,
  Globe,
  Lock,
  Users,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getCompanyRfqs } from "@/lib/rfq-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/app/DashboardPrimitives";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────

type RfqRow = Awaited<ReturnType<typeof getCompanyRfqs>>[number];

type FilterStatus = "all" | "open" | "draft" | "closed" | "cancelled" | "awarded";

// ── Helpers ───────────────────────────────────────────────────

function statusTone(status: string): "blue" | "amber" | "green" | "slate" | "red" {
  switch (status) {
    case "open":      return "blue";
    case "draft":     return "slate";
    case "awarded":   return "green";
    case "closed":    return "amber";
    case "cancelled": return "red";
    default:          return "slate";
  }
}

function visibilityIcon(visibility: string) {
  switch (visibility) {
    case "public":   return <Globe className="h-3.5 w-3.5 text-[#1d6fa4]" />;
    case "private":  return <Lock className="h-3.5 w-3.5 text-[#5e4a9f]" />;
    case "selected": return <Users className="h-3.5 w-3.5 text-[#1a7a5e]" />;
    default:         return null;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const STATUS_FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "All",       value: "all" },
  { label: "Open",      value: "open" },
  { label: "Draft",     value: "draft" },
  { label: "Closed",    value: "closed" },
  { label: "Awarded",   value: "awarded" },
  { label: "Cancelled", value: "cancelled" },
];

// ── Main Component ────────────────────────────────────────────

export function BuyerRfqsSection({
  onOpenCreateDialog,
}: {
  onOpenCreateDialog: () => void;
}) {
  const { company } = useAuth();
  const [rfqs, setRfqs] = useState<RfqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  async function load() {
    if (!company) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCompanyRfqs(company.id);
      setRfqs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load RFQs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [company?.id]);

  // ── Filtering ────────────────────────────────────────────────
  const filtered = rfqs.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.rfq_number.toLowerCase().includes(q) ||
      r.product_name.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader onOpenCreateDialog={onOpenCreateDialog} />
        <div className="flex items-center justify-center rounded-xl border border-[#e3edf5] bg-white py-20">
          <div className="flex items-center gap-3 text-sm text-[#6b7d90]">
            <Loader2 className="h-5 w-5 animate-spin text-[#1d5b91]" />
            Loading your RFQs…
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader onOpenCreateDialog={onOpenCreateDialog} />
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[#fde8e8] bg-[#fff5f5] py-16">
          <AlertCircle className="h-8 w-8 text-[#d9534f]" />
          <p className="text-sm font-medium text-[#d9534f]">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <PageHeader onOpenCreateDialog={onOpenCreateDialog} />

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Total",     count: rfqs.length,                                         color: "bg-[#edf4fb] text-[#1d5b91]" },
          { label: "Open",      count: rfqs.filter(r => r.status === "open").length,        color: "bg-[#edf4fb] text-[#1d5b91]" },
          { label: "Draft",     count: rfqs.filter(r => r.status === "draft").length,       color: "bg-[#f0f4f8] text-[#56677a]" },
          { label: "Awarded",   count: rfqs.filter(r => r.status === "awarded").length,     color: "bg-[#e5f6ed] text-[#287556]" },
        ].map(({ label, count, color }) => (
          <span key={label} className={cn("rounded-full px-3 py-1 text-xs font-semibold", color)}>
            {label}: {count}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa5bc]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by RFQ no., product or category…"
            className="pl-9 text-sm"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                statusFilter === f.value
                  ? "bg-[#0b3158] text-white"
                  : "bg-[#f0f4f8] text-[#56677a] hover:bg-[#e2eaf2]",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / empty */}
      {filtered.length === 0 ? (
        <EmptyState hasRfqs={rfqs.length > 0} onOpenCreateDialog={onOpenCreateDialog} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#dfe6ef] bg-white shadow-sm">
          {/* Table header */}
          <div className="border-b border-[#edf1f5] bg-[#f8fafc] px-5 py-3">
            <div className="grid grid-cols-[2fr_2.5fr_1.5fr_1fr_1fr_1.2fr_1fr] gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8095ab]">
              <span>RFQ No.</span>
              <span>Product</span>
              <span>Category</span>
              <span>Qty</span>
              <span>Visibility</span>
              <span>Delivery Date</span>
              <span>Status</span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#f0f4f8]">
            {filtered.map((rfq) => (
              <div
                key={rfq.id}
                className="group grid grid-cols-[2fr_2.5fr_1.5fr_1fr_1fr_1.2fr_1fr] gap-3 items-center px-5 py-3.5 transition-colors hover:bg-[#f8fafc]"
              >
                {/* RFQ Number */}
                <span className="font-mono text-xs font-semibold text-[#1d5b91]">
                  {rfq.rfq_number}
                </span>

                {/* Product */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#17283d]">
                    {rfq.product_name}
                  </p>
                </div>

                {/* Category */}
                <span className="truncate text-xs text-[#56677a]">
                  {rfq.category.replace(/-/g, " ").replace(/^./, (s: string) => s.toUpperCase())}
                </span>

                {/* Quantity */}
                <span className="text-xs font-medium text-[#253a52]">
                  {Number(rfq.quantity).toLocaleString("en-IN")}
                  <span className="ml-1 text-[10px] text-[#8fa5bc]">{rfq.unit}</span>
                </span>

                {/* Visibility */}
                <div className="flex items-center gap-1 capitalize text-xs text-[#56677a]">
                  {visibilityIcon(rfq.visibility)}
                  <span className="hidden sm:inline">{rfq.visibility}</span>
                </div>

                {/* Delivery date */}
                <span className="text-xs text-[#56677a]">
                  {formatDate(rfq.expected_delivery_date)}
                </span>

                {/* Status */}
                <StatusPill tone={statusTone(rfq.status)}>
                  {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                </StatusPill>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-[#edf1f5] bg-[#f8fafc] px-5 py-3 text-xs text-[#8095ab]">
            Showing {filtered.length} of {rfqs.length} RFQ{rfqs.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function PageHeader({ onOpenCreateDialog }: { onOpenCreateDialog: () => void }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6e8095]">
          Buyer Workspace
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#13263d] md:text-3xl">
          My RFQs
        </h1>
        <p className="mt-1 text-sm text-[#718197]">
          All requirements and quotation requests posted by your company.
        </p>
      </div>
      <Button
        type="button"
        variant="buyer"
        onClick={onOpenCreateDialog}
        className="w-full sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        Post New RFQ
      </Button>
    </div>
  );
}

function EmptyState({
  hasRfqs,
  onOpenCreateDialog,
}: {
  hasRfqs: boolean;
  onOpenCreateDialog: () => void;
}) {
  if (hasRfqs) {
    // Filtered empty
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#ced9e5] bg-[#f8fafc] py-16">
        <Filter className="h-8 w-8 text-[#8fa5bc]" />
        <p className="text-sm font-semibold text-[#38506c]">No RFQs match your filters</p>
        <p className="text-xs text-[#8fa5bc]">Try adjusting the search or status filter above.</p>
      </div>
    );
  }

  // No RFQs at all
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#ced9e5] bg-[#f8fafc] py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#edf4fb]">
        <FileInput className="h-8 w-8 text-[#1d5b91]" />
      </div>
      <div>
        <p className="text-base font-bold text-[#253a52]">No RFQs posted yet</p>
        <p className="mt-1 max-w-xs text-sm text-[#7b8ea3]">
          Post your first requirement and let suppliers compete to give you the best price.
        </p>
      </div>
      <Button type="button" variant="buyer" onClick={onOpenCreateDialog}>
        <Plus className="h-4 w-4" />
        Post Your First RFQ
      </Button>
    </div>
  );
}
