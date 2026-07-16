

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import dayjs, { type Dayjs } from "dayjs";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const rfqCalendarTheme = createTheme({
  palette: {
    primary: {
      main: "#1d5b91",
      light: "#2d7ab8",
      dark: "#0e3a61",
      contrastText: "#ffffff",
    },
  },
  typography: {
    fontFamily:
      "Inter, 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
});


// ── Component ─────────────────────────────────────────────────

interface DatePickerFieldProps {
  value: string;           // "YYYY-MM-DD" or ""
  onChange: (v: string) => void;
  minDate?: string;        // "YYYY-MM-DD"
  error?: string;
  placeholder?: string;
  id?: string;
}

export function DatePickerField({
  value,
  onChange,
  minDate,
  error,
  placeholder = "Select a date",
  id,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  const dayjsValue: Dayjs | null = value ? dayjs(value) : null;
  const dayjsMin: Dayjs | undefined = minDate ? dayjs(minDate) : undefined;

  // Position popover below trigger
  function positionPopover() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverHeight = 360;

    if (spaceBelow >= popoverHeight + 8) {
      setPopoverStyle({
        top:  rect.bottom + window.scrollY + 6,
        left: rect.left  + window.scrollX,
      });
    } else {
      setPopoverStyle({
        top:  rect.top + window.scrollY - popoverHeight - 6,
        left: rect.left + window.scrollX,
      });
    }
  }

  function handleOpen() {
    positionPopover();
    setOpen(true);
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !popoverRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Reposition on scroll / resize
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", positionPopover, true);
    window.addEventListener("resize", positionPopover);
    return () => {
      window.removeEventListener("scroll", positionPopover, true);
      window.removeEventListener("resize", positionPopover);
    };
  }, [open]);

  function handleDaySelect(day: Dayjs | null) {
    if (!day) return;
    onChange(day.format("YYYY-MM-DD"));
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
  }

  const displayValue = dayjsValue
    ? dayjsValue.format("DD MMM YYYY")
    : null;

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1d5b91]",
          error
            ? "border-[#d9534f] text-[#d9534f]"
            : open
              ? "border-[#1d5b91] ring-1 ring-[#1d5b91]"
              : "border-input hover:border-[#1d5b91]/50",
          !displayValue && "text-muted-foreground",
        )}
      >
        <span className={cn("flex items-center gap-2", !displayValue && "text-[#a0aec0]")}>
          <CalendarDays className={cn("h-4 w-4 shrink-0", displayValue ? "text-[#1d5b91]" : "text-[#a0aec0]")} />
          <span>{displayValue ?? placeholder}</span>
        </span>

        {displayValue ? (
          <X
            className="h-3.5 w-3.5 text-[#8095ab] hover:text-[#d9534f] transition-colors"
            onClick={handleClear}
          />
        ) : (
          <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90", "text-[#8095ab]")} />
        )}
      </button>

      {/* Calendar popover */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={popoverRef}
          style={{ ...popoverStyle, position: "absolute", zIndex: 9999, width: 320 }}
          className="rounded-2xl border border-[#dce8f5] bg-white shadow-[0_8px_40px_-8px_rgba(13,40,75,0.22)] overflow-hidden"
        >
          {/* Popover header */}
          <div className="flex items-center justify-between border-b border-[#edf3f9] bg-[#f5f9fd] px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6e8095]">
              Select Date
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#8095ab] hover:bg-[#e4eef8] hover:text-[#1d5b91] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* MUI Calendar */}
          <ThemeProvider theme={rfqCalendarTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={dayjsValue}
                onChange={handleDaySelect}
                minDate={dayjsMin}
                disablePast
                showDaysOutsideCurrentMonth={false}
                slots={{
                  leftArrowIcon:  () => <ChevronLeft  className="h-4 w-4" />,
                  rightArrowIcon: () => <ChevronRight className="h-4 w-4" />,
                }}
                sx={{
                  width: "100%",
                  maxHeight: "none",
                  backgroundColor: "transparent",
                  // Calendar header
                  "& .MuiPickersCalendarHeader-root": { pt: "12px", pb: "4px", px: 2, color: "#13263d" },
                  "& .MuiPickersCalendarHeader-label": { fontWeight: 700, fontSize: "0.9rem", color: "#13263d" },
                  // Nav arrows
                  "& .MuiPickersArrowSwitcher-button": { color: "#1d5b91", "&:hover": { backgroundColor: "#eaf3fc" } },
                  // Weekday labels
                  "& .MuiDayCalendar-weekDayLabel": { color: "#8095ab", fontWeight: 600, fontSize: "0.7rem" },
                  "& .MuiDayCalendar-header": { px: 1 },
                  "& .MuiDayCalendar-monthContainer": { px: 1, pb: 1 },
                  // Day cells
                  "& .MuiPickersDay-root": {
                    fontSize: "0.82rem", fontWeight: 500, color: "#253a52", borderRadius: "8px",
                    "&:hover": { backgroundColor: "#eaf3fc", color: "#1d5b91" },
                    "&.Mui-selected": { backgroundColor: "#1d5b91 !important", color: "#fff !important", fontWeight: 700 },
                    "&.MuiPickersDay-today:not(.Mui-selected)": { border: "1.5px solid #1d5b91", color: "#1d5b91", fontWeight: 700, backgroundColor: "#f0f7ff" },
                    "&.Mui-disabled": { color: "#c8d6e4" },
                  },
                  // Year picker
                  "& .MuiPickersYear-yearButton": { borderRadius: "8px", fontSize: "0.85rem",
                    "&.Mui-selected": { backgroundColor: "#1d5b91 !important", color: "#fff" },
                  },
                }}
              />
            </LocalizationProvider>
          </ThemeProvider>

          {/* Footer */}
          {dayjsValue && (
            <div className="border-t border-[#edf3f9] bg-[#f5f9fd] px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1d5b91]">
                {dayjsValue.format("dddd, DD MMMM YYYY")}
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] font-semibold text-[#8095ab] hover:text-[#d9534f] transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
