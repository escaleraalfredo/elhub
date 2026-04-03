"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Image, Users, BarChart3 } from "lucide-react";

export default function ComunidadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isTemas = pathname === "/comunidad/temas" || pathname.startsWith("/comunidad/temas/");
  const isMemes = pathname === "/comunidad/memes";
  const isPueblos = pathname === "/comunidad/pueblos";
  const isEncuestas = pathname === "/comunidad/encuestas";

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {/* Persistent Comunidad Sub Tabs */}
      <div className="sticky top-[57px] bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-around py-3">
            <Link
              href="/comunidad/temas"
              className={`flex flex-col items-center gap-1 transition-all ${
                isTemas ? "text-pr-red" : "text-zinc-400"
              }`}
            >
              <MessageCircle className={`w-5 h-5 ${isTemas ? "fill-pr-red" : ""}`} />
              <span className="text-xs font-medium">Temas</span>
            </Link>

            <Link
              href="/comunidad/memes"
              className={`flex flex-col items-center gap-1 transition-all ${
                isMemes ? "text-pr-red" : "text-zinc-400"
              }`}
            >
              <Image className={`w-5 h-5 ${isMemes ? "fill-pr-red" : ""}`} />
              <span className="text-xs font-medium">Memes</span>
            </Link>

            <Link
              href="/comunidad/pueblos"
              className={`flex flex-col items-center gap-1 transition-all ${
                isPueblos ? "text-pr-red" : "text-zinc-400"
              }`}
            >
              <Users className={`w-5 h-5 ${isPueblos ? "fill-pr-red" : ""}`} />
              <span className="text-xs font-medium">Pueblos</span>
            </Link>

            <Link
              href="/comunidad/encuestas"
              className={`flex flex-col items-center gap-1 transition-all ${
                isEncuestas ? "text-pr-red" : "text-zinc-400"
              }`}
            >
              <BarChart3 className={`w-5 h-5 ${isEncuestas ? "fill-pr-red" : ""}`} />
              <span className="text-xs font-medium">Encuestas</span>
            </Link>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}