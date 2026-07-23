/**
 * BuyerQuotesSection.tsx
 * Buyer view: Interactive tabular quote comparison matrix across all RFQs.
 */
import { useEffect, useState, useMemo } from "react";
import {
  FileText, Loader2, AlertCircle, RefreshCw, IndianRupee,
  Calendar, Building2, Truck, CreditCard, ChevronDown, ChevronUp, Check,
  Search, Filter, ArrowUpDown, Sparkles, CheckCircle2, XCircle, SlidersHorizontal,
  LayoutGrid, TableProperties, Zap, Award, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getQuotesForBuyer, updateQuoteStatus, type RfqQuote } from "@/lib/quote-service";
import { StatusPill } from "@/components/app/DashboardPrimitives";
import { cn } from "@/lib/utils";

type BuyerQuote = RfqQuote & {
  rfq_product_name?: string;
  rfq_number?: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function quoteTone(status: string): "blue" | "green" | "red" | "slate" {
  if (status === "submitted") return "blue";
  if (status === "accepted")  return "green";
  if (status === "rejected" || status === "withdrawn") return "red";
  return "slate";
}

export function BuyerQuotesSection() {
  const { company } = useAuth();
  const [quotes, setQuotes]         = useState<BuyerQuote[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // View Mode: 'table' or 'grid'
  const [viewMode, setViewMode]     = useState<"table" | "grid">("table");

  // Filters & Sorting state
  const [selectedRfq, setSelectedRfq]   = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery]   = useState<string>("");
  const [sortBy, setSortBy]             = useState<"price_asc" | "price_desc" | "lead_asc" | "date_desc">("price_asc");

  async function load() {
    if (!company) return;
    setLoading(true);
    setError(null);
    try {
      setQuotes(await getQuotesForBuyer(company.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load incoming quotes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(quoteId: string, newStatus: "accepted" | "rejected") {
    if (!confirm(`Are you sure you want to mark this quote as ${newStatus}?`)) return;

    // Optimistic local state update
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          return { ...q, status: newStatus };
        }
        const thisQuote = prev.find((x) => x.id === quoteId);
        if (
          newStatus === "accepted" &&
          thisQuote &&
          q.rfq_id === thisQuote.rfq_id &&
          q.status === "submitted"
        ) {
          return { ...q, status: "rejected" as const };
        }
        return q;
      })
    );

    try {
      await updateQuoteStatus(quoteId, newStatus);
      if (newStatus === "accepted" && company) {
        const thisQuote = quotes.find(q => q.id === quoteId);
        if (thisQuote) {
          const otherQuotes = quotes.filter(
            q => q.rfq_id === thisQuote.rfq_id && q.id !== quoteId && q.status === "submitted"
          );
          await Promise.all(otherQuotes.map(q => updateQuoteStatus(q.id, "rejected")));
        }
      }
      if (company) {
        const fresh = await getQuotesForBuyer(company.id);
        setQuotes(fresh);
      }
    } catch (e) {
      alert("Failed to update status: " + (e instanceof Error ? e.message : String(e)));
      if (company) {
        const fresh = await getQuotesForBuyer(company.id);
        setQuotes(fresh);
      }
    }
  }

  useEffect(() => { void load(); }, [company?.id]);

  // Extract unique RFQs for filtering
  const uniqueRfqs = useMemo(() => {
    const map = new Map<string, { id: string; number: string; name: string }>();
    quotes.forEach((q) => {
      if (q.rfq_id && !map.has(q.rfq_id)) {
        map.set(q.rfq_id, {
          id: q.rfq_id,
          number: q.rfq_number || "RFQ",
          name: q.rfq_product_name || "Custom Item",
        });
      }
    });
    return Array.from(map.values());
  }, [quotes]);

  // Calculate lowest price & fastest lead time per RFQ
  const rfqHighlights = useMemo(() => {
    const map: Record<string, { minPrice: number; minLead: number }> = {};
    quotes.forEach((q) => {
      if (!q.rfq_id) return;
      const price = Number(q.unit_price) || Infinity;
      const lead = q.lead_time_days != null ? Number(q.lead_time_days) : Infinity;

      if (!map[q.rfq_id]) {
        map[q.rfq_id] = { minPrice: price, minLead: lead };
      } else {
        if (price < map[q.rfq_id].minPrice) map[q.rfq_id].minPrice = price;
        if (lead < map[q.rfq_id].minLead) map[q.rfq_id].minLead = lead;
      }
    });
    return map;
  }, [quotes]);

  // Filter & sort quotes
  const filteredQuotes = useMemo(() => {
    return quotes
      .filter((q) => {
        if (selectedRfq !== "all" && q.rfq_id !== selectedRfq) return false;
        if (statusFilter !== "all" && q.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesSupplier = (q.supplier_company_name || "").toLowerCase().includes(query);
          const matchesProduct  = (q.rfq_product_name || "").toLowerCase().includes(query);
          const matchesRfq      = (q.rfq_number || "").toLowerCase().includes(query);
          const matchesSpecs    = (q.specifications_offered || "").toLowerCase().includes(query);
          if (!matchesSupplier && !matchesProduct && !matchesRfq && !matchesSpecs) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return Number(a.unit_price) - Number(b.unit_price);
        if (sortBy === "price_desc") return Number(b.unit_price) - Number(a.unit_price);
        if (sortBy === "lead_asc") {
          const leadA = a.lead_time_days ?? 9999;
          const leadB = b.lead_time_days ?? 9999;
          return leadA - leadB;
        }
        if (sortBy === "date_desc") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
  }, [quotes, selectedRfq, statusFilter, searchQuery, sortBy]);

  const totalCount    = quotes.length;
  const pendingCount  = quotes.filter((q) => q.status === "submitted").length;
  const acceptedCount = quotes.filter((q) => q.status === "accepted").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6e8095]">Buyer Workspace</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#13263d] md:text-3xl">
            Quote Comparison Matrix
          </h1>
          <p className="mt-1 text-sm text-[#718197]">
            Side-by-side evaluation of supplier bids, pricing, delivery lead times & commercial terms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center rounded-lg border border-[#d2dbe5] bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                viewMode === "table"
                  ? "bg-[#1d5b91] text-white shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a]"
              )}
            >
              <TableProperties className="h-3.5 w-3.5" /> Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                viewMode === "grid"
                  ? "bg-[#1d5b91] text-white shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a]"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Cards View
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={() => void load()} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      {!loading && !error && quotes.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#e1e9f2] bg-white p-3 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#738497]">Total Quotations</p>
            <p className="mt-0.5 text-xl font-bold text-[#14263b]">{totalCount}</p>
          </div>
          <div className="rounded-xl border border-[#bce2d4] bg-[#f0f9f5] p-3 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1c6e57]">Pending Evaluation</p>
            <p className="mt-0.5 text-xl font-bold text-[#155a47]">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-[#c4e1f7] bg-[#f0f7fe] p-3 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1d5b91]">Accepted Bids</p>
            <p className="mt-0.5 text-xl font-bold text-[#13446f]">{acceptedCount}</p>
          </div>
          <div className="rounded-xl border border-[#e1e9f2] bg-white p-3 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#738497]">RFQs with Bids</p>
            <p className="mt-0.5 text-xl font-bold text-[#14263b]">{uniqueRfqs.length}</p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      {!loading && !error && quotes.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#dfe6ef] bg-white p-3.5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#90a2b6]" />
              <input
                type="text"
                placeholder="Search supplier, RFQ #, product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#d2dbe5] bg-[#f9fbfe] py-1.5 pl-8 pr-3 text-xs text-[#1e3046] placeholder-[#90a2b6] transition-all focus:border-[#1d5b91] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1d5b91]"
              />
            </div>

            {/* Filter by RFQ */}
            <div className="flex items-center gap-1.5 min-w-[200px]">
              <Filter className="h-3.5 w-3.5 text-[#738497] shrink-0" />
              <select
                value={selectedRfq}
                onChange={(e) => setSelectedRfq(e.target.value)}
                className="w-full rounded-lg border border-[#d2dbe5] bg-[#f9fbfe] py-1.5 px-2.5 text-xs text-[#1e3046] transition-all focus:border-[#1d5b91] focus:bg-white focus:outline-none"
              >
                <option value="all">All RFQs ({uniqueRfqs.length})</option>
                {uniqueRfqs.map((rfq) => (
                  <option key={rfq.id} value={rfq.id}>
                    {rfq.number} - {rfq.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 lg:pt-0 lg:justify-end border-t border-[#edf2f7] lg:border-t-0">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-[#f0f4f8] p-0.5 rounded-lg">
              {["all", "submitted", "accepted", "rejected"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all capitalize",
                    statusFilter === st
                      ? "bg-white text-[#1d5b91] shadow-xs"
                      : "text-[#55687d] hover:text-[#0f172a]"
                  )}
                >
                  {st === "submitted" ? "Pending" : st}
                </button>
              ))}
            </div>

            {/* Sort Control */}
            <div className="flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#738497] shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-[#d2dbe5] bg-[#f9fbfe] py-1.5 px-2.5 text-xs text-[#1e3046] focus:border-[#1d5b91] focus:outline-none"
              >
                <option value="price_asc">Lowest Price First</option>
                <option value="price_desc">Highest Price First</option>
                <option value="lead_asc">Fastest Lead Time</option>
                <option value="date_desc">Newest Received</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center rounded-xl border border-[#e3edf5] bg-white py-20">
          <div className="flex items-center gap-3 text-sm text-[#6b7d90]">
            <Loader2 className="h-5 w-5 animate-spin text-[#176b5a]" /> Loading quote matrix…
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#fde8e8] bg-[#fff5f5] py-12">
          <AlertCircle className="h-7 w-7 text-[#d9534f]" />
          <p className="text-sm text-[#d9534f]">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && quotes.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#aed4c5] bg-[#f5faf8] py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f5f0]">
            <FileText className="h-7 w-7 text-[#1d5b91]" />
          </div>
          <div>
            <p className="text-base font-bold text-[#253a52]">No quotes received yet</p>
            <p className="mt-1 max-w-xs text-xs text-[#7b8ea3]">
              Incoming quotations from suppliers will show up here once they bid on your RFQs.
            </p>
          </div>
        </div>
      )}

      {/* Empty Filter state */}
      {!loading && !error && quotes.length > 0 && filteredQuotes.length === 0 && (
        <div className="rounded-xl border border-[#e2e9f0] bg-white p-12 text-center">
          <SlidersHorizontal className="mx-auto h-8 w-8 text-[#9aaec4]" />
          <p className="mt-2 text-sm font-semibold text-[#253a52]">No quotes match your filters</p>
          <p className="mt-1 text-xs text-[#788b9e]">Try adjusting your search query or filter options.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSelectedRfq("all"); setStatusFilter("all"); setSearchQuery(""); }}
            className="mt-4 text-xs"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* VIEW 1: PERFECT FIT TABLE VIEW */}
      {!loading && !error && filteredQuotes.length > 0 && viewMode === "table" && (
        <div className="overflow-x-auto rounded-xl border border-[#dfe6ef] bg-white shadow-xs">
          <table className="w-full min-w-[950px] text-left border-collapse table-auto sm:table-fixed">
            <thead>
              <tr className="border-b border-[#e2e9f0] bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                <th className="py-3 px-3.5 w-[20%]">RFQ & Requirement</th>
                <th className="py-3 px-3.5 w-[16%]">Supplier Name</th>
                <th className="py-3 px-3 text-right w-[12%]">Unit Price</th>
                <th className="py-3 px-3 text-right w-[12%]">Total Price</th>
                <th className="py-3 px-3 w-[10%]">Lead Time</th>
                <th className="py-3 px-3 w-[12%]">Status</th>
                <th className="py-3 pr-3.5 pl-2 text-right w-[18%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3f8] text-xs text-[#1e293b]">
              {filteredQuotes.flatMap((q) => {
                const isExpanded = expandedId === q.id;
                const sym = q.currency === "INR" ? "₹" : "$";
                const highlights = q.rfq_id ? rfqHighlights[q.rfq_id] : null;
                const isLowestPrice = highlights && Number(q.unit_price) === highlights.minPrice && highlights.minPrice < Infinity;
                const isFastestLead = highlights && q.lead_time_days != null && Number(q.lead_time_days) === highlights.minLead && highlights.minLead < Infinity;

                const mainRow = (
                  <tr
                    key={q.id}
                    className={cn(
                      "group transition-colors hover:bg-[#f8fafc]",
                      isExpanded && "bg-[#f4f8fc]",
                      q.status === "accepted" && "bg-[#f0fdf4]/60"
                    )}
                  >
                    {/* RFQ & Product */}
                    <td className="py-3 px-3.5 align-middle">
                      <div className="font-bold text-[#0f172a] group-hover:text-[#1d5b91] transition-colors truncate">
                        {q.rfq_product_name || "Custom Requirement"}
                      </div>
                      <div className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#0284c7] bg-[#f0f9ff] px-1.5 py-0.5 rounded border border-[#bae6fd]">
                        {q.rfq_number || "RFQ-00000"}
                      </div>
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-3.5 align-middle">
                      <div className="flex items-center gap-1.5 font-semibold text-[#334155] truncate">
                        <Building2 className="h-3.5 w-3.5 text-[#94a3b8] shrink-0" />
                        <span className="truncate">{q.supplier_company_name}</span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-[#64748b]">
                        Quoted {formatDate(q.created_at)}
                      </div>
                    </td>

                    {/* Unit Price */}
                    <td className="py-3 px-3 align-middle text-right whitespace-nowrap">
                      <div className="font-bold text-[#0f172a] text-sm">
                        {sym}{Number(q.unit_price).toLocaleString("en-IN")}
                        <span className="ml-0.5 text-[10px] font-normal text-[#64748b]">/unit</span>
                      </div>
                      {isLowestPrice && (
                        <span className="mt-0.5 inline-flex items-center gap-0.5 rounded-full bg-[#dcfce7] px-1.5 py-0.5 text-[9px] font-bold text-[#15803d]">
                          <Sparkles className="h-2.5 w-2.5" /> Best Price
                        </span>
                      )}
                    </td>

                    {/* Total Price */}
                    <td className="py-3 px-3 align-middle text-right whitespace-nowrap">
                      {q.total_price ? (
                        <div className="font-semibold text-[#1e293b]">
                          {sym}{Number(q.total_price).toLocaleString("en-IN")}
                        </div>
                      ) : (
                        <span className="text-[#94a3b8] text-[11px]">—</span>
                      )}
                    </td>

                    {/* Lead Time */}
                    <td className="py-3 px-3 align-middle whitespace-nowrap">
                      {q.lead_time_days ? (
                        <div>
                          <span className="font-medium text-[#1e293b]">{q.lead_time_days} days</span>
                          {isFastestLead && (
                            <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-[#e0f2fe] px-1.5 py-0.5 text-[9px] font-bold text-[#0369a1]">
                              Fastest
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#94a3b8] text-[11px]">N/A</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 align-middle whitespace-nowrap">
                      <StatusPill tone={quoteTone(q.status)}>
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </StatusPill>
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-3.5 pl-2 align-middle text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {q.status === "submitted" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void handleStatusChange(q.id, "rejected")}
                              className="h-7 border-[#fca5a5] text-[#dc2626] hover:bg-[#fef2f2] hover:text-[#dc2626] text-[11px] px-2.5"
                            >
                              Reject
                            </Button>
                            <Button
                              variant="buyer"
                              size="sm"
                              onClick={() => void handleStatusChange(q.id, "accepted")}
                              className="h-7 text-[11px] px-3 font-semibold"
                            >
                              Accept
                            </Button>
                          </>
                        ) : (
                          <div className="text-[11px] font-semibold">
                            {q.status === "accepted" ? (
                              <span className="inline-flex items-center gap-1 text-[#16a34a]">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#dc2626]">
                                <XCircle className="h-3.5 w-3.5" /> Rejected
                              </span>
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : q.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a] transition-all ml-1 shrink-0"
                          title={isExpanded ? "Collapse details" : "Expand details"}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );

                if (!isExpanded) return [mainRow];

                const detailRow = (
                  <tr key={`${q.id}-expanded`} className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <td colSpan={7} className="p-3.5 sm:p-4">
                      <div className="rounded-xl border border-[#cbd5e1] bg-white p-4 shadow-xs">
                        <div className="mb-3 flex items-center justify-between border-b border-[#f1f5f9] pb-2.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                            Specifications & Terms Breakdown
                          </h4>
                          <span className="text-[11px] text-[#64748b]">
                            Price Valid for <strong>{q.price_validity_days} days</strong>
                          </span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          {/* Offered Specifications */}
                          <div className="space-y-1">
                            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                              <FileText className="h-3 w-3 text-[#0284c7]" /> Offered Specs
                            </p>
                            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2.5 text-xs text-[#334155] whitespace-pre-line min-h-[60px]">
                              {q.specifications_offered || "No specific customization notes provided."}
                            </div>
                          </div>

                          {/* Commercial & Terms */}
                          <div className="space-y-1">
                            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                              <Truck className="h-3 w-3 text-[#0284c7]" /> Logistics & Terms
                            </p>
                            <div className="space-y-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[#64748b]">Delivery Terms:</span>
                                <span className="font-semibold text-[#1e293b]">{q.delivery_terms || "Standard Delivery"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#64748b]">Payment Terms:</span>
                                <span className="font-semibold text-[#1e293b]">{q.payment_terms || "Standard Payment"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#64748b]">Lead Time:</span>
                                <span className="font-semibold text-[#1e293b]">{q.lead_time_days ? `${q.lead_time_days} Days` : "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Supplier Notes */}
                          <div className="space-y-1">
                            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                              <Building2 className="h-3 w-3 text-[#0284c7]" /> Supplier Notes
                            </p>
                            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2.5 text-xs text-[#334155] min-h-[60px]">
                              {q.notes || "No additional comments provided."}
                            </div>
                          </div>
                        </div>

                        {/* Action bar in expanded drawer */}
                        {q.status === "submitted" && (
                          <div className="mt-3 flex items-center justify-end gap-3 border-t border-[#f1f5f9] pt-2.5">
                            <p className="text-[11px] text-[#64748b] mr-auto">
                              Accepting will auto-decline competing quotes for RFQ <strong className="text-[#0f172a]">{q.rfq_number}</strong>.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void handleStatusChange(q.id, "rejected")}
                              className="h-7 border-[#fca5a5] text-[#dc2626] hover:bg-[#fef2f2] hover:text-[#dc2626] text-xs px-3"
                            >
                              Reject Quote
                            </Button>
                            <Button
                              variant="buyer"
                              size="sm"
                              onClick={() => void handleStatusChange(q.id, "accepted")}
                              className="h-7 text-xs px-4 font-semibold"
                            >
                              Accept Quote
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );

                return [mainRow, detailRow];
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: CARDS COMPARISON MATRIX VIEW */}
      {!loading && !error && filteredQuotes.length > 0 && viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuotes.map((q) => {
            const sym = q.currency === "INR" ? "₹" : "$";
            const highlights = q.rfq_id ? rfqHighlights[q.rfq_id] : null;
            const isLowestPrice = highlights && Number(q.unit_price) === highlights.minPrice && highlights.minPrice < Infinity;
            const isFastestLead = highlights && q.lead_time_days != null && Number(q.lead_time_days) === highlights.minLead && highlights.minLead < Infinity;

            return (
              <div
                key={q.id}
                className={cn(
                  "flex flex-col justify-between rounded-xl border bg-white p-4 shadow-xs transition-all hover:shadow-md",
                  q.status === "accepted" ? "border-[#86efac] bg-[#f0fdf4]/30" : "border-[#dfe6ef]"
                )}
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#f1f5f9] pb-3">
                    <div>
                      <span className="font-mono text-[10px] font-semibold text-[#0284c7] bg-[#f0f9ff] px-1.5 py-0.5 rounded border border-[#bae6fd]">
                        {q.rfq_number || "RFQ"}
                      </span>
                      <h3 className="mt-1 font-bold text-[#0f172a] text-sm line-clamp-1">
                        {q.rfq_product_name || "Custom Requirement"}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-[#64748b] mt-0.5">
                        <Building2 className="h-3 w-3" /> {q.supplier_company_name}
                      </p>
                    </div>
                    <StatusPill tone={quoteTone(q.status)}>
                      {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                    </StatusPill>
                  </div>

                  {/* Pricing & Badges */}
                  <div className="my-3 flex items-baseline justify-between rounded-lg bg-[#f8fafc] p-3 border border-[#edf2f7]">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">Unit Price</p>
                      <p className="text-lg font-bold text-[#0f172a]">
                        {sym}{Number(q.unit_price).toLocaleString("en-IN")}
                      </p>
                    </div>
                    {q.total_price && (
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">Total</p>
                        <p className="text-xs font-bold text-[#334155]">
                          {sym}{Number(q.total_price).toLocaleString("en-IN")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Highlights Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {isLowestPrice && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold text-[#15803d]">
                        <Sparkles className="h-3 w-3" /> Lowest Price
                      </span>
                    )}
                    {isFastestLead && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#e0f2fe] px-2 py-0.5 text-[10px] font-bold text-[#0369a1]">
                        <Zap className="h-3 w-3" /> Fastest Delivery
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[10px] text-[#475569]">
                      Valid {q.price_validity_days}d
                    </span>
                  </div>

                  {/* Commercials */}
                  <div className="space-y-1 text-xs text-[#475569] border-t border-[#f1f5f9] pt-2.5">
                    {q.lead_time_days && (
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Lead Time:</span>
                        <span className="font-semibold text-[#1e293b]">{q.lead_time_days} days</span>
                      </div>
                    )}
                    {q.delivery_terms && (
                      <div className="flex justify-between truncate">
                        <span className="text-[#64748b]">Delivery:</span>
                        <span className="font-medium text-[#1e293b] truncate ml-2">{q.delivery_terms}</span>
                      </div>
                    )}
                    {q.payment_terms && (
                      <div className="flex justify-between truncate">
                        <span className="text-[#64748b]">Payment:</span>
                        <span className="font-medium text-[#1e293b] truncate ml-2">{q.payment_terms}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 border-t border-[#f1f5f9] pt-3 flex items-center justify-end gap-2">
                  {q.status === "submitted" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleStatusChange(q.id, "rejected")}
                        className="h-8 border-[#fca5a5] text-[#dc2626] hover:bg-[#fef2f2] hover:text-[#dc2626] text-xs px-3"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="buyer"
                        size="sm"
                        onClick={() => void handleStatusChange(q.id, "accepted")}
                        className="h-8 text-xs px-4 font-semibold"
                      >
                        Accept Quote
                      </Button>
                    </>
                  ) : (
                    <div className="text-xs font-semibold py-1">
                      {q.status === "accepted" ? (
                        <span className="inline-flex items-center gap-1 text-[#16a34a]">
                          <CheckCircle2 className="h-4 w-4" /> Accepted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#dc2626]">
                          <XCircle className="h-4 w-4" /> Rejected
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
