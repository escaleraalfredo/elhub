// components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Tag, MapPin, Play, Users, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/deals", label: "Deals", icon: Tag },
    { href: "/trending", label: "Trending", icon: MapPin },
    { href: "/reels", label: "Reels", icon: Play },
    { href: "/comunidad", label: "Comunidad", icon: Users },
    { href: "/perfil", label: "Perfil", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
                            (item.href === "/comunidad" && pathname.startsWith("/comunidad"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 px-3 transition-all ${
                  isActive 
                    ? "text-pr-red" 
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? "fill-pr-red" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}