/**
 * rfq-service.ts
 * ─────────────────────────────────────────────────────────────
 * All Supabase interactions for creating and managing RFQs.
 * Called from CreateRfqDialog — keeps DB logic out of the UI component.
 */

import { getSupabaseBrowserClient } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────

export type RfqVisibility = "public" | "private" | "selected";

export interface CreateRfqPayload {
  companyId: string;
  userId: string;
  category: string;
  productName: string;
  quantity: number;
  unit: string;
  deliveryLocation: string;
  expectedDeliveryDate: string; // ISO date string "YYYY-MM-DD"
  specifications: string;
  visibility: RfqVisibility;
  selectedSuppliers?: string;
  files: File[];
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

// ── Helpers ───────────────────────────────────────────────────

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

// ── Main service function ─────────────────────────────────────

/**
 * Creates a new RFQ row, then uploads any attached documents to Storage
 * and records them in rfq_documents.
 *
 * Returns the created RFQ record or throws an error with a user-readable message.
 */
export async function createRfq(payload: CreateRfqPayload): Promise<CreatedRfq> {
  const supabase = getSupabaseBrowserClient();

  // 1. Insert RFQ row
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
      specifications:         payload.specifications.trim(),
      visibility:             payload.visibility,
      selected_suppliers:     payload.selectedSuppliers?.trim() || null,
      // status defaults to 'open' in DB; set 'draft' if private
      status:                 payload.visibility === "private" ? "draft" : "open",
    })
    .select("id, rfq_number, product_name, status, visibility, quantity, unit, created_at")
    .single();

  if (rfqError || !rfq) {
    throw new Error(rfqError?.message ?? "Failed to create RFQ.");
  }

  // 2. Upload files (if any)
  if (payload.files.length > 0) {
    for (let i = 0; i < payload.files.length; i++) {
      const file = payload.files[i];
      const ext  = getFileExtension(file);
      const storagePath = `company/${payload.companyId}/rfq/${rfq.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(RFQ_DOCUMENTS_BUCKET)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        // Non-fatal: RFQ is already created — just skip this file and continue
        console.warn(`[rfq-service] Failed to upload file "${file.name}":`, uploadError.message);
        continue;
      }

      // 3. Record document metadata
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
        // Non-fatal: clean up the orphaned storage file
        console.warn(`[rfq-service] Failed to record document metadata for "${file.name}":`, docError.message);
        await supabase.storage.from(RFQ_DOCUMENTS_BUCKET).remove([storagePath]);
      }
    }
  }

  return rfq as CreatedRfq;
}

/**
 * Fetches all RFQs for a company, ordered by newest first.
 */
export async function getCompanyRfqs(companyId: string) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("rfqs")
    .select(
      "id, rfq_number, category, product_name, quantity, unit, status, visibility, quote_count, created_at, expected_delivery_date"
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
