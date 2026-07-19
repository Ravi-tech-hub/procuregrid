/**
 * SupplierCatalogSection.tsx — Phase 1
 * Supplier's product catalog list with "Add Product" button.
 */
import { useEffect, useState } from "react";
import {
  Plus, Package, Trash2, AlertCircle, Loader2, Boxes, IndianRupee, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getSupplierCatalog, deleteCatalogItem, type CatalogItem } from "@/lib/catalog-service";
import { AddProductDialog } from "@/components/app/AddProductDialog";
import { cn } from "@/lib/utils";

function parseSpecLines(specs: string | null): { key: string; value: string }[] {
  if (!specs || specs === "—") return [];
  return specs
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.includes(":"))
    .map((l) => {
      const idx = l.indexOf(":");
      return { key: l.slice(0, idx).trim(), value: l.slice(idx + 1).trim() };
    });
}

function getNoteLines(specs: string | null): string[] {
  if (!specs || specs === "—") return [];
  return specs
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => !l.includes(":") && l.length > 0);
}

export function SupplierCatalogSection() {
  const { company } = useAuth();
  const [items, setItems]       = useState<CatalogItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    if (!company) return;
    setLoading(true);
    setError(null);
    try {
      setItems(await getSupplierCatalog(company.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load catalog.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [company?.id]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try { await deleteCatalogItem(id); setItems((p) => p.filter((i) => i.id !== id)); }
    catch { /* silent */ }
    finally { setDeletingId(null); }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6e8095]">Supplier Workspace</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#13263d] md:text-3xl">My Product Catalog</h1>
          <p className="mt-1 text-sm text-[#718197]">Products and services you offer. Buyers will see this when their RFQs match your catalog.</p>
        </div>
        <Button type="button" variant="supplier" onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-xl border border-[#e3edf5] bg-white py-20">
          <div className="flex items-center gap-3 text-sm text-[#6b7d90]">
            <Loader2 className="h-5 w-5 animate-spin text-[#176b5a]" /> Loading catalog…
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
      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#aed4c5] bg-[#f5faf8] py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5f0]">
            <Boxes className="h-8 w-8 text-[#176b5a]" />
          </div>
          <div>
            <p className="text-base font-bold text-[#253a52]">No products yet</p>
            <p className="mt-1 max-w-xs text-sm text-[#7b8ea3]">
              Add your products so buyers can find you when they post matching RFQs.
            </p>
          </div>
          <Button type="button" variant="supplier" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Add Your First Product
          </Button>
        </div>
      )}

      {/* Catalog cards */}
      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const specLines = parseSpecLines(item.specifications);
            const noteLines = getNoteLines(item.specifications);
            return (
              <div
                key={item.id}
                className="flex flex-col overflow-hidden rounded-xl border border-[#dfe6ef] bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Card header */}
                <div className="flex items-start gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5f0]">
                    <Package className="h-5 w-5 text-[#176b5a]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#17283d] leading-tight">{item.name}</p>
                    {item.category_slug && (
                      <p className="mt-0.5 text-[11px] text-[#8fa5bc] capitalize">
                        {item.category_slug.replace(/-/g, " ")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="shrink-0 rounded-lg p-1.5 text-[#8fa5bc] hover:bg-[#fdecea] hover:text-[#d9534f]"
                  >
                    {deletingId === item.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Spec chips */}
                {specLines.length > 0 && (
                  <div className="px-4 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {specLines.slice(0, 6).map((s) => (
                        <span
                          key={s.key}
                          className="flex items-center gap-1 rounded-md border border-[#e0e8f0] bg-[#f5f8fc] px-2 py-0.5 text-[11px]"
                        >
                          <span className="text-[#8095ab]">{s.key}:</span>
                          <span className="font-semibold text-[#176b5a]">{s.value}</span>
                        </span>
                      ))}
                      {specLines.length > 6 && (
                        <span className="rounded-md bg-[#f0f4f8] px-2 py-0.5 text-[11px] text-[#8fa5bc]">
                          +{specLines.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {noteLines.length > 0 && (
                  <div className="px-4 pb-3">
                    <p className="line-clamp-2 text-xs text-[#56677a]">{noteLines.join(" · ")}</p>
                  </div>
                )}

                {/* Footer: price + MOQ */}
                {(item.price_range || item.min_order_qty) && (
                  <div className="mt-auto flex items-center gap-3 border-t border-[#f0f4f8] bg-[#f8fafc] px-4 py-2.5 text-xs">
                    {item.price_range && (
                      <span className="flex items-center gap-1 font-semibold text-[#176b5a]">
                        <IndianRupee className="h-3 w-3" />
                        {item.price_range}
                      </span>
                    )}
                    {item.min_order_qty && (
                      <span className="flex items-center gap-1 text-[#56677a]">
                        <Tag className="h-3 w-3" />
                        MOQ: {Number(item.min_order_qty).toLocaleString("en-IN")} {item.unit}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => { setDialogOpen(false); void load(); }}
      />
    </div>
  );
}
