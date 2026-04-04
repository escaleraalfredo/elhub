// app/comunidad/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ComunidadPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/comunidad/temas");
  }, [router]);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-zinc-400">Cargando Temas...</div>
    </div>
  );
}