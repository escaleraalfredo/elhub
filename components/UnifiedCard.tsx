// components/UnifiedCard.tsx
import React from "react";

interface UnifiedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function UnifiedCard({ children, className = "", onClick }: UnifiedCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all active:scale-[0.985] ${className}`}
    >
      {children}
    </div>
  );
}