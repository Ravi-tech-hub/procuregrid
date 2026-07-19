/**
 * SupplierRfqsSection.tsx — Phase 2
 * Shows matching public RFQs with match score + Quote button.
 */
import { useEffect, useState } from "react";
import {
  Search, Loader2, AlertCircle, RefreshCw, Package,
  Calendar, MapPin, TrendingUp, CheckCircle2, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/app/DashboardPrimitives";
import { SubmitQuoteDialog } from "@/components/app/SubmitQuoteDialog";
import { getMatchingRfqs, type MarketplaceRfq } from "@/lib/rfq-marketplace-service";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function MatchBadge({ score }: { score: number }) {
  if (score === 0) return null;
  const color = score >= 70 ? "bg-[#e8f5f0] text-[#176b5a]" : score >= 40 ? "bg-[#fff8e6] text-[#b07d0a]" : "bg-[#f0f4f8] text-[#56677a]";
  const label = score >= 70 ? "Strong match" : score >= 40 ? "Partial match" : "Low match";
  return (
    <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", color)}>
      <TrendingUp className="h-3 w-3" />{label}
    </span>
  );
}

export function SupplierRfqsSection() {
  const { company } = useAuth();
  const [rfqs, setRfqs]         = useState<MarketplaceRfq[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [quoteRfq, setQuoteRfq] = useState<MarketplaceRfq | null>(null);

  async function load() {
    if (!company) return;
    setLoading(true);
    setError(null);
    try {
      setRfqs(await getMatchingRfqs(company.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load RFQs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [company?.id]);

  const filtered = rfqs.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.product_name.toLowerCase().includes(q) || r.rfq_number.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6e8095]">Supplier Workspace</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#13263d] md:text-3xl">RFQ Marketplace</h1>
          <p className="mt-1 text-sm text-[#718197]">Open RFQs from buyers — sorted by how well they match your catalog.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa5bc]" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product or RFQ no…" className="pl-9 text-sm" />
      </div>

      {loading && (
        <div className="flex items-center justify-center rounded-xl border border-[#e3edf5] bg-white py-20">
          <div className="flex items-center gap-3 text-sm text-[#6b7d90]">
            <Loader2 className="h-5 w-5 animate-spin text-[#176b5a]" /> Loading opportunities…
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#fde8e8] bg-[#fff5f5] py-12">
          <AlertCircle className="h-7 w-7 text-[#d9534f]" />
          <p className="text-sm text-[#d9534f]">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-[#aed4c5] bg-[#f5faf8] py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5f0]">
            <Package className="h-8 w-8 text-[#176b5a]" />
          </div>
          <div>
            <p className="text-base font-bold text-[#253a52]">No matching RFQs found</p>
            <p className="mt-1 max-w-xs text-sm text-[#7b8ea3]">
              Add products to your catalog to see matched opportunities here.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((rfq) => (
            <div
              key={rfq.id}
              className={cn(
                "overflow-hidden rounded-xl border bg-white shadow-sm",
                rfq.alreadyQuoted ? "border-[#aed4c5] bg-[#f5faf8]" : "border-[#dfe6ef] hover:border-[#b8cfe4]",
              )}
            >
              <div className="flex items-start gap-4 p-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4fb]">
                  <Package className="h-5 w-5 text-[#1d5b91]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#17283d]">{rfq.product_name}</span>
                    <span className="font-mono text-xs text-[#1d5b91]">{rfq.rfq_number}</span>
                    <MatchBadge score={rfq.matchScore} />
                    {rfq.alreadyQuoted && (
                      <span className="flex items-center gap-1 rounded-full bg-[#e8f5f0] px-2 py-0.5 text-[11px] font-semibold text-[#176b5a]">
                        <CheckCircle2 className="h-3 w-3" /> Quoted
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-[#56677a]">
                    <span><strong className="text-[#253a52]">{Number(rfq.quantity).toLocaleString("en-IN")}</strong> {rfq.unit}</span>
                    <span className="text-[#c0cad5]">·</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />By {formatDate(rfq.expected_delivery_date)}</span>
                    {rfq.delivery_location && (
                      <><span className="text-[#c0cad5]">·</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{rfq.delivery_location}</span></>
                    )}
                  </div>
                  {rfq.matchReasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {rfq.matchReasons.map((r) => (
                        <span key={r} className="rounded-md bg-[#f0f9f5] px-2 py-0.5 text-[11px] text-[#176b5a]">{r}</span>
                      ))}
                    </div>
                  )}
                  {rfq.specifications && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-[#56677a]">{rfq.specifications}</p>
                  )}
                </div>
                <div className="shrink-0">
                  {rfq.alreadyQuoted ? (
                    <Button variant="outline" size="sm" disabled>Quoted ✓</Button>
                  ) : (
                    <Button variant="supplier" size="sm" onClick={() => setQuoteRfq(rfq)} className="gap-1.5">
                      <Send className="h-3.5 w-3.5" /> Quote
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <p className="px-1 text-xs text-[#8095ab]">
            {filtered.length} opportunit{filtered.length !== 1 ? "ies" : "y"} found
          </p>
        </div>
      )}

      {quoteRfq && (
        <SubmitQuoteDialog
          rfq={quoteRfq}
          open={!!quoteRfq}
          onClose={() => setQuoteRfq(null)}
          onSuccess={() => { setQuoteRfq(null); void load(); }}
        />
      )}
    </div>
  );
}
