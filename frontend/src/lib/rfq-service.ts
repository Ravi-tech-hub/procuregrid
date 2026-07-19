/**
 * rfq-service.ts
 * Works with the EXISTING rfqs table — no migration needed.
 * All spec attributes, delivery timeline and payment terms are
 * serialized into the `specifications` text column.
 */

import { getSupabaseBrowserClient } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────

export type RfqVisibility    = "public" | "private" | "selected";
export type DeliveryTimeline = "same_day" | "within_15_days" | "within_1_month" | "flexible";
export type PaymentTerms     = "full_advance" | "loan_finance" | "credit_post_delivery" | "cod";

export interface CreateRfqPayload {
  companyId: string;
  userId: string;
  // Step 1
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  // Step 2 — serialized into specifications
  specAttributes: Record<string, string>;   // { inner_diameter: "4 inch", ... }
  specLabels: Record<string, string>;       // { inner_diameter: "Inner Diameter", ... }
  freeText: string;                         // extra notes from buyer
  files: File[];
  // Step 3 — delivery / payment included in specifications text
  deliveryTimeline?: DeliveryTimeline;
  paymentTerms?: PaymentTerms;
  deliveryLocation: string;
  expectedDeliveryDate: string;
  visibility: RfqVisibility;
  selectedSuppliers?: string;
}

export interface CreatedRfq {
  id: string;
  rfq_number: string;
  product_name: string;
  status: string;
  visibility: RfqVisibility;
  quantity: number;
  unit: string;
  created_at: string;
}

const RFQ_DOCUMENTS_BUCKET = "rfq-documents";

// ── Delivery / Payment labels (for readable spec text) ────────────────────

const DELIVERY_LABELS: Record<string, string> = {
  same_day:       "Same Day",
  within_15_days: "Within 15 Days",
  within_1_month: "Within 1 Month",
  flexible:       "Flexible",
};

const PAYMENT_LABELS: Record<string, string> = {
  full_advance:         "Full Advance",
  loan_finance:         "Loan / Finance",
  credit_post_delivery: "Credit (Post-Delivery)",
  cod:                  "COD",
};

// ── Build human-readable specifications string ────────────────────────────

export function buildSpecText(payload: {
  specAttributes: Record<string, string>;
  specLabels: Record<string, string>;
  freeText: string;
  deliveryTimeline?: DeliveryTimeline;
  paymentTerms?: PaymentTerms;
}): string {
  const lines: string[] = [];

  // Spec attributes from chips
  for (const [key, value] of Object.entries(payload.specAttributes)) {
    if (!value) continue;
    const cleaned = value.startsWith("__other__:") ? value.replace("__other__:", "").trim() : value;
    if (!cleaned) continue;
    const label = payload.specLabels[key] ?? key;
    lines.push(`${label}: ${cleaned}`);
  }

  // Free-text notes
  if (payload.freeText.trim()) {
    lines.push(payload.freeText.trim());
  }

  // Delivery & payment (appended at end)
  if (payload.deliveryTimeline) {
    lines.push(`Delivery: ${DELIVERY_LABELS[payload.deliveryTimeline] ?? payload.deliveryTimeline}`);
  }
  if (payload.paymentTerms) {
    lines.push(`Payment Terms: ${PAYMENT_LABELS[payload.paymentTerms] ?? payload.paymentTerms}`);
  }

  return lines.join("\n") || "—";
}

// ── File extension helper ─────────────────────────────────────────────────

function getFileExtension(file: File): string {
  const ext = file.name.split(".").pop()?.trim().toLowerCase();
  if (ext) return ext;
  switch (file.type) {
    case "image/jpeg": return "jpg";
    case "image/png":  return "png";
    case "image/webp": return "webp";
    case "application/pdf": return "pdf";
    default: return "bin";
  }
}

// ── createRfq — uses EXISTING schema only ────────────────────────────────

export async function createRfq(payload: CreateRfqPayload): Promise<CreatedRfq> {
  const supabase = getSupabaseBrowserClient();

  const specifications = buildSpecText({
    specAttributes:  payload.specAttributes,
    specLabels:      payload.specLabels,
    freeText:        payload.freeText,
    deliveryTimeline: payload.deliveryTimeline,
    paymentTerms:    payload.paymentTerms,
  });

  const { data: rfq, error: rfqError } = await supabase
    .from("rfqs")
    .insert({
      company_id:             payload.companyId,
      created_by_user_id:     payload.userId,
      category:               payload.category,
      product_name:           payload.productName.trim(),
      quantity:               payload.quantity,
      unit:                   payload.unit,
      delivery_location:      payload.deliveryLocation.trim(),
      expected_delivery_date: payload.expectedDeliveryDate,
      specifications,                                      // ← packed into existing column
      visibility:             payload.visibility,
      selected_suppliers:     payload.selectedSuppliers?.trim() || null,
      status:                 payload.visibility === "private" ? "draft" : "open",
    })
    .select("id, rfq_number, product_name, status, visibility, quantity, unit, created_at")
    .single();

  if (rfqError || !rfq) {
    throw new Error(rfqError?.message ?? "Failed to create RFQ.");
  }

  // Upload files
  for (let i = 0; i < payload.files.length; i++) {
    const file = payload.files[i];
    const ext  = getFileExtension(file);
    const storagePath = `company/${payload.companyId}/rfq/${rfq.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(RFQ_DOCUMENTS_BUCKET)
      .upload(storagePath, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });

    if (uploadError) {
      console.warn(`[rfq-service] Upload failed for "${file.name}":`, uploadError.message);
      continue;
    }

    const { error: docError } = await supabase.from("rfq_documents").insert({
      rfq_id:          rfq.id,
      company_id:      payload.companyId,
      storage_bucket:  RFQ_DOCUMENTS_BUCKET,
      storage_path:    storagePath,
      original_name:   file.name,
      mime_type:       file.type || null,
      file_size_bytes: file.size,
      display_name:    file.name,
      sort_order:      i,
    });

    if (docError) {
      console.warn(`[rfq-service] Doc metadata failed for "${file.name}":`, docError.message);
      await supabase.storage.from(RFQ_DOCUMENTS_BUCKET).remove([storagePath]);
    }
  }

  return rfq as CreatedRfq;
}

// ── getCompanyRfqs — unchanged ────────────────────────────────────────────

export async function getCompanyRfqs(companyId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("rfqs")
    .select("id, rfq_number, category, product_name, quantity, unit, status, visibility, quote_count, created_at, expected_delivery_date, specifications, delivery_location")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
