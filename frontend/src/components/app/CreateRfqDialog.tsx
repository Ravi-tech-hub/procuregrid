/**
 * CreateRfqDialog.tsx
 * 3-step IndiaMart-style RFQ wizard.
 * Step 1 → Product Search + Quantity
 * Step 2 → Specifications (dynamic chips or free-text)
 * Step 3 → Delivery, Payment, Location, Visibility
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { createRfq, type CreatedRfq } from "@/lib/rfq-service";
import { cn } from "@/lib/utils";
import { getLocalAttributes } from "@/components/app/rfq-product-data";
import { ProductSearchStep, type Step1Data } from "@/components/app/ProductSearchStep";
import { SpecificationsStep, type Step2Data } from "@/components/app/SpecificationsStep";
import { DeliveryPaymentStep, type Step3Data } from "@/components/app/DeliveryPaymentStep";

// ── Step meta ──────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "Product" },
  { n: 2, label: "Specifications" },
  { n: 3, label: "Delivery & Payment" },
];

// ── Progress ring (like IndiaMart) ─────────────────────────────────────────

function ProgressRing({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step - 1) / total) * 100 + 100 / total / 2);
  const r   = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle
        cx="22" cy="22" r={r}
        fill="none" stroke="#e07b1a" strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
      <text x="22" y="27" textAnchor="middle" fontSize="11" fontWeight="700" fill="#e07b1a">
        {pct}
      </text>
    </svg>
  );
}

// ── Wizard header bar ──────────────────────────────────────────────────────

function WizardHeader({
  step, productName, onClose,
}: { step: number; productName: string; onClose: () => void }) {
  const stepMeta = STEPS[step - 1];
  const progress = Math.round((step / STEPS.length) * 100);
  return (
    <div className="shrink-0 bg-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
        {/* Product icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e5e7eb] bg-[#f9fafb]">
          <Package className="h-5 w-5 text-[#8fa5bc]" />
        </div>
        {/* Title */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#17283d]">
            {productName || "New RFQ"}
          </p>
          <p className="text-xs text-[#8fa5bc]">
            Step {step} of {STEPS.length} — {stepMeta.label}
          </p>
        </div>
        <ProgressRing step={step} total={STEPS.length} />
        <button
          type="button"
          onClick={onClose}
          className="ml-1 rounded-lg p-1.5 text-[#8fa5bc] hover:bg-[#f3f4f6] hover:text-[#374151]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {/* Orange progress bar */}
      <div className="h-0.5 bg-[#f3f4f6]">
        <div
          className="h-full bg-[#e07b1a] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Step pills */}
      <div className="flex items-center gap-0 border-b border-[#f3f4f6]">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors",
              step === s.n
                ? "border-b-2 border-[#e07b1a] text-[#e07b1a]"
                : step > s.n
                ? "text-[#1a7a5e]"
                : "text-[#9ca3af]",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                step > s.n ? "bg-[#1a7a5e] text-white" : step === s.n ? "bg-[#e07b1a] text-white" : "bg-[#e5e7eb] text-[#6b7280]",
              )}
            >
              {step > s.n ? "✓" : s.n}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function CreateRfqDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { user, company } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [step1, setStep1] = useState<Step1Data>({
    productSlug: "", productName: "", category: "other", quantity: "", unit: "Pcs",
  });

  const [step2, setStep2] = useState<Step2Data>({
    attributes: {}, freeText: "", files: [],
  });

  const [step3, setStep3] = useState<Step3Data>({
    deliveryTimeline: "", paymentTerms: "",
    deliveryLocation: "", expectedDeliveryDate: "",
    visibility: "public", selectedSuppliers: "",
  });

  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdRfq, setCreatedRfq]   = useState<CreatedRfq | null>(null);

  // ── Validation ────────────────────────────────────────────────

  function validateStep3(): boolean {
    const errs: Record<string, string> = {};
    if (!step3.deliveryLocation.trim()) errs.deliveryLocation = "Delivery location is required.";
    if (!step3.expectedDeliveryDate) {
      errs.expectedDeliveryDate = "Expected delivery date is required.";
    } else if (new Date(step3.expectedDeliveryDate) < new Date()) {
      errs.expectedDeliveryDate = "Date must be in the future.";
    }
    if (step3.visibility === "selected" && !step3.selectedSuppliers.trim()) {
      errs.selectedSuppliers = "Enter at least one supplier name or email.";
    }
    setStep3Errors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validateStep3()) return;
    if (!user || !company) {
      setSubmitError("You must be logged in with a company to post an RFQ.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Build label map from local attribute definitions
      const attrDefs = getLocalAttributes(step1.productSlug);
      const specLabels = Object.fromEntries(attrDefs.map((d) => [d.attrKey, d.label]));

      const result = await createRfq({
        companyId:            company.id,
        userId:               user.id,
        productName:          step1.productName,
        category:             step1.category,
        quantity:             Number(step1.quantity),
        unit:                 step1.unit,
        specAttributes:       step2.attributes,
        specLabels,
        freeText:             step2.freeText,
        files:                step2.files.map((f) => f.fileObj),
        deliveryTimeline:     step3.deliveryTimeline || undefined,
        paymentTerms:         step3.paymentTerms || undefined,
        deliveryLocation:     step3.deliveryLocation,
        expectedDeliveryDate: step3.expectedDeliveryDate,
        visibility:           step3.visibility,
        selectedSuppliers:    step3.selectedSuppliers || undefined,
      });
      setCreatedRfq(result);
      onSuccess?.();   // ← tell parent to refresh the RFQ list
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to post RFQ. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Reset ─────────────────────────────────────────────────────

  function handleReset() {
    setStep(1);
    setStep1({ productSlug: "", productName: "", category: "other", quantity: "", unit: "Pcs" });
    setStep2({ attributes: {}, freeText: "", files: [] });
    setStep3({ deliveryTimeline: "", paymentTerms: "", deliveryLocation: "", expectedDeliveryDate: "", visibility: "public", selectedSuppliers: "" });
    setStep3Errors({});
    setSubmitError(null);
    setCreatedRfq(null);
    onClose();
  }

  if (!open || typeof document === "undefined") return null;

  // ── Success ───────────────────────────────────────────────────

  if (createdRfq) {
    return createPortal(
      <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <button type="button" className="absolute inset-0 bg-[#071d35]/55 backdrop-blur-sm" onClick={handleReset} aria-label="Close" />
        <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-border bg-white p-8 text-center shadow-2xl sm:rounded-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5e9]">
            <CheckCircle2 className="h-9 w-9 text-[#2e7d32]" />
          </div>
          <h2 className="text-xl font-bold text-[#13263d]">RFQ Posted Successfully!</h2>
          <p className="mt-1 font-mono text-xs text-[#8fa5bc]">{createdRfq.rfq_number}</p>
          <p className="mt-2 text-sm text-[#607186]">
            Your requirement for{" "}
            <span className="font-semibold text-[#1d5b91]">{createdRfq.product_name}</span>{" "}
            has been submitted. Suppliers will start quoting shortly.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#e3eaf3] bg-[#f6f9fd] px-4 py-3 text-xs text-[#43566d]">
            <FileText className="h-4 w-4 text-[#1d5b91]" />
            <span>Visibility: <strong className="capitalize">{createdRfq.visibility}</strong></span>
            <span className="text-[#c0cad5]">·</span>
            <span>Qty: <strong>{createdRfq.quantity} {createdRfq.unit}</strong></span>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="buyer" onClick={handleReset}>Done</Button>
            <Button variant="outline" onClick={() => {
              setCreatedRfq(null);
              setStep(1);
              setStep1({ productSlug: "", productName: "", category: "other", quantity: "", unit: "Pcs" });
              setStep2({ attributes: {}, freeText: "", files: [] });
              setStep3({ deliveryTimeline: "", paymentTerms: "", deliveryLocation: "", expectedDeliveryDate: "", visibility: "public", selectedSuppliers: "" });
            }}>Post Another RFQ</Button>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  // ── Wizard ────────────────────────────────────────────────────

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-[#071d35]/55 backdrop-blur-sm" onClick={onClose} aria-label="Close" />

      <div className="relative z-10 flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        {/* Wizard header */}
        <WizardHeader step={step} productName={step1.productName} onClose={onClose} />

        {/* Steps */}
        {step === 1 && (
          <ProductSearchStep
            data={step1}
            onChange={setStep1}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <SpecificationsStep
            step1={step1}
            data={step2}
            onChange={setStep2}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <>
            <DeliveryPaymentStep
              data={step3}
              onChange={setStep3}
              errors={step3Errors}
              onBack={() => { setStep3Errors({}); setStep(2); }}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
            {submitError && (
              <div className="shrink-0 border-t border-[#fde8e8] bg-[#fff5f5] px-5 py-3">
                <p className="flex items-center gap-2 text-xs text-[#d9534f]">
                  ⚠ {submitError}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
