// components/ui/BottomSheet.tsx
"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/** Mobile bottom sheet with drag-down-to-close, Escape to close and scroll lock. */
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const startY = useRef<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null || !panel.current) return;
    const dy = Math.max(0, e.touches[0].clientY - startY.current);
    panel.current.style.transform = `translateY(${dy}px)`;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null || !panel.current) return;
    const dy = e.changedTouches[0].clientY - startY.current;
    panel.current.style.transform = "";
    startY.current = null;
    if (dy > 90) onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-zinc-900 rounded-t-3xl border-t border-zinc-800 flex flex-col max-h-[85dvh] transition-transform duration-150"
      >
        <div
          className="pt-2.5 pb-2 shrink-0 touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto" />
          {title && (
            <div className="relative mt-2 px-4">
              <h3 className="text-center font-semibold text-[15px]">{title}</h3>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <div className="border-t border-zinc-800 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
        {footer && (
          <div className="shrink-0 border-t border-zinc-800 pb-[env(safe-area-inset-bottom)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
