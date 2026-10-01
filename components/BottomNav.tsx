"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, LayoutGrid, Newspaper, Trophy } from "lucide-react";
import { useT, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: TKey; icon: typeof Home; match: string[] }[] = [
  { href: "/", label: "nav.home", icon: Home, match: ["/"] },
  { href: "/noticias", label: "nav.news", icon: Newspaper, match: ["/noticias"] },
  { href: "/deportes", label: "nav.sports", icon: Trophy, match: ["/deportes"] },
  { href: "/eventos", label: "nav.events", icon: CalendarDays, match: ["/eventos"] },
  {
    href: "/mas",
    label: "nav.more",
    icon: LayoutGrid,
    match: ["/mas", "/comunidad", "/utilidades", "/perfil", "/settings", "/spots", "/cultura", "/login"],
  },
];

/** Docked tab bar, sports-network style: red marks the active tab. */
export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-[var(--bar)] border-t border-zinc-800 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto h-14 grid grid-cols-5">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match.some((m) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`)));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 pressable",
                active ? "text-brand" : "text-zinc-500"
              )}
            >
              {active && <span className="absolute top-0 inset-x-4 h-[3px] bg-brand" />}
              <Icon className="w-[21px] h-[21px]" strokeWidth={active ? 2.5 : 2} />
              <span className="font-display text-[11px] font-bold uppercase tracking-wide">{t(label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
