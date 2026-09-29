// components/sports/TeamLogo.tsx
"use client";

import { useState } from "react";
import type { TeamRef } from "@/lib/sports/types";

/** Team logo image, or a colored circle with the abbreviation. */
export default function TeamLogo({ team, size = 28 }: { team: TeamRef; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (team.logo && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={team.logo}
        alt={team.abbr}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className="object-contain shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="rounded-full shrink-0 flex items-center justify-center font-black text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(8, Math.round(size * (team.abbr.length > 3 ? 0.26 : 0.34))),
        backgroundColor: `#${team.color ?? "3f3f46"}`,
      }}
    >
      {team.abbr}
    </span>
  );
}
