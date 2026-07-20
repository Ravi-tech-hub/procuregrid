import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MultiAttributeChipGroup } from "@/components/app/MultiAttributeChipGroup";
import {
  searchLocalProducts,
  getLocalAttributes,
  type ProductTemplate,
} from "@/components/app/rfq-product-data";
import { buildCatalogSpecText } from "@/lib/catalog-service";
import type { ProductFormData, ProductItem } from "@/lib/onboarding-data";
import { X, Search, Package, ImagePlus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  data: ProductFormData;
  onChange: (data: ProductFormData) => void;
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function ProductCatalogStep({
  data,
  onChange,
  submitting,
  error,
  onBack,
  onSubmit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Product & specs state
  const [query, setQuery] = useState(data.productName || "");
  const [suggestions, setSuggestions] = useState<ProductTemplate[]>([]);
  const [dropOpen, setDropOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductTemplate | null>(null);
  const [customName, setCustomName] = useState(data.productName || "");
  const [multiAttrs, setMultiAttrs] = useState<Record<string, string[]>>({});
  const [description, setDescription] = useState(data.description || "");

  const attrDefs = selectedProduct ? getLocalAttributes(selectedProduct.slug) : [];

  // Update suggestions on query change
  useEffect(() => {
    setSuggestions(searchLocalProducts(query));
  }, [query]);

  // Handle outside click for search suggestions
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync state back to parent data for active/current product
  useEffect(() => {
    const productName = customName.trim() || selectedProduct?.displayName || "";
    const labelMap = Object.fromEntries(attrDefs.map((d) => [d.attrKey, d.label]));
    const specText = buildCatalogSpecText(multiAttrs, labelMap, description);

    onChange({
      ...data,
      productName,
      productSlug: selectedProduct?.slug ?? "",
      categorySlug: selectedProduct?.categorySlug ?? "other",
      specifications: specText,
      description,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customName, selectedProduct, multiAttrs, description]);

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
    setDropOpen(val.length >= 1);
  }

  function setAttr(key: string, vals: string[]) {
    setMultiAttrs((prev) => ({ ...prev, [key]: vals }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const preview = URL.createObjectURL(file);
    onChange({ ...data, imageFile: file, imagePreview: preview });
  }

  function clearImage() {
    if (data.imagePreview) URL.revokeObjectURL(data.imagePreview);
    onChange({ ...data, imageFile: null, imagePreview: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const productNameValid = (customName.trim() || selectedProduct?.displayName || "").length > 0;
  const currentProductValid = productNameValid && data.imageFile !== null;

  function resetCurrentForm() {
    setQuery("");
    setSuggestions([]);
    setDropOpen(false);
    setSelectedProduct(null);
    setCustomName("");
    setMultiAttrs({});
    setDescription("");
    clearImage();
  }

  function handleAddMore() {
    if (!currentProductValid) return;
    const labelMap = Object.fromEntries(attrDefs.map((d) => [d.attrKey, d.label]));
    const specText = buildCatalogSpecText(multiAttrs, labelMap, description);

    const newItem: ProductItem = {
      productName: (customName.trim() || selectedProduct?.displayName || "").trim(),
      productSlug: selectedProduct?.slug ?? "",
      categorySlug: selectedProduct?.categorySlug ?? "other",
      specifications: specText,
      description: description.trim(),
      imageFile: data.imageFile,
      imagePreview: data.imagePreview,
    };

    onChange({
      ...data,
      products: [...data.products, newItem],
      productName: "",
      productSlug: "",
      categorySlug: "",
      specifications: "",
      description: "",
      imageFile: null,
      imagePreview: null,
    });

    resetCurrentForm();
  }

  function removeProduct(index: number) {
    const updated = data.products.filter((_, i) => i !== index);
    onChange({ ...data, products: updated });
  }

  const hasAtLeastOne = data.products.length > 0 || currentProductValid;
  const canSubmit = hasAtLeastOne && !submitting;

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <p className="text-sm text-muted-foreground">
        Add your products or services so buyers can discover you. You can manage and update these anytime from your workspace.
      </p>

      {/* Added Products List */}
      {data.products.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Added Products ({data.products.length})
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.products.map((p, i) => (
              <div
                key={i}
                className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-muted/20 p-3.5 shadow-sm transition hover:border-primary/40"
              >
                <div className="flex items-start gap-3">
                  {p.imagePreview ? (
                    <img
                      src={p.imagePreview}
                      alt={p.productName}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-sm text-foreground">{p.productName}</p>
                    {p.categorySlug && (
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {p.categorySlug.replace(/-/g, " ")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(i)}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                    aria-label="Remove product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {p.specifications && p.specifications !== "—" && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground bg-background/60 p-2 rounded-md border border-border/40">
                    {p.specifications}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-medium text-muted-foreground">Add another product below</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>
      )}

      {/* Main Form Box */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-border bg-muted/10 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f5f0]">
              <Package className="h-5 w-5 text-[#176b5a]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#17283d]">Product Details & Photo</p>
              <p className="text-xs text-[#8fa5bc]">
                Search standard B2B products or enter custom details and upload product photo
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Product search */}
          <div>
            <Label className="mb-2 block text-sm font-semibold text-[#17283d]">
              Product Name <span className="text-[#d9534f]">*</span>
            </Label>
            <div className="relative" ref={dropRef}>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa5bc] pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleCustom(e.target.value)}
                onFocus={() => setDropOpen(true)}
                placeholder="e.g. Cement, TMT Bar, PVC Pipe…"
                className="w-full rounded-xl border border-[#d1d5db] bg-white py-3 pl-10 pr-4 text-sm text-[#17283d] placeholder:text-[#9ca3af] outline-none transition focus:border-[#176b5a] focus:ring-2 focus:ring-[#176b5a]/20"
              />
              {dropOpen && suggestions.length > 0 && (
                <div className="absolute z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white shadow-lg">
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
            {selectedProduct ? (
              <p className="mt-1 text-xs text-[#176b5a]">✓ Matched — spec fields loaded below</p>
            ) : (
              customName && (
                <p className="mt-1 text-xs text-[#8fa5bc]">
                  Custom product — describe specs manually
                </p>
              )
            )}
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
              {attrDefs.length > 0
                ? "Additional Description / Notes"
                : "Product Description / Specifications"}
            </Label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. We supply IS 2062 Grade E250 certified material. Available in cut-to-size lengths."
              className="w-full resize-none rounded-xl border border-[#d1d5db] px-3 py-2.5 text-sm outline-none transition focus:border-[#176b5a] focus:ring-2 focus:ring-[#176b5a]/20"
            />
          </div>

          {/* Product Image — Required */}
          <div className="space-y-2 border-t border-[#f0f4f8] pt-4">
            <Label className="block text-sm font-semibold text-[#17283d]">
              Product Image <span className="text-[#d9534f]">*</span>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {data.imagePreview ? (
              <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border">
                <img
                  src={data.imagePreview}
                  alt="Product preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#d1d5db] bg-[#f8fafc] text-muted-foreground transition hover:border-[#176b5a] hover:bg-[#edf7f3]/50"
              >
                <ImagePlus className="h-8 w-8 text-[#8fa5bc]" />
                <span className="text-xs font-semibold text-[#17283d]">Click to upload product image</span>
                <span className="text-[10px] text-[#8fa5bc]">PNG, JPG, WEBP up to 5 MB</span>
              </button>
            )}
            {!data.imageFile && (
              <p className="text-[11px] text-[#d9534f]">Product image is required to save this item.</p>
            )}
          </div>

          {/* Action buttons inside form */}
          <div className="flex items-center justify-end pt-2 border-t border-[#f0f4f8]">
            <Button
              type="button"
              variant="outline"
              disabled={!currentProductValid}
              onClick={handleAddMore}
              className="border-dashed gap-2 border-[#176b5a] text-[#176b5a] hover:bg-[#edf7f3]"
            >
              <Plus className="h-4 w-4" />
              Add More Product
            </Button>
          </div>
        </div>
      </div>

      {/* Outer Onboarding Error */}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {/* Main Onboarding Wizard Footer Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="outline" type="button" onClick={onBack}>
          ← Back
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-75"
                />
              </svg>
              Creating workspace…
            </span>
          ) : (
            "Submit & Enter Workspace →"
          )}
        </Button>
      </div>
    </form>
  );
}
