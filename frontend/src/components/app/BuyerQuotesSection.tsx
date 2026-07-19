/**
 * BuyerQuotesSection.tsx
 * Buyer view: list of all incoming supplier quotations across all RFQs.
 */
import { useEffect, useState } from "react";
import {
  FileText, Loader2, AlertCircle, RefreshCw, IndianRupee,
  Calendar, Building2, Truck, CreditCard, ChevronDown, ChevronUp, Check,
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
  const [quotes, setQuotes]     = useState<BuyerQuote[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    try {
      await updateQuoteStatus(quoteId, newStatus);
      if (newStatus === "accepted" && company) {
        // Find which RFQ this quote belongs to
        const thisQuote = quotes.find(q => q.id === quoteId);
        if (thisQuote) {
          // Automatically reject other submitted quotes for that same RFQ
          const otherQuotes = quotes.filter(
            q => q.rfq_id === thisQuote.rfq_id && q.id !== quoteId && q.status === "submitted"
          );
          await Promise.all(otherQuotes.map(q => updateQuoteStatus(q.id, "rejected")));
        }
      }
      if (company) {
        setQuotes(await getQuotesForBuyer(company.id));
      }
    } catch (e) {
      alert("Failed to update status: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  useEffect(() => { void load(); }, [company?.id]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6e8095]">Buyer Workspace</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#13263d] md:text-3xl">Quote Comparison</h1>
          <p className="mt-1 text-sm text-[#718197]">Compare pricing, lead time, commercial terms, and supplier details.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-xl border border-[#e3edf5] bg-white py-20">
          <div className="flex items-center gap-3 text-sm text-[#6b7d90]">
            <Loader2 className="h-5 w-5 animate-spin text-[#176b5a]" /> Loading quotations…
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#fde8e8] bg-[#fff5f5] py-12">
          <AlertCircle className="h-7 w-7 text-[#d9534f]" />
          <p className="text-sm text-[#d9534f]">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && quotes.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#aed4c5] bg-[#f5faf8] py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5f0]">
            <FileText className="h-8 w-8 text-[#1d5b91]" />
          </div>
          <div>
            <p className="text-base font-bold text-[#253a52]">No quotes received yet</p>
            <p className="mt-1 max-w-xs text-sm text-[#7b8ea3]">
              Incoming quotations from suppliers will show up here once they bid on your RFQs.
            </p>
          </div>
        </div>
      )}

      {/* List of quotes */}
      {!loading && !error && quotes.length > 0 && (
        <div className="space-y-3">
          {quotes.map((q) => {
            const isExpanded = expandedId === q.id;
            const sym = q.currency === "INR" ? "₹" : "$";
            return (
              <div
                key={q.id}
                className="overflow-hidden rounded-xl border border-[#dfe6ef] bg-white shadow-sm hover:border-[#b8cfe4] transition-all"
              >
                {/* Quote header */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#17283d] text-base">
                          {q.rfq_product_name || "Custom Requirement"}
                        </span>
                        <span className="font-mono text-xs text-[#1d5b91]">
                          {q.rfq_number || "RFQ-00000"}
                        </span>
                        <StatusPill tone={quoteTone(q.status)}>
                          {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                        </StatusPill>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#56677a]">
                        <span className="flex items-center gap-1 font-semibold text-[#176b5a] text-sm">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {sym}{Number(q.unit_price).toLocaleString("en-IN")}
                          <span className="ml-0.5 text-[10px] font-normal text-[#8fa5bc]">/ unit</span>
                        </span>
                        {q.total_price && (
                          <span className="text-[#8fa5bc]">
                            Total Price: <strong className="text-[#253a52]">{sym}{Number(q.total_price).toLocaleString("en-IN")}</strong>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-[#8fa5bc]" />
                          {q.supplier_company_name}
                        </span>
                        {q.lead_time_days && (
                          <span>Lead Time: <strong className="text-[#253a52]">{q.lead_time_days} days</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 text-[#8fa5bc]">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[#f0f4f8] bg-[#f8fafc] px-4 pb-4 pt-3 sm:px-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Left: specifications & notes */}
                      <div className="space-y-3">
                        {q.specifications_offered && (
                          <div>
                            <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#8095ab]">
                              <FileText className="h-3 w-3" /> Specifications Offered
                            </p>
                            <p className="text-xs text-[#38506c] whitespace-pre-line bg-white border border-[#e2e8f0] rounded-lg p-3">
                              {q.specifications_offered}
                            </p>
                          </div>
                        )}
                        {q.notes && (
                          <div>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#8095ab]">Notes</p>
                            <p className="text-xs text-[#38506c] bg-white border border-[#e2e8f0] rounded-lg p-3">{q.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Logistics details */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#8095ab] mb-2">Commercial & Logistics</p>
                        {[
                          { icon: Truck,       label: "Delivery Terms", value: q.delivery_terms },
                          { icon: CreditCard,  label: "Payment Terms",  value: q.payment_terms },
                          { icon: IndianRupee, label: "Price Valid",     value: `${q.price_validity_days} days` },
                          { icon: Calendar,    label: "Quoted On",       value: formatDate(q.created_at) },
                        ].map(({ icon: Icon, label, value }) =>
                          value ? (
                            <div key={label} className="flex items-center gap-2 text-xs bg-white border border-[#e2e8f0] rounded-lg p-2.5">
                              <Icon className="h-4 w-4 text-[#1a7a5e] shrink-0" />
                              <span className="w-28 shrink-0 font-semibold text-[#8095ab]">{label}</span>
                              <span className="text-[#253a52]">{value}</span>
                            </div>
                          ) : null,
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {q.status === "submitted" && (
                      <div className="mt-4 flex gap-2 border-t border-[#f0f4f8] pt-3 sm:col-span-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleStatusChange(q.id, "rejected")}
                          className="text-[#d9534f] hover:bg-[#fdecea] hover:text-[#d9534f] border-[#d9534f]/35 text-xs h-8 px-3"
                        >
                          Reject Quote
                        </Button>
                        <Button
                          variant="buyer"
                          size="sm"
                          onClick={() => void handleStatusChange(q.id, "accepted")}
                          className="text-xs h-8 px-4"
                        >
                          Accept Quote
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
