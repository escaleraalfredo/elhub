"use client";

import { Card, PageContent, PageHeader, PageShell } from "@/components/ui/Page";

export default function DealsPage() {
  return (
    <PageShell>
      <PageHeader title="Deals" subtitle="Las mejores ofertas del día en Puerto Rico" />
      <PageContent>
        <Card className="p-8 text-center">
          <p className="text-4xl mb-3">🏷️</p>
          <h3 className="text-lg font-semibold">Deals y ofertas</h3>
          <p className="text-sm text-zinc-500 mt-6">Próximamente...</p>
        </Card>
      </PageContent>
    </PageShell>
  );
}
