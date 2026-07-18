/**
 * SpecificationsStep.tsx — Step 2 of RFQ Wizard
 * Dynamic chip-based spec attributes OR free-text fallback for unknown products.
 * Image upload always shown at bottom.
 */
import { useEffect, useState, useRef } from "react";
import { Upload, Image as ImageIcon, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AttributeChipGroup } from "@/components/app/AttributeChipGroup";
import { cn } from "@/lib/utils";
import {
  getLocalAttributes,
  type AttributeDefinition,
} from "@/components/app/rfq-product-data";
import type { Step1Data } from "@/components/app/ProductSearchStep";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  fileObj: File;
}

export interface Step2Data {
  attributes: Record<string, string>;
  freeText: string;
  files: UploadedFile[];
}

interface Props {
  step1: Step1Data;
  data: Step2Data;
  onChange: (d: Step2Data) => void;
  onBack: () => void;
  onNext: () => void;
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

export function SpecificationsStep({ step1, data, onChange, onBack, onNext }: Props) {
  const [attrDefs, setAttrDefs] = useState<AttributeDefinition[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load attribute definitions for the selected product
  useEffect(() => {
    if (step1.productSlug) {
      setAttrDefs(getLocalAttributes(step1.productSlug));
    } else {
      setAttrDefs([]);
    }
  }, [step1.productSlug]);

  const hasTemplate = attrDefs.length > 0;

  function setAttr(key: string, val: string) {
    onChange({ ...data, attributes: { ...data.attributes, [key]: val } });
  }

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const added: UploadedFile[] = [];
    Array.from(incoming).forEach((file) => {
      if (data.files.length + added.length >= 5) return;
      const id = `${file.name}-${file.size}-${Date.now()}`;
      const item: UploadedFile = { id, name: file.name, size: file.size, type: file.type, fileObj: file };
      if (file.type.startsWith("image/")) item.preview = URL.createObjectURL(file);
      added.push(item);
    });
    onChange({ ...data, files: [...data.files, ...added] });
  }

  function removeFile(id: string) {
    onChange({ ...data, files: data.files.filter((f) => f.id !== id) });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="space-y-6">

          {/* ── Chip attributes (if template exists) ─────────────────── */}
          {hasTemplate && (
            <div className="space-y-5">
              {attrDefs.map((def) => (
                <AttributeChipGroup
                  key={def.attrKey}
                  definition={def}
                  value={data.attributes[def.attrKey] ?? ""}
                  onChange={(v) => setAttr(def.attrKey, v)}
                />
              ))}
            </div>
          )}

          {/* ── Free-text fallback (always shown for custom; also shown as "additional notes" for templated) ── */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#17283d]">
              {hasTemplate ? "Additional Notes / Specifications" : "Specifications / Requirements"}
              {!hasTemplate && <span className="ml-1 text-[#d9534f]">*</span>}
            </label>
            {!hasTemplate && (
              <p className="mb-2 text-xs text-[#8fa5bc]">
                Describe material, grade, dimensions, tolerances, certifications, or any other requirements.
              </p>
            )}
            <Textarea
              rows={hasTemplate ? 3 : 5}
              value={data.freeText}
              onChange={(e) => onChange({ ...data, freeText: e.target.value })}
              placeholder={
                hasTemplate
                  ? "Any additional requirements not covered above…"
                  : "e.g. Grade 304 SS, 2mm thick, 1000x2000mm sheet, mill-finish, IS 2062 certified…"
              }
              className="resize-none text-sm"
            />
          </div>

          {/* ── Image / Document upload ───────────────────────────────── */}
          <div>
            <p className="mb-2 text-sm font-semibold text-[#17283d]">
              Upload Reference Images / Documents
              <span className="ml-2 text-[11px] font-normal text-[#8fa5bc]">(optional, max 5)</span>
            </p>

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
              className={cn(
                "cursor-pointer rounded-xl border-2 border-dashed px-5 py-5 text-center transition-colors",
                isDragging ? "border-[#1d5b91] bg-[#edf4fb]" : "border-[#d3dce8] bg-[#f8fafc] hover:border-[#1d5b91] hover:bg-[#f0f6fd]",
              )}
            >
              <Upload className={cn("mx-auto h-7 w-7", isDragging ? "text-[#1d5b91]" : "text-[#8fa5bc]")} />
              <p className="mt-1.5 text-sm font-medium text-[#38506c]">
                {isDragging ? "Drop files here" : "Click to upload or drag & drop"}
              </p>
              <p className="mt-0.5 text-xs text-[#8fa5bc]">PDF, DOCX, PNG, JPG · Max 5 files · 10 MB each</p>
            </div>

            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />

            {data.files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {data.files.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 rounded-lg border border-[#e3eaf3] bg-white px-3 py-2">
                    {f.preview ? (
                      <img src={f.preview} alt={f.name} className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded bg-[#edf4fb] text-[#1d5b91]">
                        {f.type.startsWith("image/") ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-[#253a52]">{f.name}</span>
                      <span className="text-[10px] text-[#8fa5bc]">{formatBytes(f.size)}</span>
                    </span>
                    <button type="button" onClick={() => removeFile(f.id)} className="rounded p-1 text-[#8fa5bc] hover:bg-[#fdecea] hover:text-[#d9534f]">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex shrink-0 items-center justify-between border-t border-[#e8edf3] bg-[#f8fafc] px-5 py-4 sm:px-6">
        <Button type="button" variant="outline" onClick={onBack}>← Back</Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8fa5bc]">1 more step</span>
          <Button
            type="button"
            variant="buyer"
            onClick={onNext}
            disabled={!hasTemplate && !data.freeText.trim()}
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
