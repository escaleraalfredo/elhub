// components/community/PollOptions.tsx
"use client";

import { Check } from "lucide-react";
import type { Poll } from "@/lib/community/data";
import { cn } from "@/lib/utils";

export function pollTotal(p: Poll) {
  return p.options.reduce((s, o) => s + o.votes, 0);
}

export default function PollOptions({ poll, onVote }: { poll: Poll; onVote: (optionId: number) => void }) {
  const total = pollTotal(poll);
  const voted = poll.userVote !== null;
  return (
    <div className="space-y-2">
      {poll.options.map((o) => {
        const pct = total ? Math.round((o.votes / total) * 100) : 0;
        const mine = poll.userVote === o.id;
        return (
          <button
            key={o.id}
            disabled={voted}
            onClick={(e) => {
              e.stopPropagation();
              onVote(o.id);
            }}
            className={cn(
              "relative w-full overflow-hidden rounded-2xl border text-left px-4 py-3 transition-colors",
              voted ? (mine ? "border-pr-red" : "border-zinc-800") : "border-zinc-700 hover:border-pr-red active:scale-[0.99]"
            )}
          >
            {voted && (
              <span
                className={cn("absolute inset-y-0 left-0 transition-all duration-500", mine ? "bg-pr-red/25" : "bg-zinc-800")}
                style={{ width: `${pct}%` }}
              />
            )}
            <span className="relative flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium">
                {o.text}
                {mine && <Check className="w-4 h-4 text-pr-red" />}
              </span>
              {voted && <span className="font-semibold tabular-nums text-zinc-300">{pct}%</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
