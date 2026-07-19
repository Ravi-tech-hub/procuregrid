/**
 * MultiAttributeChipGroup.tsx
 * Like AttributeChipGroup but allows MULTIPLE values per attribute.
 * Used in supplier catalog — supplier selects ALL variants they can supply.
 */
import { useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AttributeDefinition } from "@/components/app/rfq-product-data";

interface Props {
  definition: AttributeDefinition;
  values: string[];              // array of selected values
  onChange: (vals: string[]) => void;
}

export function MultiAttributeChipGroup({ definition, values, onChange }: Props) {
  const [otherText, setOtherText] = useState("");
  const [showOther, setShowOther] = useState(false);

  function toggle(option: string) {
    const next = values.includes(option)
      ? values.filter((v) => v !== option)
      : [...values, option];
    onChange(next);
  }

  function handleOtherToggle() {
    setShowOther((p) => !p);
    if (otherText.trim() && !values.includes(`__other__:${otherText}`)) {
      onChange([...values, `__other__:${otherText}`]);
    }
  }

  function handleOtherInput(text: string) {
    const prev = `__other__:${otherText}`;
    const next  = `__other__:${text}`;
    setOtherText(text);
    onChange([...values.filter((v) => v !== prev), ...(text.trim() ? [next] : [])]);
  }

  const hasOther = values.some((v) => v.startsWith("__other__:"));

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-semibold text-[#17283d]">
        {definition.label}
        <span className="ml-2 text-[10px] font-normal text-[#8fa5bc]">Select all you can supply</span>
      </p>

      <div className="flex flex-wrap gap-2">
        {definition.options?.map((option) => {
          const selected = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150",
                selected
                  ? "border-[#1a7a5e] bg-[#edf7f3] text-[#1a7a5e]"
                  : "border-[#d1d5db] bg-white text-[#374151] hover:border-[#1a7a5e] hover:text-[#1a7a5e]",
              )}
            >
              {selected && <Check className="h-3 w-3" />}
              {option}
            </button>
          );
        })}

        {definition.allowOther && (
          <button
            type="button"
            onClick={handleOtherToggle}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150",
              hasOther
                ? "border-[#1a7a5e] bg-[#edf7f3] text-[#1a7a5e]"
                : "border-[#d1d5db] bg-white text-[#374151] hover:border-[#1a7a5e]",
            )}
          >
            Other…
          </button>
        )}
      </div>

      {showOther && (
        <Input
          autoFocus
          placeholder={`Add custom ${definition.label.toLowerCase()}…`}
          value={otherText}
          onChange={(e) => handleOtherInput(e.target.value)}
          className="max-w-xs text-sm"
        />
      )}

      {values.length > 0 && (
        <p className="text-[11px] text-[#1a7a5e]">
          ✓ {values.length} value{values.length > 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}
