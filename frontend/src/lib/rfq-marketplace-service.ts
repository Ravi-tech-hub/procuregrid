/**
 * rfq-marketplace-service.ts
 * Fetches public open RFQs and scores them against supplier's catalog.
 * Pure frontend matching — no backend AI needed.
 */
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getSupplierCatalog, type CatalogItem } from "@/lib/catalog-service";

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
  buyer_company_name?: string;
  // computed
  matchScore: number;          // 0–100 — how well RFQ matches supplier catalog
  isStrongMatch: boolean;      // score >= 50
  matchReasons: string[];      // human-readable match reasons
  alreadyQuoted: boolean;
  quoteStatus?: string;
};

// ── Fetch all public open RFQs ─────────────────────────────────────────────

async function fetchPublicRfqs() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("rfqs")
    .select("id, rfq_number, product_name, category, quantity, unit, specifications, delivery_location, expected_delivery_date, visibility, status, quote_count, created_at, companies:company_id ( name )")
    .eq("visibility", "public")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  
  return (data ?? []).map((r: any) => ({
    ...r,
    buyer_company_name: r.companies?.name || "Verified Buyer",
  }));
}

// ── Fetch quotes and their status that the supplier already submitted ──────────

async function fetchQuotedQuotes(supplierCompanyId: string): Promise<Record<string, string>> {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase
    .from("rfq_quotes")
    .select("rfq_id, status")
    .eq("supplier_company_id", supplierCompanyId);

  const dict: Record<string, string> = {};
  (data ?? []).forEach((q: { rfq_id: string; status: string }) => {
    dict[q.rfq_id] = q.status;
  });
  return dict;
}

// ── Score one RFQ against catalog items ─────────────────────────────────

function scoreRfq(
  rfq: { product_name: string; category: string; specifications: string | null },
  catalog: CatalogItem[],
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const rfqNameClean     = rfq.product_name.toLowerCase().trim();
  const rfqCategoryClean = rfq.category.toLowerCase().trim();
  const rfqSpecsClean    = (rfq.specifications ?? "").toLowerCase().trim();

  let hasExactProductMatch = false;
  let hasPartialProductMatch = false;
  let hasCategoryMatch = false;

  // Extract non-trivial words from RFQ product name
  const rfqNameWords = rfqNameClean
    .split(/[\s,/\-\\_]+/)
    .filter((w) => w.length > 2);

  const specWords = new Set<string>();

  for (const item of catalog) {
    const itemNameClean     = (item.name ?? "").toLowerCase().trim();
    const itemSlugClean     = (item.product_slug ?? "").toLowerCase().replace(/-/g, " ").trim();
    const itemCategoryClean = (item.category_slug ?? "").toLowerCase().replace(/-/g, " ").trim();
    const itemSpecsClean    = (item.specifications ?? "").toLowerCase();
    const itemDescClean     = (item.description ?? "").toLowerCase();

    // Collect spec/desc words
    (itemSpecsClean + " " + itemDescClean)
      .split(/[\n:,\s]+/)
      .forEach((w) => {
        if (w.length > 2) specWords.add(w);
      });

    // 1. Check Product Name Match
    if (
      (itemNameClean && (rfqNameClean.includes(itemNameClean) || itemNameClean.includes(rfqNameClean))) ||
      (itemSlugClean && (rfqNameClean.includes(itemSlugClean) || itemSlugClean.includes(rfqNameClean)))
    ) {
      hasExactProductMatch = true;
    } else if (
      rfqNameWords.some((w) => (itemNameClean && itemNameClean.includes(w)) || (itemSlugClean && itemSlugClean.includes(w)))
    ) {
      hasPartialProductMatch = true;
    }

    // 2. Check Category Match
    if (
      itemCategoryClean &&
      (rfqCategoryClean.includes(itemCategoryClean) || itemCategoryClean.includes(rfqCategoryClean))
    ) {
      hasCategoryMatch = true;
    }
  }

  // 3. Count spec keyword hits
  let specHits = 0;
  if (rfqSpecsClean) {
    for (const word of specWords) {
      if (rfqSpecsClean.includes(word)) specHits++;
    }
  }

  if (hasExactProductMatch) {
    score += 50;
    reasons.push("Product match");
  } else if (hasPartialProductMatch) {
    score += 30;
    reasons.push("Product keyword match");
  }

  if (hasCategoryMatch) {
    score += 35;
    reasons.push("Category match");
  }

  if (specHits > 0) {
    const specBonus = Math.min(15, specHits * 5);
    score += specBonus;
    reasons.push(`${specHits} spec keyword${specHits > 1 ? "s" : ""} matched`);
  }

  return { score: Math.min(100, score), reasons };
}

// ── Main: get matching RFQs for supplier ──────────────────────────────────

export async function getMatchingRfqs(supplierCompanyId: string): Promise<MarketplaceRfq[]> {
  const [allRfqs, catalog, quotedQuotes] = await Promise.all([
    fetchPublicRfqs(),
    getSupplierCatalog(supplierCompanyId),
    fetchQuotedQuotes(supplierCompanyId),
  ]);

  const noCatalog = catalog.length === 0;

  return allRfqs
    .map((rfq) => {
      const { score, reasons } = noCatalog
        ? { score: 0, reasons: ["Add catalog products to see match scores"] }
        : scoreRfq(rfq, catalog);
      const isStrongMatch = score >= 50;
      return {
        ...rfq,
        quantity:       Number(rfq.quantity),
        specifications:  rfq.specifications,
        matchScore:     score,
        isStrongMatch,
        matchReasons:   reasons,
        alreadyQuoted:  !!quotedQuotes[rfq.id],
        quoteStatus:    quotedQuotes[rfq.id],
      } as MarketplaceRfq;
    })
    .sort((a, b) => {
      // Quoted items go last; then sort by score desc
      if (a.alreadyQuoted !== b.alreadyQuoted) return a.alreadyQuoted ? 1 : -1;
      return b.matchScore - a.matchScore;
    });
}
