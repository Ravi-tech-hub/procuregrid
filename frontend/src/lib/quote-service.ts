/**
 * quote-service.ts
 * Supplier quote submission and buyer quote retrieval.
 * Uses rfq_quotes table from rfq-quotes.sql migration.
 */
import { getSupabaseBrowserClient } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SubmitQuotePayload {
  rfqId: string;
  supplierCompanyId: string;
  userId: string;
  // Pricing
  unitPrice: number;
  currency?: string;
  totalPrice?: number;
  priceValidityDays?: number;
  // Delivery
  leadTimeDays?: number;
  deliveryTerms?: string;
  paymentTerms?: string;
  // Detail
  specificationsOffered?: string;
  notes?: string;
}

export type RfqQuote = {
  id: string;
  rfq_id: string;
  supplier_company_id: string;
  submitted_by_user_id: string;
  unit_price: number;
  currency: string;
  total_price: number | null;
  price_validity_days: number;
  lead_time_days: number | null;
  delivery_terms: string | null;
  payment_terms: string | null;
  specifications_offered: string | null;
  notes: string | null;
  status: "submitted" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  updated_at: string;
  // joined
  supplier_company_name?: string;
};

// ── Submit quote ───────────────────────────────────────────────────────────

export async function submitQuote(payload: SubmitQuotePayload): Promise<RfqQuote> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("rfq_quotes")
    .upsert(
      {
        rfq_id:                  payload.rfqId,
        supplier_company_id:     payload.supplierCompanyId,
        submitted_by_user_id:    payload.userId,
        unit_price:              payload.unitPrice,
        currency:                payload.currency ?? "INR",
        total_price:             payload.totalPrice ?? null,
        price_validity_days:     payload.priceValidityDays ?? 30,
        lead_time_days:          payload.leadTimeDays ?? null,
        delivery_terms:          payload.deliveryTerms?.trim() || null,
        payment_terms:           payload.paymentTerms?.trim() || null,
        specifications_offered:  payload.specificationsOffered?.trim() || null,
        notes:                   payload.notes?.trim() || null,
        status:                  "submitted",
      },
      { onConflict: "rfq_id,supplier_company_id" },
    )
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to submit quote.");
  return data as RfqQuote;
}

// ── Get quotes for one RFQ (buyer view) ───────────────────────────────────

export async function getQuotesForRfq(rfqId: string): Promise<RfqQuote[]> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("rfq_quotes")
    .select(`
      *,
      companies:supplier_company_id ( name )
    `)
    .eq("rfq_id", rfqId)
    .order("unit_price", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((q: Record<string, unknown>) => ({
    ...q,
    supplier_company_name: (q.companies as { name?: string } | null)?.name ?? "Unknown Supplier",
  })) as RfqQuote[];
}

// ── Get quotes submitted by a supplier (supplier view) ────────────────────

export async function getMyQuotes(supplierCompanyId: string): Promise<(RfqQuote & { rfq_product_name?: string; rfq_number?: string })[]> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("rfq_quotes")
    .select(`
      *,
      rfqs:rfq_id ( rfq_number, product_name )
    `)
    .eq("supplier_company_id", supplierCompanyId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((q: Record<string, unknown>) => ({
    ...q,
    rfq_product_name: (q.rfqs as { product_name?: string } | null)?.product_name,
    rfq_number:       (q.rfqs as { rfq_number?: string } | null)?.rfq_number,
  })) as (RfqQuote & { rfq_product_name?: string; rfq_number?: string })[];
}

// ── Get quotes received by a buyer (buyer view) ───────────────────────────

export async function getQuotesForBuyer(buyerCompanyId: string): Promise<(RfqQuote & { rfq_product_name?: string; rfq_number?: string })[]> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("rfq_quotes")
    .select(`
      *,
      rfqs!inner ( rfq_number, product_name, company_id ),
      companies:supplier_company_id ( name )
    `)
    .eq("rfqs.company_id", buyerCompanyId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((q: any) => ({
    ...q,
    rfq_product_name: q.rfqs?.product_name,
    rfq_number:       q.rfqs?.rfq_number,
    supplier_company_name: q.companies?.name || "Unknown Supplier",
  })) as (RfqQuote & { rfq_product_name?: string; rfq_number?: string })[];
}

// ── Withdraw quote ─────────────────────────────────────────────────────────

export async function withdrawQuote(quoteId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("rfq_quotes")
    .update({ status: "withdrawn" })
    .eq("id", quoteId);
  if (error) throw new Error(error.message);
}
