// components/UnifiedFAB.tsx
"use client";
import { Plus } from "lucide-react";

interface UnifiedFABProps {
  onClick: () => void;
  label?: string;
}

export default function UnifiedFAB({ onClick, label = "Crear" }: UnifiedFABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 w-16 h-16 bg-pr-red hover:bg-red-600 active:bg-red-700 transition-all rounded-full flex items-center justify-center shadow-2xl shadow-pr-red/40 active:scale-95 border-4 border-zinc-950"
      aria-label={label}
    >
      <Plus className="w-8 h-8 text-white" />
    </button>
  );
}