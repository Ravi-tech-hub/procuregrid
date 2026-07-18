/**
 * DeliveryPaymentStep.tsx — Step 3 of RFQ Wizard
 * Delivery timeline · Payment terms · Location · Date · Visibility
 */
import { lazy, Suspense } from "react";
import { MapPin, Calendar, Globe, Lock, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { RfqVisibility, DeliveryTimeline, PaymentTerms } from "@/lib/rfq-service";

const DatePickerField = lazy(() =>
  import("@/components/ui/DatePickerField").then((m) => ({ default: m.DatePickerField }))
);

export interface Step3Data {
  deliveryTimeline: DeliveryTimeline | "";
  paymentTerms: PaymentTerms | "";
  deliveryLocation: string;
  expectedDeliveryDate: string;
  visibility: RfqVisibility;
  selectedSuppliers: string;
}

interface FieldErrors {
  deliveryLocation?: string;
  expectedDeliveryDate?: string;
  selectedSuppliers?: string;
}

interface Props {
  data: Step3Data;
  onChange: (d: Step3Data) => void;
  errors: FieldErrors;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

// ── Static options ───────────────────────────────────────────────────────

const DELIVERY_OPTIONS: { value: DeliveryTimeline; label: string }[] = [
  { value: "same_day",       label: "Same day" },
  { value: "within_15_days", label: "Within 15 Days" },
  { value: "within_1_month", label: "Within 1 Month" },
  { value: "flexible",       label: "Flexible" },
];

const PAYMENT_OPTIONS: { value: PaymentTerms; label: string }[] = [
  { value: "full_advance",         label: "Full Advance" },
  { value: "loan_finance",         label: "Loan / Finance" },
  { value: "credit_post_delivery", label: "Credit (Post-Delivery)" },
  { value: "cod",                  label: "COD" },
];

const VISIBILITY_OPTIONS: {
  value: RfqVisibility; label: string; desc: string;
  icon: typeof Globe; color: string; bg: string; border: string;
}[] = [
  { value: "public",   label: "Public",            desc: "All verified suppliers can view & quote", icon: Globe,  color: "text-[#1d6fa4]", bg: "bg-[#edf4fb]", border: "border-[#1d6fa4]" },
  { value: "private",  label: "Private (Draft)",   desc: "Only you can see this RFQ",              icon: Lock,   color: "text-[#5e4a9f]", bg: "bg-[#f3f0fd]", border: "border-[#5e4a9f]" },
  { value: "selected", label: "Selected Suppliers",desc: "Send to specific suppliers you choose",  icon: Users,  color: "text-[#1a7a5e]", bg: "bg-[#edf7f3]", border: "border-[#1a7a5e]" },
];

function ChipOption({
  selected, label, onClick,
}: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-150",
        selected
          ? "border-[#1a7a5e] bg-[#edf7f3] text-[#1a7a5e]"
          : "border-[#d1d5db] bg-white text-[#374151] hover:border-[#1a7a5e] hover:text-[#1a7a5e]",
      )}
    >
      {selected && <span className="inline-block h-2 w-2 rounded-full bg-[#1a7a5e]" />}
      {label}
    </button>
  );
}

export function DeliveryPaymentStep({ data, onChange, errors, onBack, onSubmit, submitting }: Props) {
  const todayStr = new Date().toISOString().split("T")[0];

  function set<K extends keyof Step3Data>(key: K, val: Step3Data[K]) {
    onChange({ ...data, [key]: val });
  }

  function toggleDelivery(v: DeliveryTimeline) {
    set("deliveryTimeline", data.deliveryTimeline === v ? "" : v);
  }
  function togglePayment(v: PaymentTerms) {
    set("paymentTerms", data.paymentTerms === v ? "" : v);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="space-y-6">

          {/* Logistics & Payment */}
          <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8095ab]">
              Logistics & Payment
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Delivery timeline */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#17283d]">
                  <span className="text-[#1a7a5e]">⏱</span> Delivery
                </p>
                <div className="flex flex-wrap gap-2">
                  {DELIVERY_OPTIONS.map((o) => (
                    <ChipOption
                      key={o.value}
                      label={o.label}
                      selected={data.deliveryTimeline === o.value}
                      onClick={() => toggleDelivery(o.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Payment terms */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#17283d]">
                  <span className="text-[#1a7a5e]">💳</span> Payment Terms
                </p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_OPTIONS.map((o) => (
                    <ChipOption
                      key={o.value}
                      label={o.label}
                      selected={data.paymentTerms === o.value}
                      onClick={() => togglePayment(o.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Location */}
          <div>
            <Label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#17283d]">
              <MapPin className="h-4 w-4 text-[#1d5b91]" />
              Delivery Location <span className="text-[#d9534f]">*</span>
            </Label>
            <Input
              value={data.deliveryLocation}
              onChange={(e) => set("deliveryLocation", e.target.value)}
              placeholder="e.g. Mumbai, Maharashtra — Warehouse 4B"
              className={cn("text-sm", errors.deliveryLocation ? "border-[#d9534f]" : "")}
            />
            {errors.deliveryLocation && (
              <p className="mt-1 flex items-center gap-1 text-xs text-[#d9534f]">
                <AlertCircle className="h-3 w-3" /> {errors.deliveryLocation}
              </p>
            )}
          </div>

          {/* Expected Delivery Date */}
          <div>
            <Label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#17283d]">
              <Calendar className="h-4 w-4 text-[#1d5b91]" />
              Expected Delivery Date <span className="text-[#d9534f]">*</span>
            </Label>
            <Suspense fallback={<div className="h-9 w-full animate-pulse rounded-md border border-input bg-muted" />}>
              <DatePickerField
                value={data.expectedDeliveryDate}
                onChange={(v) => set("expectedDeliveryDate", v)}
                minDate={todayStr}
                error={errors.expectedDeliveryDate}
                placeholder="Pick a delivery date"
              />
            </Suspense>
            {errors.expectedDeliveryDate && (
              <p className="mt-1 flex items-center gap-1 text-xs text-[#d9534f]">
                <AlertCircle className="h-3 w-3" /> {errors.expectedDeliveryDate}
              </p>
            )}
          </div>

          {/* Visibility */}
          <div>
            <p className="mb-3 text-sm font-semibold text-[#17283d]">RFQ Visibility</p>
            <RadioGroup
              value={data.visibility}
              onValueChange={(v) => set("visibility", v as RfqVisibility)}
              className="grid gap-3 sm:grid-cols-3"
            >
              {VISIBILITY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = data.visibility === opt.value;
                return (
                  <Label
                    key={opt.value}
                    htmlFor={`vis-${opt.value}`}
                    className={cn(
                      "flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-3.5 transition-all",
                      active ? `${opt.border} ${opt.bg}` : "border-[#e0e8f0] bg-white hover:border-[#b8cfe4]",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", active ? opt.bg : "bg-[#f0f4f8]")}>
                        <Icon className={cn("h-4 w-4", active ? opt.color : "text-[#6b7d90]")} />
                      </span>
                      <RadioGroupItem value={opt.value} id={`vis-${opt.value}`} />
                    </div>
                    <span className={cn("text-sm font-semibold", active ? opt.color : "text-[#253a52]")}>{opt.label}</span>
                    <span className="text-[11px] leading-4 text-[#7b8ea3]">{opt.desc}</span>
                    {opt.value === "public" && (
                      <span className="self-start rounded-full bg-[#1d5b91]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1d5b91]">Default</span>
                    )}
                  </Label>
                );
              })}
            </RadioGroup>

            {data.visibility === "selected" && (
              <div className="mt-3">
                <Label className="mb-1.5 block text-sm font-semibold text-[#17283d]">
                  Supplier Names / Emails <span className="text-[#d9534f]">*</span>
                </Label>
                <textarea
                  rows={2}
                  value={data.selectedSuppliers}
                  onChange={(e) => set("selectedSuppliers", e.target.value)}
                  placeholder="Enter supplier names or emails, separated by commas…"
                  className={cn(
                    "w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-[#1d5b91] focus:ring-2 focus:ring-[#1d5b91]/20",
                    errors.selectedSuppliers ? "border-[#d9534f]" : "border-[#d1d5db]",
                  )}
                />
                {errors.selectedSuppliers && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#d9534f]">
                    <AlertCircle className="h-3 w-3" /> {errors.selectedSuppliers}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-[#e8edf3] bg-[#f8fafc] px-5 py-4 sm:px-6">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>← Back</Button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#1a7a5e]">Last step!</span>
          <Button type="button" variant="buyer" onClick={onSubmit} disabled={submitting} className="gap-2">
            {submitting ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Posting…</>
            ) : (
              "Get Quotes →"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
