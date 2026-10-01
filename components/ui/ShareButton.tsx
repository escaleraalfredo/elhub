// components/ui/ShareButton.tsx
// Share sheet with WhatsApp and Facebook first (where Puerto Ricans talk),
// plus copy link and the phone's own share menu.
"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import BottomSheet from "./BottomSheet";
import { award } from "@/lib/points";
import { cn } from "@/lib/utils";

export function shareUrl(path?: string) {
  if (typeof window === "undefined") return path ?? "";
  if (!path) return window.location.href;
  return path.startsWith("http") ? path : `${window.location.origin}${path}`;
}

export default function ShareButton({
  title,
  text,
  url,
  pointsKey,
  className,
  label,
}: {
  title: string;
  text?: string;
  /** Absolute URL or app path; defaults to the current page. */
  url?: string;
  /** Once-per-item key for share points. */
  pointsKey?: string;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const link = () => shareUrl(url);
  const message = () => [title, text, link()].filter(Boolean).join("\n");
  const done = () => {
    award("share", { key: pointsKey ?? link() });
    setOpen(false);
  };

  const options = [
    {
      name: "WhatsApp",
      color: "bg-[#25D366]",
      glyph: "W",
      go: () => window.open(`https://wa.me/?text=${encodeURIComponent(message())}`, "_blank", "noopener"),
    },
    {
      name: "Facebook",
      color: "bg-[#1877F2]",
      glyph: "f",
      go: () =>
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link())}`, "_blank", "noopener"),
    },
    {
      name: "X",
      color: "bg-black",
      glyph: "𝕏",
      go: () =>
        window.open(
          `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(link())}`,
          "_blank",
          "noopener"
        ),
    },
  ];

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Compartir"
        className={cn("flex items-center gap-1.5 text-zinc-400 hover:text-ink", className)}
      >
        <Share2 className="w-5 h-5" />
        {label && <span className="text-sm">{label}</span>}
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Compartir">
        <div className="p-4 space-y-4">
          <p className="text-sm text-zinc-400 line-clamp-2">{title}</p>
          <div className="grid grid-cols-4 gap-3">
            {options.map((o) => (
              <button
                key={o.name}
                onClick={() => {
                  o.go();
                  done();
                }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className={cn("w-14 h-14 rounded-full text-white text-2xl font-bold flex items-center justify-center", o.color)}>
                  {o.glyph}
                </span>
                <span className="text-xs text-zinc-300">{o.name}</span>
              </button>
            ))}
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link());
                  toast.success("Enlace copiado");
                  done();
                } catch {
                  toast.error("No se pudo copiar");
                }
              }}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
                <Copy className="w-6 h-6" />
              </span>
              <span className="text-xs text-zinc-300">Copiar</span>
            </button>
          </div>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={async () => {
                try {
                  await navigator.share({ title, text, url: link() });
                  done();
                } catch {
                  // cancelled
                }
              }}
              className="w-full rounded-lg bg-zinc-800 py-3 text-sm font-semibold"
            >
              Más opciones…
            </button>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
