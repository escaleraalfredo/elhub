"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, Play, Trophy, TrendingUp, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/comunidad", label: "Comunidad", icon: Users },
  { href: "/deportes", label: "Deportes", icon: Trophy },
  { href: "/reels", label: "Reels", icon: Play },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto h-16 grid grid-cols-6">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                active ? "text-pr-red" : "text-zinc-500 hover:text-white"
              )}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.4 : 2} />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
