// app/comunidad/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { PageShell, StickyBar, Tabs } from "@/components/ui/Page";

const TABS = [
  { label: "Temas", href: "/comunidad/temas" },
  { label: "Pueblos", href: "/comunidad/pueblos" },
  { label: "Encuestas", href: "/comunidad/encuestas" },
];

export default function ComunidadLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = TABS.find((t) => pathname.startsWith(t.href))?.href ?? "/comunidad/temas";
  return (
    <PageShell>
      <StickyBar>
        <Tabs tabs={TABS} active={active} />
      </StickyBar>
      {children}
    </PageShell>
  );
}
