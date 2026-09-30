// app/utilidades/emergencia/page.tsx
// Works offline (precached by the service worker).
"use client";

import { Check, Phone } from "lucide-react";
import { Card, PageContent, PageHeader, PageShell, SectionTitle } from "@/components/ui/Page";
import { PREPARATE } from "@/lib/utilities/local";
import { useLocalSet } from "@/lib/useLocalSet";
import { cn } from "@/lib/utils";

export default function EmergenciaPage() {
  const list = useLocalSet("elhub:preparate:v1");
  const done = PREPARATE.filter((i) => list.has(i.id)).length;

  return (
    <PageShell>
      <PageHeader title="Emergencias" subtitle="Disponible sin internet" back />
      <PageContent className="space-y-5">
        <a href="tel:911" className="block">
          <Card className="p-5 flex items-center gap-4 bg-red-600 border-0 text-white">
            <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </span>
            <div>
              <p className="text-2xl font-display font-extrabold">Llama al 911</p>
              <p className="text-sm opacity-90">Emergencias médicas, fuego, policía y rescate</p>
            </div>
          </Card>
        </a>

        <section className="space-y-2">
          <SectionTitle right={<span className="text-xs text-zinc-500">{done}/{PREPARATE.length}</span>}>Prepárate</SectionTitle>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-palm transition-all" style={{ width: `${(done / PREPARATE.length) * 100}%` }} />
          </div>
          <Card className="divide-y divide-zinc-800">
            {PREPARATE.map((item) => {
              const on = list.has(item.id);
              return (
                <button key={item.id} onClick={() => list.toggle(item.id)} className="w-full flex items-start gap-3 p-4 text-left">
                  <span
                    className={cn(
                      "mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0",
                      on ? "bg-palm border-palm text-white" : "border-zinc-600"
                    )}
                  >
                    {on && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <span className={cn("text-sm", on && "line-through text-zinc-500")}>{item.label}</span>
                </button>
              );
            })}
          </Card>
        </section>

        <section className="space-y-2">
          <SectionTitle>Durante y después</SectionTitle>
          <Card className="p-4 space-y-2 text-sm text-zinc-300">
            <p>• Sigue las instrucciones oficiales y los boletines del Servicio Nacional de Meteorología.</p>
            <p>• No cruces carreteras inundadas: 6 pulgadas de agua en movimiento pueden arrastrar a una persona.</p>
            <p>• Usa el generador afuera y lejos de ventanas por el monóxido de carbono.</p>
            <p>• Mantén el celular cargado y usa mensajes de texto: gastan menos batería y red que las llamadas.</p>
            <p>• Guarda esta página: funciona aunque no tengas señal.</p>
          </Card>
        </section>
      </PageContent>
    </PageShell>
  );
}
