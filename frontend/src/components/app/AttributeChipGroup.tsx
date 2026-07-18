/**
 * AttributeChipGroup.tsx
 * Renders a labelled row of selectable chip buttons for a single RFQ spec attribute.
 * Single-select: clicking a chip selects it; clicking again deselects (toggles).
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { AttributeDefinition } from "@/components/app/rfq-product-data";

interface Props {
  definition: AttributeDefinition;
  value: string;
  onChange: (val: string) => void;
}

export function AttributeChipGroup({ definition, value, onChange }: Props) {
  const [otherText, setOtherText]     = useState("");
  const [showOther, setShowOther]     = useState(false);
  const isOtherSelected               = value === `__other__:${otherText}` || (value.startsWith("__other__:") && !definition.options?.includes(value));

  function handleChipClick(option: string) {
    // toggle: clicking selected chip deselects
    onChange(value === option ? "" : option);
    setShowOther(false);
  }

  function handleOtherClick() {
    setShowOther(true);
    if (!isOtherSelected) onChange(`__other__:${otherText}`);
  }

  function handleOtherInput(text: string) {
    setOtherText(text);
    onChange(`__other__:${text}`);
  }

  const selectedBg = "bg-[#edf7f3] border-[#1a7a5e] text-[#1a7a5e]";
  const defaultBg  = "bg-white border-[#d1d5db] text-[#374151] hover:border-[#1a7a5e] hover:text-[#1a7a5e]";

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-semibold text-[#17283d]">
        {definition.label}
        {definition.isRequired && <span className="ml-1 text-[#d9534f]">*</span>}
      </p>

      <div className="flex flex-wrap gap-2">
        {definition.options?.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleChipClick(option)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150",
                selected ? selectedBg : defaultBg,
              )}
            >
              {selected && (
                <span className="inline-block h-2 w-2 rounded-full bg-[#1a7a5e]" />
              )}
              {option}
            </button>
          );
        })}

        {definition.allowOther && (
          <button
            type="button"
            onClick={handleOtherClick}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150",
              isOtherSelected ? selectedBg : defaultBg,
            )}
          >
            Other…
          </button>
        )}
      </div>

      {showOther && (
        <Input
          autoFocus
          placeholder={`Enter custom ${definition.label.toLowerCase()}…`}
          value={otherText}
          onChange={(e) => handleOtherInput(e.target.value)}
          className="max-w-xs text-sm"
        />
      )}
    </div>
  );
}
