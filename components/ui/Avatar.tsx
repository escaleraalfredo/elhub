// components/ui/Avatar.tsx
import { cn } from "@/lib/utils";

const COLORS = [
  "bg-rose-600", "bg-sky-600", "bg-emerald-600", "bg-amber-600",
  "bg-violet-600", "bg-teal-600", "bg-fuchsia-600", "bg-indigo-600",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Round avatar: uses `src` when given, otherwise a colored initial. */
export default function Avatar({
  name,
  src,
  size = 32,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const clean = name.replace(/^@/, "");
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={clean}
        style={style}
        className={cn("rounded-full object-cover shrink-0 bg-zinc-800", className)}
      />
    );
  }
  return (
    <div
      style={style}
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center font-semibold text-white uppercase",
        COLORS[hash(clean) % COLORS.length],
        className
      )}
    >
      {clean.charAt(0) || "?"}
    </div>
  );
}
