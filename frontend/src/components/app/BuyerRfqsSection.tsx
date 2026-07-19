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
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Package,
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getCompanyRfqs } from "@/lib/rfq-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/app/DashboardPrimitives";
import { RfqQuotesPanel } from "@/components/app/RfqQuotesPanel";
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

function visibilityMeta(visibility: string) {
  switch (visibility) {
    case "public":   return { icon: <Globe className="h-3.5 w-3.5" />, label: "Public",   color: "text-[#1d6fa4] bg-[#edf4fb]" };
    case "private":  return { icon: <Lock  className="h-3.5 w-3.5" />, label: "Private",  color: "text-[#5e4a9f] bg-[#f3f0fd]" };
    case "selected": return { icon: <Users className="h-3.5 w-3.5" />, label: "Selected", color: "text-[#1a7a5e] bg-[#edf7f3]" };
    default:         return { icon: null, label: visibility, color: "text-[#56677a] bg-[#f0f4f8]" };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatCreatedAt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

/** Parse the specifications text into individual tag-lines */
function parseSpecLines(specs: string | null | undefined): string[] {
  if (!specs || specs === "—") return [];
  return specs
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Determine if a spec line is a "key: value" attribute or a free-text note */
function isAttribute(line: string): boolean {
  return line.includes(":") && line.indexOf(":") < 30;
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
  onRfqCreated,
}: {
  onOpenCreateDialog: () => void;
  /** Assign this to CreateRfqDialog's onSuccess so the list auto-refreshes */
  onRfqCreated?: (refresh: () => void) => void;
}) {
  const { company } = useAuth();
  const [rfqs, setRfqs]           = useState<RfqRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [expandedId, setExpandedId]     = useState<string | null>(null);

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
  // Register the refresh function with the parent
  useEffect(() => { onRfqCreated?.(load); }, []);

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
          { label: "Total",   count: rfqs.length,                                      color: "bg-[#edf4fb] text-[#1d5b91]" },
          { label: "Open",    count: rfqs.filter(r => r.status === "open").length,    color: "bg-[#edf4fb] text-[#1d5b91]" },
          { label: "Draft",   count: rfqs.filter(r => r.status === "draft").length,   color: "bg-[#f0f4f8] text-[#56677a]" },
          { label: "Awarded", count: rfqs.filter(r => r.status === "awarded").length, color: "bg-[#e5f6ed] text-[#287556]" },
        ].map(({ label, count, color }) => (
          <span key={label} className={cn("rounded-full px-3 py-1 text-xs font-semibold", color)}>
            {label}: {count}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa5bc]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by RFQ no., product or category…"
            className="pl-9 text-sm"
          />
        </div>
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

      {/* Cards / empty */}
      {filtered.length === 0 ? (
        <EmptyState hasRfqs={rfqs.length > 0} onOpenCreateDialog={onOpenCreateDialog} />
      ) : (
        <div className="space-y-3">
          {filtered.map((rfq) => (
            <RfqCard
              key={rfq.id}
              rfq={rfq}
              expanded={expandedId === rfq.id}
              onToggle={() => setExpandedId(expandedId === rfq.id ? null : rfq.id)}
            />
          ))}
          <p className="px-1 text-xs text-[#8095ab]">
            Showing {filtered.length} of {rfqs.length} RFQ{rfqs.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

// ── RFQ Card ──────────────────────────────────────────────────

function RfqCard({
  rfq,
  expanded,
  onToggle,
}: {
  rfq: RfqRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const vis     = visibilityMeta(rfq.visibility);
  const specLines = parseSpecLines(rfq.specifications);

  // Separate attribute lines (Key: Value) from free-text notes
  const attrLines  = specLines.filter(isAttribute);
  const noteLines  = specLines.filter((l) => !isAttribute(l));

  const hasSpecs = specLines.length > 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow",
        expanded ? "border-[#1d5b91] shadow-md" : "border-[#dfe6ef] hover:border-[#b8cfe4] hover:shadow",
      )}
    >
      {/* ── Card Header (always visible) ── */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
      >
        <div className="flex items-start gap-4 px-4 py-4 sm:px-5">
          {/* Icon */}
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4fb]">
            <Package className="h-5 w-5 text-[#1d5b91]" />
          </div>

          {/* Main info */}
          <div className="min-w-0 flex-1">
            {/* Row 1: Product name + status */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-[#17283d]">{rfq.product_name}</span>
              <StatusPill tone={statusTone(rfq.status)}>
                {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
              </StatusPill>
              <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", vis.color)}>
                {vis.icon}{vis.label}
              </span>
            </div>

            {/* Row 2: RFQ number + quantity + date */}
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#56677a]">
              <span className="font-mono font-semibold text-[#1d5b91]">{rfq.rfq_number}</span>
              <span className="text-[#c0cad5]">·</span>
              <span>
                <strong className="text-[#253a52]">{Number(rfq.quantity).toLocaleString("en-IN")}</strong>
                <span className="ml-1 text-[#8fa5bc]">{rfq.unit}</span>
              </span>
              <span className="text-[#c0cad5]">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Deliver by {formatDate(rfq.expected_delivery_date)}
              </span>
              {rfq.delivery_location && (
                <>
                  <span className="text-[#c0cad5]">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {rfq.delivery_location}
                  </span>
                </>
              )}
            </div>

            {/* Row 3: spec preview (collapsed) */}
            {!expanded && hasSpecs && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {attrLines.slice(0, 4).map((line) => {
                  const [key, ...rest] = line.split(":");
                  const val = rest.join(":").trim();
                  return (
                    <span key={line} className="rounded-md bg-[#f0f4f8] px-2 py-0.5 text-[11px] font-medium text-[#38506c]">
                      <span className="text-[#8fa5bc]">{key.trim()}:</span> {val}
                    </span>
                  );
                })}
                {attrLines.length > 4 && (
                  <span className="rounded-md bg-[#f0f4f8] px-2 py-0.5 text-[11px] text-[#8fa5bc]">
                    +{attrLines.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Expand toggle */}
          <div className="mt-1 shrink-0 text-[#8fa5bc]">
            {expanded
              ? <ChevronUp className="h-4 w-4" />
              : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* ── Expanded: full specifications + quotes ── */}
      {expanded && (
        <div className="border-t border-[#e8edf3] bg-[#f8fafc] px-4 pb-4 pt-4 sm:px-5">
          <div className="grid gap-5 sm:grid-cols-2">

            {/* Specifications block */}
            {hasSpecs && (
              <div>
                <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8095ab]">
                  <ClipboardList className="h-3.5 w-3.5" />
                  Product Specifications
                </p>

                {attrLines.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attrLines.map((line) => {
                      const [key, ...rest] = line.split(":");
                      const val = rest.join(":").trim();
                      return (
                        <div
                          key={line}
                          className="flex items-center gap-1.5 rounded-lg border border-[#e0e8f0] bg-white px-3 py-1.5"
                        >
                          <span className="text-[11px] font-semibold text-[#8095ab]">{key.trim()}</span>
                          <span className="text-[11px] font-bold text-[#1d5b91]">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {noteLines.length > 0 && (
                  <div className="rounded-lg border border-[#e0e8f0] bg-white px-3 py-2.5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#8fa5bc]">Notes</p>
                    {noteLines.map((note, i) => (
                      <p key={i} className="text-xs text-[#38506c]">{note}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Delivery & meta */}
            <div>
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8095ab]">
                Delivery & Details
              </p>
              <div className="space-y-2">
                {[
                  { label: "Category",       value: rfq.category.replace(/-/g, " ").replace(/^./, (s: string) => s.toUpperCase()) },
                  { label: "Quantity",       value: `${Number(rfq.quantity).toLocaleString("en-IN")} ${rfq.unit}` },
                  { label: "Delivery By",    value: formatDate(rfq.expected_delivery_date) },
                  ...(rfq.delivery_location ? [{ label: "Location", value: rfq.delivery_location }] : []),
                  { label: "Visibility",     value: vis.label },
                  { label: "Posted On",      value: formatCreatedAt(rfq.created_at) },
                  ...(rfq.quote_count ? [{ label: "Quotes Received", value: String(rfq.quote_count) }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-2 text-xs">
                    <span className="w-28 shrink-0 font-semibold text-[#8095ab]">{label}</span>
                    <span className="text-[#253a52]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Supplier Quotes ── */}
          <div className="mt-5 border-t border-[#e8edf3] pt-4">
            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8095ab]">
              <MessageSquare className="h-3.5 w-3.5" />
              Supplier Quotes
            </p>
            <RfqQuotesPanel rfqId={rfq.id} quoteCount={rfq.quote_count ?? 0} />
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
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#ced9e5] bg-[#f8fafc] py-16">
        <Filter className="h-8 w-8 text-[#8fa5bc]" />
        <p className="text-sm font-semibold text-[#38506c]">No RFQs match your filters</p>
        <p className="text-xs text-[#8fa5bc]">Try adjusting the search or status filter above.</p>
      </div>
    );
  }

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
