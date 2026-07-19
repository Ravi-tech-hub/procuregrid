/**
 * catalog-service.ts
 * Supplier product catalog — CRUD against catalog_items table.
 * Uses existing catalog_items + new columns from catalog-items-extend.sql
 */
import { getSupabaseBrowserClient } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AddCatalogItemPayload {
  companyId: string;
  name: string;
  productSlug: string;
  categorySlug: string;
  specifications: string;   // newline-separated "Key: Value1, Value2"
  description?: string;
  minOrderQty?: number;
  unit: string;
  priceRange?: string;      // e.g. "₹850–₹1,200 per Bag"
  displayOrder?: number;
}

export type CatalogItem = {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  product_slug: string | null;
  category_slug: string | null;
  specifications: string | null;
  min_order_qty: number | null;
  unit: string;
  price_range: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
};

// ── Add catalog item ───────────────────────────────────────────────────────

export async function addCatalogItem(payload: AddCatalogItemPayload): Promise<CatalogItem> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("catalog_items")
    .insert({
      company_id:    payload.companyId,
      name:          payload.name.trim(),
      description:   payload.description?.trim() || null,
      product_slug:  payload.productSlug || null,
      category_slug: payload.categorySlug || null,
      specifications: payload.specifications.trim() || null,
      min_order_qty: payload.minOrderQty ?? null,
      unit:          payload.unit,
      price_range:   payload.priceRange?.trim() || null,
      display_order: payload.displayOrder ?? 0,
      is_active:     true,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to add product.");
  return data as CatalogItem;
}

// ── Get supplier catalog ───────────────────────────────────────────────────

export async function getSupplierCatalog(companyId: string): Promise<CatalogItem[]> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("catalog_items")
    .select("id, company_id, name, description, product_slug, category_slug, specifications, min_order_qty, unit, price_range, is_active, display_order, created_at")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("display_order")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as CatalogItem[];
}

// ── Delete catalog item ────────────────────────────────────────────────────

export async function deleteCatalogItem(itemId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("catalog_items")
    .update({ is_active: false })
    .eq("id", itemId);
  if (error) throw new Error(error.message);
}

// ── Build spec text from multi-select attributes ───────────────────────────

/**
 * Convert { material: ["SS304","MS"], grade: ["Fe 500D"] }
 * into "Material: SS304, MS\nGrade: Fe 500D"
 */
export function buildCatalogSpecText(
  multiAttrs: Record<string, string[]>,
  labels: Record<string, string>,
  description: string,
): string {
  const lines: string[] = [];
  for (const [key, values] of Object.entries(multiAttrs)) {
    const cleaned = values
      .map((v) => v.startsWith("__other__:") ? v.replace("__other__:", "").trim() : v)
      .filter(Boolean);
    if (cleaned.length === 0) continue;
    lines.push(`${labels[key] ?? key}: ${cleaned.join(", ")}`);
  }
  if (description.trim()) lines.push(description.trim());
  return lines.join("\n") || "—";
}
