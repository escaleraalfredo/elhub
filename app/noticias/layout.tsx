// app/noticias/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { PageShell, StickyBar, Tabs } from "@/components/ui/Page";

export default function NoticiasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname.startsWith("/noticias/social") ? "/noticias/social" : "/noticias";
  return (
    <PageShell>
      <StickyBar>
        <Tabs
          active={active}
          tabs={[
            { label: "Titulares", href: "/noticias" },
            { label: "X · En vivo", href: "/noticias/social" },
          ]}
        />
      </StickyBar>
      {children}
    </PageShell>
  );
}
