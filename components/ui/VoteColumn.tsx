// components/ui/VoteColumn.tsx
"use client";

import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vote } from "@/lib/community/data";

export function applyVote(votes: number, current: Vote, dir: "up" | "down"): { votes: number; userVote: Vote } {
  let v = votes;
  if (current === "up") v -= 1;
  if (current === "down") v += 1;
  if (current === dir) return { votes: v, userVote: null };
  return { votes: v + (dir === "up" ? 1 : -1), userVote: dir };
}

export default function VoteColumn({
  votes,
  userVote,
  onVote,
  horizontal = false,
}: {
  votes: number;
  userVote: Vote;
  onVote: (dir: "up" | "down") => void;
  horizontal?: boolean;
}) {
  return (
    <div className={cn("flex items-center", horizontal ? "gap-2" : "flex-col gap-0.5")}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onVote("up");
        }}
        aria-label="Voto positivo"
        className={cn("p-1 transition-colors", userVote === "up" ? "text-emerald-400" : "text-zinc-500 hover:text-white")}
      >
        <ArrowBigUp className={cn("w-6 h-6", userVote === "up" && "fill-current")} />
      </button>
      <span
        className={cn(
          "font-bold tabular-nums text-sm",
          userVote === "up" ? "text-emerald-400" : userVote === "down" ? "text-red-400" : "text-white"
        )}
      >
        {votes}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onVote("down");
        }}
        aria-label="Voto negativo"
        className={cn("p-1 transition-colors", userVote === "down" ? "text-red-400" : "text-zinc-500 hover:text-white")}
      >
        <ArrowBigDown className={cn("w-6 h-6", userVote === "down" && "fill-current")} />
      </button>
    </div>
  );
}
