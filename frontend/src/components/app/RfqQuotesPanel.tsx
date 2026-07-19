/**
 * RfqQuotesPanel.tsx — Phase 4
 * Buyer view: list of supplier quotes received for one RFQ.
 * Rendered inside BuyerRfqsSection expanded card.
 */
import { useEffect, useState } from "react";
import {
  Loader2, AlertCircle, IndianRupee, Truck,
  CreditCard, FileText, ChevronDown, ChevronUp, Building2,
} from "lucide-react";
import { getQuotesForRfq, updateQuoteStatus, type RfqQuote } from "@/lib/quote-service";
import { StatusPill } from "@/components/app/DashboardPrimitives";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function quoteTone(status: string): "blue" | "green" | "red" | "slate" {
  if (status === "submitted") return "blue";
  if (status === "accepted")  return "green";
  if (status === "rejected" || status === "withdrawn") return "red";
  return "slate";
}

interface Props {
  rfqId: string;
  quoteCount: number;
}

export function RfqQuotesPanel({ rfqId, quoteCount }: Props) {
  const [quotes, setQuotes]     = useState<RfqQuote[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loaded, setLoaded]     = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleStatusChange(quoteId: string, newStatus: "accepted" | "rejected") {
    if (!confirm(`Are you sure you want to mark this quote as ${newStatus}?`)) return;
    try {
      await updateQuoteStatus(quoteId, newStatus);
      if (newStatus === "accepted") {
        // Automatically reject all other submitted quotes for this RFQ
        const otherQuotes = quotes.filter(q => q.id !== quoteId && q.status === "submitted");
        await Promise.all(otherQuotes.map(q => updateQuoteStatus(q.id, "rejected")));
      }
      setQuotes(await getQuotesForRfq(rfqId));
    } catch (e) {
      alert("Failed to update status: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        setQuotes(await getQuotesForRfq(rfqId));
        setLoaded(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load quotes.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [rfqId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-[#8fa5bc]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading quotes…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-[#d9534f]">
        <AlertCircle className="h-4 w-4" /> {error}
      </div>
    );
  }

  if (loaded && quotes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#ced9e5] bg-[#f8fafc] px-4 py-6 text-center">
        <p className="text-sm font-semibold text-[#38506c]">No quotes received yet</p>
        <p className="mt-1 text-xs text-[#8fa5bc]">Suppliers will start quoting once they see this RFQ.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8095ab]">
        {quotes.length} Quote{quotes.length !== 1 ? "s" : ""} Received — lowest price first
      </p>

      {quotes.map((q, idx) => {
        const isExpanded = expandedId === q.id;
        const isLowest   = idx === 0 && quotes.length > 1;

        return (
          <div
            key={q.id}
            className={cn(
              "overflow-hidden rounded-xl border bg-white",
              isLowest ? "border-[#1a7a5e] ring-1 ring-[#1a7a5e]/30" : "border-[#e0e8f0]",
            )}
          >
            {/* Quote summary row */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : q.id)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Supplier icon + name */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf4fb]">
                  <Building2 className="h-4 w-4 text-[#1d5b91]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#17283d]">{q.supplier_company_name}</span>
                    {isLowest && (
                      <span className="rounded-full bg-[#e8f5f0] px-2 py-0.5 text-[10px] font-bold text-[#176b5a]">
                        Lowest Price
                      </span>
                    )}
                    <StatusPill tone={quoteTone(q.status)}>
                      {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                    </StatusPill>
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-[#56677a]">
                    <span className="font-semibold text-[#176b5a] text-sm">
                      {q.currency === "INR" ? "₹" : "$"}{Number(q.unit_price).toLocaleString("en-IN")}
                      <span className="ml-1 text-[11px] font-normal text-[#8fa5bc]">/ unit</span>
                    </span>
                    {q.total_price && (
                      <span className="text-[#8fa5bc]">
                        Total: <strong className="text-[#253a52]">{q.currency === "INR" ? "₹" : "$"}{Number(q.total_price).toLocaleString("en-IN")}</strong>
                      </span>
                    )}
                    {q.lead_time_days && (
                      <span>{q.lead_time_days} day{q.lead_time_days > 1 ? "s" : ""} lead time</span>
                    )}
                    <span>Valid {q.price_validity_days} days</span>
                  </div>
                </div>
                <div className="shrink-0 text-[#8fa5bc]">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="border-t border-[#f0f4f8] bg-[#f8fafc] px-4 pb-4 pt-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Left: offer detail */}
                  <div className="space-y-3">
                    {q.specifications_offered && (
                      <div>
                        <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#8095ab]">
                          <FileText className="h-3 w-3" /> What's Offered
                        </p>
                        <p className="text-xs text-[#38506c] whitespace-pre-line">{q.specifications_offered}</p>
                      </div>
                    )}
                    {q.notes && (
                      <div>
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#8095ab]">Notes</p>
                        <p className="text-xs text-[#38506c]">{q.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: logistics detail */}
                  <div className="space-y-2">
                    {[
                      { icon: Truck,       label: "Delivery Terms", value: q.delivery_terms },
                      { icon: CreditCard,  label: "Payment Terms",  value: q.payment_terms },
                      { icon: IndianRupee, label: "Price Valid",     value: `${q.price_validity_days} days` },
                      { icon: Truck,       label: "Quoted On",       value: formatDate(q.created_at) },
                    ].map(({ label, value }) =>
                      value ? (
                        <div key={label} className="flex items-start gap-2 text-xs">
                          <span className="w-28 shrink-0 font-semibold text-[#8095ab]">{label}</span>
                          <span className="text-[#253a52]">{value}</span>
                        </div>
                      ) : null,
                    )}
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
