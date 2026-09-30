"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, LayoutGrid, Newspaper, Trophy } from "lucide-react";
import { useT, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: TKey; icon: typeof Home; match: string[] }[] = [
  { href: "/", label: "nav.home", icon: Home, match: ["/"] },
  { href: "/noticias", label: "nav.news", icon: Newspaper, match: ["/noticias"] },
  { href: "/eventos", label: "nav.events", icon: CalendarDays, match: ["/eventos"] },
  { href: "/deportes", label: "nav.sports", icon: Trophy, match: ["/deportes"] },
  {
    href: "/mas",
    label: "nav.more",
    icon: LayoutGrid,
    match: ["/mas", "/comunidad", "/utilidades", "/perfil", "/settings", "/spots", "/cultura", "/login"],
  },
];

/** Floating glass tab bar, like native iOS/Android apps. */
export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="pointer-events-auto max-w-md mx-auto h-16 grid grid-cols-5 rounded-[28px] glass border border-white/10 light:border-black/5 shadow-2xl shadow-black/40">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match.some((m) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`)));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 pressable",
                active ? "text-ink" : "text-zinc-500"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-11 h-7 rounded-full transition-colors",
                  active && "bg-accent-gradient text-white shadow-md shadow-brand/40"
                )}
              >
                <Icon className="w-[20px] h-[20px]" strokeWidth={active ? 2.5 : 2} />
              </span>
              <span className={cn("text-[10px]", active ? "font-bold" : "font-medium")}>{t(label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
