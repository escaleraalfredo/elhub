// app/comunidad/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

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
      {/* Sub Tab Bar */}
      <div className="sticky top-[57px] bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto px-4">
          <div className="flex">
            <Link
              href="/comunidad/temas"
              className={`flex-1 py-4 text-sm font-medium text-center transition-all relative ${
                isTemas ? "text-white" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Temas
              {isTemas && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pr-red" />}
            </Link>

            <Link
              href="/comunidad/memes"
              className={`flex-1 py-4 text-sm font-medium text-center transition-all relative ${
                isMemes ? "text-white" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Memes
              {isMemes && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pr-red" />}
            </Link>

            <Link
              href="/comunidad/pueblos"
              className={`flex-1 py-4 text-sm font-medium text-center transition-all relative ${
                isPueblos ? "text-white" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Pueblos
              {isPueblos && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pr-red" />}
            </Link>

            <Link
              href="/comunidad/encuestas"
              className={`flex-1 py-4 text-sm font-medium text-center transition-all relative ${
                isEncuestas ? "text-white" : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Encuestas
              {isEncuestas && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pr-red" />}
            </Link>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}