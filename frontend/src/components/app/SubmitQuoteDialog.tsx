/**
 * SubmitQuoteDialog.tsx — Phase 3
 * Supplier submits a quotation for a buyer's RFQ.
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X, IndianRupee, Truck, CreditCard, FileText, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { submitQuote } from "@/lib/quote-service";
import { useAuth } from "@/lib/auth";
import type { MarketplaceRfq } from "@/lib/rfq-marketplace-service";

const DELIVERY_TERMS = [
  "Ex Works (EXW)",
  "FOR Destination",
  "CIF (Cost, Insurance, Freight)",
  "FOB",
  "Door Delivery",
  "Depot / Warehouse Pickup",
];

const PAYMENT_TERMS_OPTIONS = [
  "100% Advance",
  "50% Advance, 50% on Delivery",
  "30% Advance, 70% on Delivery",
  "Net 15 Days",
  "Net 30 Days",
  "Net 45 Days",
  "LC (Letter of Credit)",
  "COD",
];

interface Props {
  rfq: MarketplaceRfq;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubmitQuoteDialog({ rfq, open, onClose, onSuccess }: Props) {
  const { user, company } = useAuth();

  const [unitPrice, setUnitPrice]             = useState("");
  const [currency, setCurrency]               = useState("INR");
  const [priceValidityDays, setPriceValidity] = useState("30");
  const [leadTimeDays, setLeadTime]           = useState("");
  const [deliveryTerms, setDeliveryTerms]     = useState("");
  const [paymentTerms, setPaymentTerms]       = useState("");
  const [specsOffered, setSpecsOffered]       = useState("");
  const [notes, setNotes]                     = useState("");
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [done, setDone]                       = useState(false);

  const sym = currency === "INR" ? "₹" : "$";
  const totalPrice =
    unitPrice && rfq.quantity
      ? (parseFloat(unitPrice) * rfq.quantity).toFixed(2)
      : null;

  async function handleSubmit() {
    if (!user || !company) return;
    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      setError("Enter a valid unit price.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitQuote({
        rfqId:                 rfq.id,
        supplierCompanyId:     company.id,
        userId:                user.id,
        unitPrice:             parseFloat(unitPrice),
        currency,
        totalPrice:            totalPrice ? parseFloat(totalPrice) : undefined,
        priceValidityDays:     parseInt(priceValidityDays) || 30,
        leadTimeDays:          leadTimeDays ? parseInt(leadTimeDays) : undefined,
        deliveryTerms:         deliveryTerms || undefined,
        paymentTerms:          paymentTerms  || undefined,
        specificationsOffered: specsOffered  || undefined,
        notes:                 notes         || undefined,
      });
      setDone(true);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit quote.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setUnitPrice(""); setCurrency("INR"); setPriceValidity("30");
    setLeadTime(""); setDeliveryTerms(""); setPaymentTerms("");
    setSpecsOffered(""); setNotes(""); setSubmitting(false);
    setError(null); setDone(false);
    onClose();
  }

  if (!open || typeof document === "undefined") return null;

  if (done) {
    return createPortal(
      <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <button type="button" className="absolute inset-0 bg-[#071d35]/55 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative z-10 w-full max-w-sm rounded-t-2xl border border-border bg-white p-8 text-center shadow-2xl sm:rounded-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5f0]">
            <CheckCircle2 className="h-9 w-9 text-[#176b5a]" />
          </div>
          <h2 className="text-xl font-bold text-[#13263d]">Quote Submitted!</h2>
          <p className="mt-2 text-sm text-[#607186]">
            Your quotation for <strong>{rfq.product_name}</strong> has been sent to the buyer.
          </p>
          <div className="mt-4 rounded-xl border border-[#e3eaf3] bg-[#f6f9fd] px-4 py-3 text-left text-xs text-[#43566d]">
            <div className="flex justify-between">
              <span>Unit Price</span>
              <strong>{sym}{parseFloat(unitPrice).toLocaleString("en-IN")}</strong>
            </div>
            {totalPrice && (
              <div className="mt-1 flex justify-between">
                <span>Total</span>
                <strong>{sym}{parseFloat(totalPrice).toLocaleString("en-IN")}</strong>
              </div>
            )}
          </div>
          <Button variant="supplier" className="mt-5 w-full" onClick={handleClose}>Done</Button>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-[#071d35]/55 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl">

        {/* Header */}
        <div className="shrink-0 flex items-start gap-3 border-b border-[#f0f4f8] px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5f0]">
            <IndianRupee className="h-5 w-5 text-[#176b5a]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#17283d]">Submit Quotation</p>
            <p className="truncate text-xs text-[#8fa5bc]">
              {rfq.rfq_number} · {rfq.product_name} · {Number(rfq.quantity).toLocaleString("en-IN")} {rfq.unit}
            </p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-lg p-1.5 text-[#8fa5bc] hover:bg-[#f3f4f6]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-5">

          {/* Pricing section */}
          <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8095ab]">
              <IndianRupee className="h-3 w-3" /> Pricing
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#56677a]">
                  Unit Price <span className="text-[#d9534f]">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-20 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ INR</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="e.g. 850"
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#56677a]">Total (auto-calculated)</Label>
                <div className="flex h-9 items-center rounded-md border border-[#e5e7eb] bg-white px-3 text-sm font-semibold text-[#1a7a5e]">
                  {totalPrice
                    ? `${sym}${parseFloat(totalPrice).toLocaleString("en-IN")}`
                    : <span className="text-[#c0cad5]">—</span>}
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#56677a]">Price Valid for (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={priceValidityDays}
                  onChange={(e) => setPriceValidity(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Delivery section */}
          <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
            <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8095ab]">
              <Truck className="h-3 w-3" /> Delivery
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#56677a]">Lead Time (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTime(e.target.value)}
                  placeholder="e.g. 7"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#56677a]">Delivery Terms</Label>
                <Select value={deliveryTerms} onValueChange={setDeliveryTerms}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {DELIVERY_TERMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Payment terms */}
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#17283d]">
              <CreditCard className="h-3.5 w-3.5 text-[#176b5a]" /> Payment Terms
            </Label>
            <Select value={paymentTerms} onValueChange={setPaymentTerms}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="Select payment terms…" /></SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* What you're offering */}
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#17283d]">
              <FileText className="h-3.5 w-3.5 text-[#176b5a]" /> What exactly are you offering?
            </Label>
            <textarea
              rows={3}
              value={specsOffered}
              onChange={(e) => setSpecsOffered(e.target.value)}
              placeholder="e.g. Fe 500D TMT bars, 12mm dia, TATA Tiscon branded, IS 1786 certified, mill test certificate included…"
              className="w-full resize-none rounded-xl border border-[#d1d5db] px-3 py-2.5 text-sm outline-none transition focus:border-[#176b5a] focus:ring-2 focus:ring-[#176b5a]/20"
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="mb-1.5 block text-sm font-semibold text-[#17283d]">Additional Notes</Label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Warranty, after-sales service, certifications, packing details…"
              className="w-full resize-none rounded-xl border border-[#d1d5db] px-3 py-2.5 text-sm outline-none transition focus:border-[#176b5a] focus:ring-2 focus:ring-[#176b5a]/20"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[#fff5f5] px-3 py-2 text-xs text-[#d9534f]">⚠ {error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-[#e8edf3] bg-[#f8fafc] px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button>
          <Button type="button" variant="supplier" onClick={handleSubmit} disabled={submitting} className="gap-2">
            {submitting
              ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Submitting…</>
              : "Submit Quote →"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
