/**
 * SupplierQuotesSection.tsx
 * Supplier's quotation list. Shows all submitted quotes and their status.
 */
import { useEffect, useState } from "react";
import {
  FileText, Loader2, AlertCircle, RefreshCw, IndianRupee,
  Calendar, CheckCircle, XCircle, Trash2, ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getMyQuotes, withdrawQuote, type RfqQuote } from "@/lib/quote-service";
import { StatusPill } from "@/components/app/DashboardPrimitives";
import { cn } from "@/lib/utils";

type SupplierQuote = RfqQuote & {
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

export function SupplierQuotesSection() {
  const { company } = useAuth();
  const [quotes, setQuotes]     = useState<SupplierQuote[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  async function load() {
    if (!company) return;
    setLoading(true);
    setError(null);
    try {
      setQuotes(await getMyQuotes(company.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load quotations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [company?.id]);

  async function handleWithdraw(id: string) {
    if (!confirm("Are you sure you want to withdraw this quote?")) return;
    setWithdrawingId(id);
    try {
      await withdrawQuote(id);
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "withdrawn" as const } : q))
      );
    } catch (e) {
      alert("Failed to withdraw quote. Please try again.");
    } finally {
      setWithdrawingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6e8095]">Supplier Workspace</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#13263d] md:text-3xl">My Quotations</h1>
          <p className="mt-1 text-sm text-[#718197]">Track commercial offers you have submitted to buyers.</p>
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
            <FileText className="h-8 w-8 text-[#176b5a]" />
          </div>
          <div>
            <p className="text-base font-bold text-[#253a52]">No quotations submitted yet</p>
            <p className="mt-1 max-w-xs text-sm text-[#7b8ea3]">
              Check out the RFQ Opportunities marketplace to place bids on buyer requirements.
            </p>
          </div>
        </div>
      )}

      {/* Quotes list */}
      {!loading && !error && quotes.length > 0 && (
        <div className="space-y-3">
          {quotes.map((q) => {
            const sym = q.currency === "INR" ? "₹" : "$";
            return (
              <div
                key={q.id}
                className="overflow-hidden rounded-xl border border-[#dfe6ef] bg-white shadow-sm hover:border-[#b8cfe4] transition-all"
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
                          Total Quote: <strong className="text-[#253a52]">{sym}{Number(q.total_price).toLocaleString("en-IN")}</strong>
                        </span>
                      )}
                      {q.lead_time_days && (
                        <span>Lead Time: <strong className="text-[#253a52]">{q.lead_time_days} days</strong></span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Submitted on {formatDate(q.created_at)}
                      </span>
                    </div>

                    {q.specifications_offered && (
                      <div className="mt-3 rounded-lg bg-[#f8fafc] border border-[#f0f4f8] p-2.5 text-xs text-[#38506c] whitespace-pre-line">
                        <span className="font-semibold text-[#8095ab] block mb-1">Specifications Offered:</span>
                        {q.specifications_offered}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {q.status === "submitted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={withdrawingId === q.id}
                        onClick={() => handleWithdraw(q.id)}
                        className="text-[#d9534f] hover:bg-[#fdecea] hover:text-[#d9534f] border-[#d9534f]/35 gap-1.5"
                      >
                        {withdrawingId === q.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>Withdraw Quote</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
