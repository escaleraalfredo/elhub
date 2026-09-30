// app/cultura/page.tsx
"use client";

import Link from "next/link";
import { MapPin, Music2, Store } from "lucide-react";
import { Card, PageContent, PageHeader, PageShell, SectionTitle } from "@/components/ui/Page";
import Sponsored from "@/components/ui/Sponsored";

const MUSIC = [
  { name: "Reggaetón", emoji: "🔊", blurb: "Del underground boricua al mundo entero." },
  { name: "Salsa", emoji: "💃", blurb: "La que se baila en la Placita y en cada boda." },
  { name: "Plena", emoji: "🥁", blurb: "El periódico cantado: panderos y pregones." },
  { name: "Bomba", emoji: "🪘", blurb: "Raíz afroboricua: barril, baile y diálogo." },
  { name: "Música jíbara", emoji: "🎸", blurb: "Cuatro, güiro y décimas — sobre todo en Navidad." },
  { name: "Trap latino", emoji: "🎤", blurb: "La nueva generación de la calle al streaming." },
];

const ROUTES = [
  { name: "Piñones", town: "Loíza", blurb: "Kioskos frente al mar: alcapurrias, bacalaítos y agua de coco.", q: "Piñones, Loíza, Puerto Rico" },
  { name: "Ruta del Lechón (Guavate)", town: "Cayey", blurb: "Lechoneras en la PR-184 con música en vivo los fines de semana.", q: "Guavate, Cayey, Puerto Rico" },
  { name: "Kioskos de Luquillo", town: "Luquillo", blurb: "Decenas de kioskos junto al balneario, perfectos después de la playa.", q: "Kioskos de Luquillo, Puerto Rico" },
  { name: "Poblado de Boquerón", town: "Cabo Rojo", blurb: "Ostiones, empanadillas de chapín y ambiente playero.", q: "Poblado de Boquerón, Cabo Rojo, Puerto Rico" },
  { name: "La Placita de Santurce", town: "San Juan", blurb: "Mercado de día, janguera de noche.", q: "La Placita de Santurce, San Juan, Puerto Rico" },
];

const BUSINESSES = [
  { name: "Tu cafetería favorita", kind: "Café · ejemplo" },
  { name: "Panadería del pueblo", kind: "Panadería · ejemplo" },
  { name: "Artesanías boricuas", kind: "Tienda · ejemplo" },
];

export default function CulturaPage() {
  return (
    <PageShell>
      <PageHeader title="Cultura y comida" subtitle="Música, chinchorreo y negocios locales" back />
      <PageContent className="space-y-6">
        <section className="space-y-2">
          <SectionTitle>Música</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {MUSIC.map((m) => (
              <Card key={m.name} className="p-4 space-y-2">
                <p className="text-2xl">{m.emoji}</p>
                <p className="font-bold">{m.name}</p>
                <p className="text-xs text-zinc-500 leading-snug">{m.blurb}</p>
                <div className="flex gap-2 pt-1">
                  <a
                    href={`https://open.spotify.com/search/${encodeURIComponent(`${m.name} Puerto Rico`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-palm"
                  >
                    <Music2 className="w-3.5 h-3.5" /> Spotify
                  </a>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${m.name} puertorriqueña`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-coral"
                  >
                    YouTube
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <SectionTitle>Rutas de chinchorreo</SectionTitle>
          <Card className="divide-y divide-zinc-800">
            {ROUTES.map((r) => (
              <a
                key={r.name}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.q)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 p-4"
              >
                <MapPin className="w-5 h-5 text-coral shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{r.name} <span className="text-xs font-normal text-zinc-500">· {r.town}</span></p>
                  <p className="text-sm text-zinc-400">{r.blurb}</p>
                </div>
              </a>
            ))}
          </Card>
          <Link href="/spots" className="block text-sm font-semibold text-brand px-1">Ver ranking de spots →</Link>
        </section>

        <section className="space-y-2">
          <SectionTitle>Negocios locales</SectionTitle>
          <Card className="divide-y divide-zinc-800">
            {BUSINESSES.map((b) => (
              <div key={b.name} className="flex items-center gap-3 p-4">
                <Store className="w-5 h-5 text-zinc-400" />
                <div>
                  <p className="font-semibold text-sm">{b.name}</p>
                  <p className="text-xs text-zinc-500">{b.kind}</p>
                </div>
              </div>
            ))}
          </Card>
          <Sponsored placement="cultura" />
        </section>
      </PageContent>
    </PageShell>
  );
}
