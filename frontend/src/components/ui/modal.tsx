import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] grid place-items-end p-0 sm:place-items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#071d35]/55 backdrop-blur-sm"
        aria-label="Close modal"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative z-10 max-h-[90vh] w-full overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl sm:max-w-lg sm:rounded-2xl",
          className,
        )}
      >
        <header className="flex items-start gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-bold text-foreground">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm leading-5 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close modal">
            <X />
          </Button>
        </header>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <footer className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>,
    document.body,
  );
}
