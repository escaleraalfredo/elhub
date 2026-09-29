"use client";

import { Card, PageContent, PageHeader, PageShell } from "@/components/ui/Page";

export default function EventosPage() {
  return (
    <PageShell>
      <PageHeader title="Eventos" subtitle="Fiestas, happy hours y festivales" />
      <PageContent>
        <Card className="p-8 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <h3 className="text-lg font-semibold">Eventos boricuas</h3>
          <p className="text-sm text-zinc-400 mt-1">Calendario de fiestas y actividades en la isla y la diáspora.</p>
          <p className="text-sm text-zinc-500 mt-6">Próximamente...</p>
        </Card>
      </PageContent>
    </PageShell>
  );
}
