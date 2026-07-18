import { useState, useRef, useId, isValidElement, cloneElement, lazy, Suspense, type ReactNode, type DragEvent, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { createRfq, type CreatedRfq } from "@/lib/rfq-service";
import {
  X,
  Plus,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Globe,
  Lock,
  Users,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Package,
  Calendar,
  ClipboardList,
  AlertCircle,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { rfqCategories, rfqCategoryGroups } from "@/components/app/rfq-categories";
const DatePickerField = lazy(() =>
  import("@/components/ui/DatePickerField").then((m) => ({ default: m.DatePickerField }))
);



/* ─── Types ─────────────────────────────────────────────────── */
type Visibility = "public" | "private" | "selected";

interface RfqFormData {
  category: string;
  productName: string;
  quantity: string;
  unit: string;
  deliveryLocation: string;
  expectedDeliveryDate: string;
  specifications: string;
  visibility: Visibility;
  selectedSuppliers: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

interface FieldError {
  [key: string]: string;
}

/* ─── Visibility card ────────────────────────────────────────── */
const visibilityOptions: {
  value: Visibility;
  label: string;
  description: string;
  icon: typeof Globe;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: "public",
    label: "Public",
    description: "All verified suppliers on ProcureGrid can view & quote",
    icon: Globe,
    color: "text-[#1d6fa4]",
    bg: "bg-[#edf4fb]",
    border: "border-[#1d6fa4]",
  },
  {
    value: "private",
    label: "Private",
    description: "Only you can see this RFQ — save as draft",
    icon: Lock,
    color: "text-[#5e4a9f]",
    bg: "bg-[#f3f0fd]",
    border: "border-[#5e4a9f]",
  },
  {
    value: "selected",
    label: "Selected Suppliers",
    description: "Send to specific suppliers you choose",
    icon: Users,
    color: "text-[#1a7a5e]",
    bg: "bg-[#edf7f3]",
    border: "border-[#1a7a5e]",
  },
];

const units = ["Pcs", "Kg", "Tons", "Litres", "Metres", "Boxes", "Sets", "Pairs", "Rolls", "Bags"];

/* ─── Helpers ────────────────────────────────────────────────── */
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function validate(data: RfqFormData): FieldError {
  const errors: FieldError = {};
  if (!data.category) errors.category = "Please select a category.";
  if (!data.productName.trim()) errors.productName = "Product name is required.";
  if (!data.quantity.trim()) errors.quantity = "Quantity is required.";
  else if (isNaN(Number(data.quantity)) || Number(data.quantity) <= 0)
    errors.quantity = "Enter a valid positive number.";
  if (!data.deliveryLocation.trim()) errors.deliveryLocation = "Delivery location is required.";
  if (!data.expectedDeliveryDate) errors.expectedDeliveryDate = "Expected delivery date is required.";
  else {
    const d = new Date(data.expectedDeliveryDate);
    if (d < new Date()) errors.expectedDeliveryDate = "Date must be in the future.";
  }
  if (!data.specifications.trim()) errors.specifications = "Specifications are required.";
  if (data.visibility === "selected" && !data.selectedSuppliers.trim())
    errors.selectedSuppliers = "Please enter at least one supplier name or email.";
  return errors;
}

/* ─── Field wrapper ──────────────────────────────────────────── */
function FormField({
  label,
  required,
  error,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  icon?: typeof Package;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-[#253a52]">
        {Icon && <Icon className="h-3.5 w-3.5 text-[#1d5b91]" />}
        {label}
        {required && <span className="text-[#d9534f]">*</span>}
      </Label>
      {isValidElement(children)
        ? cloneElement(children as ReturnType<typeof cloneElement> & { props: { id?: string } }, { id })
        : children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-[#d9534f]">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Main dialog ────────────────────────────────────────────── */
export function CreateRfqDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<RfqFormData>({
    category: "",
    productName: "",
    quantity: "",
    unit: "Pcs",
    deliveryLocation: "",
    expectedDeliveryDate: "",
    specifications: "",
    visibility: "public",
    selectedSuppliers: "",
  });
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileObjectsRef = useRef<Map<string, File>>(new Map());
  const [errors, setErrors] = useState<FieldError>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdRfq, setCreatedRfq] = useState<CreatedRfq | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, company } = useAuth();

  const todayStr = new Date().toISOString().split("T")[0];

  function set(field: keyof RfqFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const added: UploadedFile[] = [];
    Array.from(incoming).forEach((file) => {
      if (files.length + added.length >= 5) return;
      const id = `${file.name}-${file.size}-${Date.now()}`;
      const item: UploadedFile = { id, name: file.name, size: file.size, type: file.type };
      if (file.type.startsWith("image/")) {
        item.preview = URL.createObjectURL(file);
      }
      fileObjectsRef.current.set(id, file);
      added.push(item);
    });
    setFiles((f) => [...f, ...added]);
  }

  function removeFile(id: string) {
    fileObjectsRef.current.delete(id);
    setFiles((f) => f.filter((x) => x.id !== id));
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!user || !company) {
      setSubmitError("You must be logged in with a company to post an RFQ.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fileObjects = files
        .map((f) => fileObjectsRef.current.get(f.id))
        .filter((f): f is File => f !== undefined);

      const result = await createRfq({
        companyId:            company.id,
        userId:               user.id,
        category:             form.category,
        productName:          form.productName,
        quantity:             Number(form.quantity),
        unit:                 form.unit,
        deliveryLocation:     form.deliveryLocation,
        expectedDeliveryDate: form.expectedDeliveryDate,
        specifications:       form.specifications,
        visibility:           form.visibility,
        selectedSuppliers:    form.selectedSuppliers || undefined,
        files:                fileObjects,
      });
      setCreatedRfq(result);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to post RFQ. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm({ category: "", productName: "", quantity: "", unit: "Pcs", deliveryLocation: "", expectedDeliveryDate: "", specifications: "", visibility: "public", selectedSuppliers: "" });
    setFiles([]);
    fileObjectsRef.current.clear();
    setErrors({});
    setSubmitError(null);
    setCreatedRfq(null);
    onClose();
  }

  if (!open || typeof document === "undefined") return null;

  /* ── Success state ──────────────────────────────────────────── */
  if (createdRfq) {
    return createPortal(
      <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <button type="button" className="absolute inset-0 bg-[#071d35]/55 backdrop-blur-sm" onClick={handleReset} aria-label="Close" />
        <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-border bg-white p-8 text-center shadow-2xl sm:rounded-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5e9]">
            <CheckCircle2 className="h-9 w-9 text-[#2e7d32]" />
          </div>
          <h2 className="text-xl font-bold text-[#13263d]">RFQ Posted Successfully!</h2>
          <p className="mt-1 text-xs font-mono text-[#8fa5bc]">{createdRfq.rfq_number}</p>
          <p className="mt-2 text-sm text-[#607186]">
            Your requirement for <span className="font-semibold text-[#1d5b91]">{createdRfq.product_name}</span> has been submitted. Suppliers will start quoting shortly.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#e3eaf3] bg-[#f6f9fd] px-4 py-3 text-xs text-[#43566d]">
            <FileText className="h-4 w-4 text-[#1d5b91]" />
            <span>Visibility: <strong className="capitalize">{createdRfq.visibility}</strong></span>
            <span className="text-[#c0cad5]">·</span>
            <span>Qty: <strong>{createdRfq.quantity} {createdRfq.unit}</strong></span>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="buyer" onClick={handleReset}>
              Done
            </Button>
            <Button variant="outline" onClick={() => { setCreatedRfq(null); setSubmitError(null); setForm({ category: "", productName: "", quantity: "", unit: "Pcs", deliveryLocation: "", expectedDeliveryDate: "", specifications: "", visibility: "public", selectedSuppliers: "" }); setFiles([]); fileObjectsRef.current.clear(); setErrors({}); }}>
              Post Another RFQ
            </Button>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  /* ── Form ───────────────────────────────────────────────────── */
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-[#071d35]/55 backdrop-blur-sm" onClick={onClose} aria-label="Close" />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative z-10 flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start gap-4 border-b border-[#e8edf3] bg-gradient-to-r from-[#071d35] to-[#0f3562] px-5 py-4 text-white sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold tracking-tight">Post a Requirement / RFQ</h2>
            <p className="mt-0.5 text-xs text-white/65">Fill in the details below — suppliers will quote their best prices.</p>
          </div>
          <Button type="button" variant="ghost" size="iconSm" onClick={onClose} className="text-white/70 hover:bg-white/15 hover:text-white" aria-label="Close">
            <X />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-5">

            {/* Section: Product Details */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7b8ea3]">
                <span className="h-px flex-1 bg-[#e8edf3]" />
                Product Details
                <span className="h-px flex-1 bg-[#e8edf3]" />
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField label="Category" required error={errors.category} icon={LayoutGrid}>
                    <Select value={form.category} onValueChange={(v) => set("category", v)}>
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          errors.category ? "border-[#d9534f]" : "",
                        )}
                      >
                        <SelectValue placeholder="Select a B2B category…" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {rfqCategoryGroups.map((group) => (
                          <SelectGroup key={group}>
                            <SelectLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8fa5bc]">
                              {group}
                            </SelectLabel>
                            {rfqCategories
                              .filter((c) => c.group === group)
                              .map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Product Name" required error={errors.productName} icon={Package}>
                    <Input
                      value={form.productName}
                      onChange={(e) => set("productName", e.target.value)}
                      placeholder="e.g. Stainless Steel Sheets 304 Grade"
                      className={errors.productName ? "border-[#d9534f] focus-visible:border-[#d9534f]" : ""}
                    />
                  </FormField>
                </div>

                <FormField label="Quantity" required error={errors.quantity}>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(e) => set("quantity", e.target.value)}
                      placeholder="100"
                      className={cn("flex-1", errors.quantity ? "border-[#d9534f]" : "")}
                    />
                    <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
                      <SelectTrigger className="w-24 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </FormField>

                <FormField label="Expected Delivery Date" required error={errors.expectedDeliveryDate} icon={Calendar}>
                  <Suspense fallback={
                    <div className="h-9 w-full animate-pulse rounded-md border border-input bg-muted" />
                  }>
                    <DatePickerField
                      value={form.expectedDeliveryDate}
                      onChange={(v) => set("expectedDeliveryDate", v)}
                      minDate={todayStr}
                      error={errors.expectedDeliveryDate}
                      placeholder="Pick a delivery date"
                    />
                  </Suspense>
                </FormField>

                <div className="sm:col-span-2">
                  <FormField label="Delivery Location" required error={errors.deliveryLocation} icon={MapPin}>
                    <Input
                      value={form.deliveryLocation}
                      onChange={(e) => set("deliveryLocation", e.target.value)}
                      placeholder="e.g. Mumbai, Maharashtra — Warehouse 4B"
                      className={errors.deliveryLocation ? "border-[#d9534f]" : ""}
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Specifications / Requirements" required error={errors.specifications} icon={ClipboardList}>
                    <Textarea
                      rows={4}
                      value={form.specifications}
                      onChange={(e) => set("specifications", e.target.value)}
                      placeholder="Describe material grade, dimensions, tolerances, certifications, packaging, or any other technical requirements..."
                      className={errors.specifications ? "border-[#d9534f]" : ""}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Section: Supporting Documents */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7b8ea3]">
                <span className="h-px flex-1 bg-[#e8edf3]" />
                Supporting Documents
                <span className="h-px flex-1 bg-[#e8edf3]" />
              </p>

              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "cursor-pointer rounded-xl border-2 border-dashed px-5 py-6 text-center transition-colors",
                  isDragging
                    ? "border-[#1d5b91] bg-[#edf4fb]"
                    : "border-[#d3dce8] bg-[#f8fafc] hover:border-[#1d5b91] hover:bg-[#f0f6fd]",
                )}
              >
                <Upload className={cn("mx-auto h-8 w-8", isDragging ? "text-[#1d5b91]" : "text-[#8fa5bc]")} />
                <p className="mt-2 text-sm font-medium text-[#38506c]">
                  {isDragging ? "Drop files here" : "Click to upload or drag & drop"}
                </p>
                <p className="mt-1 text-xs text-[#8fa5bc]">PDF, DOCX, PNG, JPG · Max 5 files · 10 MB each</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />

              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f) => (
                    <li key={f.id} className="flex items-center gap-3 rounded-lg border border-[#e3eaf3] bg-white px-3 py-2.5">
                      {f.preview ? (
                        <img src={f.preview} alt={f.name} className="h-9 w-9 rounded-md object-cover" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#edf4fb] text-[#1d5b91]">
                          {f.type.startsWith("image/") ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-[#253a52]">{f.name}</span>
                        <span className="text-[10px] text-[#8fa5bc]">{formatBytes(f.size)}</span>
                      </span>
                      <button type="button" onClick={() => removeFile(f.id)} className="rounded-md p-1 text-[#8fa5bc] hover:bg-[#fdecea] hover:text-[#d9534f]" aria-label="Remove file">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Section: RFQ Visibility */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7b8ea3]">
                <span className="h-px flex-1 bg-[#e8edf3]" />
                RFQ Visibility
                <span className="h-px flex-1 bg-[#e8edf3]" />
              </p>

              <RadioGroup
                value={form.visibility}
                onValueChange={(v) => set("visibility", v as Visibility)}
                className="grid gap-3 sm:grid-cols-3"
              >
                {visibilityOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = form.visibility === opt.value;
                  return (
                    <Label
                      key={opt.value}
                      htmlFor={`vis-${opt.value}`}
                      className={cn(
                        "flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition-all",
                        active ? `${opt.border} ${opt.bg}` : "border-[#e0e8f0] bg-white hover:border-[#b8cfe4]",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", active ? opt.bg : "bg-[#f0f4f8]")}>
                          <Icon className={cn("h-4 w-4", active ? opt.color : "text-[#6b7d90]")} />
                        </span>
                        <RadioGroupItem value={opt.value} id={`vis-${opt.value}`} />
                      </div>
                      <span className={cn("text-sm font-semibold", active ? opt.color : "text-[#253a52]")}>{opt.label}</span>
                      <span className="text-[11px] leading-4 text-[#7b8ea3]">{opt.description}</span>
                      {opt.value === "public" && <span className="mt-0.5 self-start rounded-full bg-[#1d5b91]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1d5b91]">Default</span>}
                    </Label>
                  );
                })}
              </RadioGroup>

              {form.visibility === "selected" && (
                <div className="mt-3">
                  <FormField label="Supplier Names / Emails" required error={errors.selectedSuppliers} icon={Users}>
                    <Textarea
                      rows={2}
                      value={form.selectedSuppliers}
                      onChange={(e) => set("selectedSuppliers", e.target.value)}
                      placeholder="Enter supplier names or emails, separated by commas..."
                      className={errors.selectedSuppliers ? "border-[#d9534f]" : ""}
                    />
                  </FormField>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#e8edf3] bg-[#f8fafc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="subtle" disabled={submitting} onClick={() => { /* save draft — future */ }}>
              Save as Draft
            </Button>
            <Button type="submit" variant="buyer" disabled={submitting} className="gap-2">
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Posting…</>
              ) : (
                <>Post RFQ <ChevronRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
        {submitError && (
          <div className="shrink-0 border-t border-[#fde8e8] bg-[#fff5f5] px-5 py-3 sm:px-6">
            <p className="flex items-center gap-2 text-xs text-[#d9534f]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {submitError}
            </p>
          </div>
        )}
      </form>
    </div>,
    document.body,
  );
}
