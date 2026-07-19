/**
 * AddProductDialog.tsx — Supplier catalog: add a product with multi-select specs
 * Step 1: Product search → multi-select specs
 * Step 2: Price, MOQ, description
 */
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MultiAttributeChipGroup } from "@/components/app/MultiAttributeChipGroup";
import { cn } from "@/lib/utils";
import {
  searchLocalProducts,
  getLocalAttributes,
  type ProductTemplate,
} from "@/components/app/rfq-product-data";
import {
  addCatalogItem,
  buildCatalogSpecText,
} from "@/lib/catalog-service";
import { useAuth } from "@/lib/auth";

const UNITS = ["Pcs","Kg","Tons","Litres","Metres","Bags","Sq Ft","Sq Metre","Running Metre","Nos","Boxes","Sets","Pairs","Rolls"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddProductDialog({ open, onClose, onSuccess }: Props) {
  const { user, company } = useAuth();

  // Step
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 — product + specs
  const [query, setQuery]             = useState("");
  const [suggestions, setSuggestions] = useState<ProductTemplate[]>([]);
  const [dropOpen, setDropOpen]       = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductTemplate | null>(null);
  const [customName, setCustomName]   = useState("");
  const [multiAttrs, setMultiAttrs]   = useState<Record<string, string[]>>({});
  const dropRef = useRef<HTMLDivElement>(null);

  // Step 2 — pricing / MOQ
  const [unit, setUnit]           = useState("Pcs");
  const [minOrderQty, setMinOrderQty] = useState("");
  const [priceRange, setPriceRange]   = useState("");
  const [description, setDescription] = useState("");

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [done, setDone]             = useState(false);

  const attrDefs = selectedProduct ? getLocalAttributes(selectedProduct.slug) : [];

  useEffect(() => {
    setSuggestions(searchLocalProducts(query));
    setDropOpen(query.length >= 1);
  }, [query]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(tpl: ProductTemplate) {
    setSelectedProduct(tpl);
    setQuery(tpl.displayName);
    setCustomName(tpl.displayName);
    setDropOpen(false);
    setMultiAttrs({});
  }

  function handleCustom(val: string) {
    setQuery(val);
    setCustomName(val);
    setSelectedProduct(null);
    setMultiAttrs({});
  }

  function setAttr(key: string, vals: string[]) {
    setMultiAttrs((prev) => ({ ...prev, [key]: vals }));
  }

  function resetAll() {
    setStep(1); setQuery(""); setSuggestions([]); setDropOpen(false);
    setSelectedProduct(null); setCustomName(""); setMultiAttrs({});
    setUnit("Pcs"); setMinOrderQty(""); setPriceRange(""); setDescription("");
    setSubmitting(false); setError(null); setDone(false);
  }

  async function handleSubmit() {
    if (!user || !company) return;
    const productName = customName.trim() || selectedProduct?.displayName || "";
    if (!productName) { setError("Product name is required."); return; }

    setSubmitting(true);
    setError(null);
    try {
      const labelMap = Object.fromEntries(attrDefs.map((d) => [d.attrKey, d.label]));
      const specText = buildCatalogSpecText(multiAttrs, labelMap, description);

      await addCatalogItem({
        companyId:     company.id,
        name:          productName,
        productSlug:   selectedProduct?.slug ?? "",
        categorySlug:  selectedProduct?.categorySlug ?? "other",
        specifications: specText,
        description:   description || undefined,
        minOrderQty:   minOrderQty ? Number(minOrderQty) : undefined,
        unit,
        priceRange:    priceRange || undefined,
      });
      setDone(true);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open || typeof document === "undefined") return null;

  const supGreen = "#176b5a";

  if (done) {
    return createPortal(
      <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <button type="button" className="absolute inset-0 bg-[#071d35]/55 backdrop-blur-sm" onClick={() => { resetAll(); onClose(); }} />
        <div className="relative z-10 w-full max-w-sm rounded-t-2xl border border-border bg-white p-8 text-center shadow-2xl sm:rounded-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5f0]">
            <CheckCircle2 className="h-9 w-9 text-[#176b5a]" />
          </div>
          <h2 className="text-xl font-bold text-[#13263d]">Product Added!</h2>
          <p className="mt-2 text-sm text-[#607186]">
            <strong>{customName}</strong> has been added to your catalog.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="supplier" onClick={() => { resetAll(); onClose(); }}>Done</Button>
            <Button variant="outline" onClick={resetAll}>Add Another</Button>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-[#071d35]/55 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="shrink-0 bg-white">
          <div className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5f0]">
              <Package className="h-5 w-5 text-[#176b5a]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#17283d]">Add Product to Catalog</p>
              <p className="text-xs text-[#8fa5bc]">Step {step} of 2 — {step === 1 ? "Product & Specifications" : "Pricing & Details"}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#8fa5bc] hover:bg-[#f3f4f6]">
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-0.5 bg-[#f3f4f6]">
            <div className="h-full bg-[#176b5a] transition-all duration-400" style={{ width: step === 1 ? "50%" : "100%" }} />
          </div>
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="space-y-5">
              {/* Product search */}
              <div>
                <Label className="mb-2 block text-sm font-semibold text-[#17283d]">
                  Product Name <span className="text-[#d9534f]">*</span>
                </Label>
                <div className="relative" ref={dropRef}>
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa5bc] pointer-events-none" />
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => handleCustom(e.target.value)}
                    onFocus={() => setDropOpen(true)}
                    placeholder="e.g. Cement, TMT Bar, PVC Pipe…"
                    className="w-full rounded-xl border border-[#d1d5db] bg-white py-3 pl-10 pr-4 text-sm text-[#17283d] placeholder:text-[#9ca3af] outline-none transition focus:border-[#176b5a] focus:ring-2 focus:ring-[#176b5a]/20"
                  />
                  {dropOpen && suggestions.length > 0 && (
                    <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-lg">
                      {suggestions.map((s) => (
                        <button
                          key={s.slug}
                          type="button"
                          onMouseDown={() => handleSelect(s)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f0f9f5]",
                            selectedProduct?.slug === s.slug && "bg-[#edf7f3] font-semibold text-[#176b5a]",
                          )}
                        >
                          <Package className="h-4 w-4 shrink-0 text-[#8fa5bc]" />
                          <span className="flex-1 text-[#17283d]">{s.displayName}</span>
                          <span className="text-[11px] text-[#9ca3af]">
                            {s.categorySlug.replace(/-/g, " ")}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedProduct
                  ? <p className="mt-1 text-xs text-[#176b5a]">✓ Matched — spec fields loaded below</p>
                  : customName && <p className="mt-1 text-xs text-[#8fa5bc]">Custom product — describe specs manually</p>}
              </div>

              {/* Multi-select spec attributes */}
              {attrDefs.length > 0 && (
                <div className="space-y-5 border-t border-[#f0f4f8] pt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8095ab]">
                    Select all specifications you can supply
                  </p>
                  {attrDefs.map((def) => (
                    <MultiAttributeChipGroup
                      key={def.attrKey}
                      definition={def}
                      values={multiAttrs[def.attrKey] ?? []}
                      onChange={(vals) => setAttr(def.attrKey, vals)}
                    />
                  ))}
                </div>
              )}

              {/* Free-text description */}
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-[#17283d]">
                  {attrDefs.length > 0 ? "Additional Description / Notes" : "Product Description / Specifications"}
                </Label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. We supply IS 2062 Grade E250 certified material. Available in cut-to-size lengths."
                  className="w-full resize-none rounded-xl border border-[#d1d5db] px-3 py-2.5 text-sm outline-none transition focus:border-[#176b5a] focus:ring-2 focus:ring-[#176b5a]/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="space-y-5">
              <p className="text-sm font-bold text-[#17283d]">Pricing & Order Details</p>
              <p className="text-xs text-[#8fa5bc]">
                All fields optional — you can update these later from your catalog.
              </p>

              {/* Price range */}
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-[#17283d]">Price Range</Label>
                <Input
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  placeholder="e.g. ₹850–₹1,200 per Bag or ₹72/kg"
                  className="text-sm"
                />
                <p className="mt-1 text-xs text-[#8fa5bc]">This helps buyers estimate budget before requesting a quote.</p>
              </div>

              {/* Min order qty + unit */}
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-[#17283d]">Minimum Order Quantity</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={minOrderQty}
                    onChange={(e) => setMinOrderQty(e.target.value)}
                    placeholder="e.g. 10"
                    className="flex-1 text-sm"
                  />
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="w-32 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && <p className="rounded-lg bg-[#fff5f5] px-3 py-2 text-xs text-[#d9534f]">⚠ {error}</p>}
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="flex shrink-0 items-center justify-between border-t border-[#e8edf3] bg-[#f8fafc] px-5 py-4 sm:px-6">
          {step === 1 ? (
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => setStep(1)}>← Back</Button>
          )}
          {step === 1 ? (
            <Button
              type="button"
              variant="supplier"
              onClick={() => setStep(2)}
              disabled={!customName.trim()}
            >
              Next →
            </Button>
          ) : (
            <Button
              type="button"
              variant="supplier"
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2"
            >
              {submitting
                ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving…</>
                : "Add to Catalog ✓"}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
