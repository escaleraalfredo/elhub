// components/ui/Artwork.tsx
// Rich gradient artwork used when an item has no photo (or while it loads),
// so feeds look like an app instead of a list of boxes.
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const PALETTES: Record<string, [string, string]> = {
  conciertos: ["#ff3d7f", "#6d28d9"],
  entretenimiento: ["#f59e0b", "#e11d48"],
  juegos: ["#10b981", "#0369a1"],
  familia: ["#22d3ee", "#4f46e5"],
  festivales: ["#fb923c", "#db2777"],
  patronales: ["#facc15", "#b91c1c"],
  nocturna: ["#7c3aed", "#0f172a"],
  news: ["#334155", "#0f172a"],
  // News sections
  Local: ["#2f9bff", "#1e3a8a"],
  Política: ["#8b5cf6", "#312e81"],
  Economía: ["#10b981", "#065f46"],
  Salud: ["#22d3ee", "#0e7490"],
  Deportes: ["#fb923c", "#9a3412"],
  Diáspora: ["#f472b6", "#9d174d"],
};

export const SECTION_EMOJI: Record<string, string> = {
  Local: "🏝️",
  Política: "🏛️",
  Economía: "💵",
  Salud: "🩺",
  Deportes: "🏆",
  Diáspora: "✈️",
};
const FALLBACK: [string, string][] = [
  ["#ff5a4e", "#7c3aed"],
  ["#0ea5e9", "#1e3a8a"],
  ["#f97316", "#be123c"],
  ["#14b8a6", "#1d4ed8"],
  ["#e879f9", "#6d28d9"],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function Artwork({
  seed,
  kind,
  emoji,
  image,
  className,
}: {
  seed: string;
  kind?: string;
  emoji?: string;
  image?: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [a, b] = (kind && PALETTES[kind]) || FALLBACK[hash(seed) % FALLBACK.length];
  const angle = 120 + (hash(seed) % 60);
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(${angle}deg, ${a}, ${b})` }} />
      <div
        className="absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(circle at 80% 15%, rgba(255,255,255,0.35), transparent 45%)" }}
      />
      {emoji && (
        <span className="absolute -right-4 -bottom-6 text-[120px] leading-none opacity-30 rotate-[-12deg] select-none" aria-hidden>
          {emoji}
        </span>
      )}
      {image && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
        />
      )}
    </div>
  );
}
