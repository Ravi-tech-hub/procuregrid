/**
 * rfq-marketplace-service.ts
 * Fetches public open RFQs and scores them against supplier's catalog.
 * Pure frontend matching — no backend AI needed.
 */
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getSupplierCatalog } from "@/lib/catalog-service";

export type MarketplaceRfq = {
  id: string;
  rfq_number: string;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  specifications: string | null;
  delivery_location: string;
  expected_delivery_date: string;
  visibility: string;
  status: string;
  quote_count: number;
  created_at: string;
  // computed
  matchScore: number;          // 0–100 — how well RFQ matches supplier catalog
  matchReasons: string[];      // human-readable match reasons
  alreadyQuoted: boolean;
};

// ── Fetch all public open RFQs ─────────────────────────────────────────────

async function fetchPublicRfqs() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("rfqs")
    .select("id, rfq_number, product_name, category, quantity, unit, specifications, delivery_location, expected_delivery_date, visibility, status, quote_count, created_at")
    .eq("visibility", "public")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Fetch RFQ IDs the supplier already quoted ──────────────────────────────

async function fetchQuotedRfqIds(supplierCompanyId: string): Promise<Set<string>> {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase
    .from("rfq_quotes")
    .select("rfq_id")
    .eq("supplier_company_id", supplierCompanyId)
    .in("status", ["submitted", "accepted"]);
  return new Set((data ?? []).map((q: { rfq_id: string }) => q.rfq_id));
}

// ── Score one RFQ against catalog ─────────────────────────────────────────

function scoreRfq(
  rfq: { product_name: string; category: string; specifications: string | null },
  catalogSlugs: Set<string>,
  catalogCategories: Set<string>,
  catalogSpecWords: Set<string>,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const rfqName     = rfq.product_name.toLowerCase();
  const rfqCategory = rfq.category.toLowerCase();
  const rfqSpecs    = (rfq.specifications ?? "").toLowerCase();

  // 1. Category match
  if (catalogCategories.has(rfqCategory)) {
    score += 50;
    reasons.push("Category match");
  }

  // 2. Product slug / name match
  for (const slug of catalogSlugs) {
    if (rfqName.includes(slug.replace(/-/g, " ")) || rfqName.includes(slug)) {
      score += 30;
      reasons.push("Product match");
      break;
    }
  }

  // 3. Spec keyword overlap
  let specHits = 0;
  for (const word of catalogSpecWords) {
    if (word.length > 2 && rfqSpecs.includes(word)) specHits++;
  }
  if (specHits > 0) {
    score += Math.min(20, specHits * 5);
    reasons.push(`${specHits} spec keyword${specHits > 1 ? "s" : ""} matched`);
  }

  return { score, reasons };
}

// ── Main: get matching RFQs for supplier ──────────────────────────────────

export async function getMatchingRfqs(supplierCompanyId: string): Promise<MarketplaceRfq[]> {
  const [allRfqs, catalog, quotedIds] = await Promise.all([
    fetchPublicRfqs(),
    getSupplierCatalog(supplierCompanyId),
    fetchQuotedRfqIds(supplierCompanyId),
  ]);

  // Build supplier index sets
  const catalogSlugs      = new Set(catalog.map((c) => c.product_slug ?? "").filter(Boolean));
  const catalogCategories = new Set(catalog.map((c) => c.category_slug ?? "").filter(Boolean));
  const catalogSpecWords  = new Set(
    catalog
      .flatMap((c) => (c.specifications ?? "").toLowerCase().split(/[\n:,\s]+/))
      .filter((w) => w.length > 2),
  );

  // If supplier has no catalog yet, return all public RFQs unscored
  const noCatalog = catalog.length === 0;

  return allRfqs
    .map((rfq) => {
      const { score, reasons } = noCatalog
        ? { score: 0, reasons: ["Add catalog products to see match scores"] }
        : scoreRfq(rfq, catalogSlugs, catalogCategories, catalogSpecWords);
      return {
        ...rfq,
        quantity:      Number(rfq.quantity),
        specifications: rfq.specifications,
        matchScore:    score,
        matchReasons:  reasons,
        alreadyQuoted: quotedIds.has(rfq.id),
      } as MarketplaceRfq;
    })
    .sort((a, b) => {
      // Quoted items go last; then sort by score desc
      if (a.alreadyQuoted !== b.alreadyQuoted) return a.alreadyQuoted ? 1 : -1;
      return b.matchScore - a.matchScore;
    });
}
