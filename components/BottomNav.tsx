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

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto h-16 grid grid-cols-5">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match.some((m) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`)));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                active ? "text-brand" : "text-zinc-500 hover:text-ink"
              )}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.4 : 2} />
              <span className="text-[10px] font-semibold">{t(label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
