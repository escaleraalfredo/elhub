// app/eventos/page.tsx
"use client";

import { PageContent, PageHeader, PageShell } from "@/components/ui/Page";
import EventsBrowser from "@/components/events/EventsBrowser";
import { useT } from "@/lib/i18n";

export default function EventosPage() {
  const { t, lang } = useT();
  return (
    <PageShell>
      <PageHeader
        title={t("nav.events")}
        subtitle={lang === "en" ? "Concerts, games, patron saint festivals and more" : "Conciertos, juegos, patronales y más"}
      />
      <PageContent>
        <EventsBrowser />
      </PageContent>
    </PageShell>
  );
}
