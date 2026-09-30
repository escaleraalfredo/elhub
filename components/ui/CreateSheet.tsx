// components/ui/CreateSheet.tsx
"use client";

import BottomSheet from "./BottomSheet";

/** Bottom sheet with a primary action button, used for every "create" form. */
export default function CreateSheet({
  open,
  onClose,
  title,
  actionLabel,
  onAction,
  hint,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  actionLabel: string;
  onAction: () => void;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="p-4">
          <button
            onClick={onAction}
            className="w-full bg-accent-gradient text-white transition-all py-3.5 rounded-2xl font-semibold active:scale-[0.99]"
          >
            {actionLabel}
          </button>
          {hint && <p className="text-center text-xs text-zinc-500 mt-2">{hint}</p>}
        </div>
      }
    >
      <div className="p-4 space-y-4">{children}</div>
    </BottomSheet>
  );
}

export const inputClass =
  "w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-[15px] text-ink placeholder-zinc-500 focus:outline-none focus:border-brand";
