// components/UnifiedFAB.tsx
"use client";
import { Plus } from "lucide-react";

interface UnifiedFABProps {
  onClick: () => void;
  label?: string;
}

/** The one floating "create" button used across the app, sitting above the bottom nav. */
export default function UnifiedFAB({ onClick, label = "Crear" }: UnifiedFABProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 w-14 h-14 bg-brand hover:brightness-110 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-xl shadow-brand/30"
    >
      <Plus className="w-7 h-7 text-white" />
    </button>
  );
}
