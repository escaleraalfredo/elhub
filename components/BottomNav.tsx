"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Play, Users, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/comunidad", label: "Comunidad", icon: Users },
    { href: "/noticias", label: "Noticias", icon: Home },
    { href: "/reels", label: "Reels", icon: Play },
    { href: "/trending", label: "Trending", icon: TrendingUp },
    { href: "/perfil", label: "Perfil", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? "text-pr-red" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}