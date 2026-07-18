/**
 * ProductSearchStep.tsx — Step 1 of RFQ Wizard
 * Product name autocomplete → Quantity + Unit
 */
import { useState, useRef, useEffect } from "react";
import { Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  searchLocalProducts,
  type ProductTemplate,
} from "@/components/app/rfq-product-data";

export interface Step1Data {
  productSlug: string;
  productName: string;
  category: string;
  quantity: string;
  unit: string;
}

const UNITS = ["Pcs","Kg","Tons","Litres","Metres","Boxes","Sets","Pairs","Rolls","Bags","Sq Ft","Sq Metre","Running Metre","Nos"];

interface Props {
  data: Step1Data;
  onChange: (d: Step1Data) => void;
  onNext: () => void;
}

export function ProductSearchStep({ data, onChange, onNext }: Props) {
  const [query, setQuery]           = useState(data.productName);
  const [suggestions, setSuggestions] = useState<ProductTemplate[]>([]);
  const [open, setOpen]             = useState(false);
  const [quantityErr, setQuantityErr] = useState("");
  const dropdownRef                 = useRef<HTMLDivElement>(null);

  // Instant local search
  useEffect(() => {
    setSuggestions(searchLocalProducts(query));
    setOpen(query.length >= 1);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(tpl: ProductTemplate) {
    onChange({
      ...data,
      productSlug: tpl.slug,
      productName: tpl.displayName,
      category:    tpl.categorySlug,
    });
    setQuery(tpl.displayName);
    setOpen(false);
  }

  function handleCustomName(val: string) {
    setQuery(val);
    onChange({ ...data, productSlug: "", productName: val, category: data.category || "other" });
  }

  function handleNext() {
    if (!data.productName.trim()) return;
    if (!data.quantity || isNaN(Number(data.quantity)) || Number(data.quantity) <= 0) {
      setQuantityErr("Enter a valid quantity.");
      return;
    }
    setQuantityErr("");
    onNext();
  }

  const productSelected = !!data.productName.trim();

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-6 sm:px-6">

      {/* Product search */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#17283d]">
          What do you want to buy? <span className="text-[#d9534f]">*</span>
        </label>
        <div className="relative" ref={dropdownRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa5bc] pointer-events-none" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => handleCustomName(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="e.g. pipe, motor, bearing, solar panel…"
            className="w-full rounded-xl border border-[#d1d5db] bg-white py-3 pl-10 pr-4 text-sm text-[#17283d] placeholder:text-[#9ca3af] outline-none transition focus:border-[#1d5b91] focus:ring-2 focus:ring-[#1d5b91]/20"
          />

          {/* Dropdown */}
          {open && suggestions.length > 0 && (
            <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-lg">
              {suggestions.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onMouseDown={() => handleSelect(s)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f0f9f5]",
                    data.productSlug === s.slug && "bg-[#edf7f3] font-semibold text-[#1a7a5e]",
                  )}
                >
                  <Package className="h-4 w-4 shrink-0 text-[#8fa5bc]" />
                  <span className="flex-1 text-[#17283d]">{s.displayName}</span>
                  <span className="text-[11px] text-[#9ca3af]">
                    {s.categorySlug.replace(/-/g, " ").replace(/^./, s => s.toUpperCase())}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {data.productSlug && (
          <p className="mt-1.5 text-xs text-[#1a7a5e]">
            ✓ Matched: <strong>{data.productName}</strong> — spec fields will load in next step
          </p>
        )}
        {!data.productSlug && data.productName.trim() && (
          <p className="mt-1.5 text-xs text-[#8fa5bc]">
            Custom product — you'll describe specifications as free text.
          </p>
        )}
      </div>

      {/* Quantity — slides in once product typed */}
      {productSelected && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <label className="mb-2 block text-sm font-semibold text-[#17283d]">
            Quantity Required <span className="text-[#d9534f]">*</span>
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              value={data.quantity}
              onChange={(e) => {
                onChange({ ...data, quantity: e.target.value });
                setQuantityErr("");
              }}
              placeholder="e.g. 500"
              className={cn("flex-1 py-3 text-sm", quantityErr ? "border-[#d9534f]" : "")}
            />
            <Select value={data.unit} onValueChange={(v) => onChange({ ...data, unit: v })}>
              <SelectTrigger className="w-32 shrink-0 py-3 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {quantityErr && <p className="mt-1 text-xs text-[#d9534f]">{quantityErr}</p>}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Next button */}
      <Button
        type="button"
        variant="buyer"
        onClick={handleNext}
        disabled={!productSelected || !data.quantity}
        className="w-full py-3 text-base"
      >
        Next →
      </Button>
    </div>
  );
}
