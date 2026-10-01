// app/mas/page.tsx
"use client";

import Link from "next/link";
import {
  AlertTriangle, BarChart3, CloudSun, Fuel, Globe2, LogIn, MapPinned, Music, Settings, Ship, Ticket,
  TrafficCone, User, Users, UtensilsCrossed, Zap,
} from "lucide-react";
import { Card, PageContent, PageHeader, PageShell, SectionTitle } from "@/components/ui/Page";
import { useT, type TKey } from "@/lib/i18n";
import { updateProfile, useProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";

type Item = { href: string; label: TKey | string; icon: typeof Zap; color: string };

const UTILITIES: Item[] = [
  { href: "/utilidades/luz", label: "util.power", icon: Zap, color: "bg-amber-500" },
  { href: "/utilidades/clima", label: "util.weather", icon: CloudSun, color: "bg-sky-500" },
  { href: "/utilidades/trafico", label: "util.traffic", icon: TrafficCone, color: "bg-orange-500" },
  { href: "/utilidades/gasolina", label: "util.gas", icon: Fuel, color: "bg-emerald-600" },
  { href: "/utilidades/loteria", label: "util.lottery", icon: Ticket, color: "bg-fuchsia-600" },
  { href: "/utilidades/lanchas", label: "util.ferry", icon: Ship, color: "bg-cyan-600" },
  { href: "/utilidades/emergencia", label: "util.emergency", icon: AlertTriangle, color: "bg-red-600" },
];

const EXPLORE: Item[] = [
  { href: "/comunidad/temas", label: "Temas", icon: Users, color: "bg-brand" },
  { href: "/comunidad/encuestas", label: "Encuestas", icon: BarChart3, color: "bg-violet-600" },
  { href: "/comunidad/pueblos", label: "Pueblos", icon: MapPinned, color: "bg-palm" },
  { href: "/cultura", label: "more.culture", icon: Music, color: "bg-coral" },
  { href: "/spots", label: "more.spots", icon: UtensilsCrossed, color: "bg-rose-600" },
];

function Grid({ items }: { items: Item[] }) {
  const { t } = useT();
  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map(({ href, label, icon: Icon, color }) => (
        <Link key={href} href={href} className="flex flex-col items-center gap-1.5 text-center">
          <span className={cn("w-14 h-14 rounded-lg flex items-center justify-center text-white shadow-sm", color)}>
            <Icon className="w-6 h-6" />
          </span>
          <span className="text-[11px] font-medium leading-tight text-zinc-300">
            {label.includes(".") ? t(label as TKey) : label}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function MasPage() {
  const { t, lang } = useT();
  const profile = useProfile();

  return (
    <PageShell>
      <PageHeader title={t("more.title")} />
      <PageContent className="space-y-6">
        <section className="space-y-3">
          <SectionTitle>{t("home.utilities")}</SectionTitle>
          <Grid items={UTILITIES} />
        </section>

        <section className="space-y-3">
          <SectionTitle>{lang === "en" ? "Explore" : "Explora"}</SectionTitle>
          <Grid items={EXPLORE} />
        </section>

        <section className="space-y-2">
          <SectionTitle>{lang === "en" ? "Preferences" : "Preferencias"}</SectionTitle>
          <Card className="divide-y divide-zinc-800">
            <div className="flex items-center gap-3 p-4">
              <Globe2 className="w-5 h-5 text-zinc-400" />
              <span className="flex-1 font-medium">{t("more.language")}</span>
              <div className="flex rounded-full bg-zinc-800 p-0.5 text-sm font-semibold">
                {(["es", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => updateProfile({ lang: l })}
                    className={cn("px-3 py-1 rounded-full", profile.lang === l ? "bg-brand text-white" : "text-zinc-400")}
                  >
                    {l === "es" ? "Español" : "English"}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <label className="flex items-center gap-3">
                <span className="text-xl">✈️</span>
                <span className="flex-1">
                  <span className="block font-medium">{t("more.diasporaMode")}</span>
                  <span className="block text-xs text-zinc-500">{t("more.diasporaHint")}</span>
                </span>
                <input
                  type="checkbox"
                  checked={profile.diaspora}
                  onChange={(e) => updateProfile({ diaspora: e.target.checked })}
                  className="w-5 h-5 accent-[var(--brand)]"
                />
              </label>
              {profile.diaspora && (
                <input
                  value={profile.diasporaCity}
                  onChange={(e) => updateProfile({ diasporaCity: e.target.value })}
                  placeholder={lang === "en" ? "Where do you live? (e.g. Orlando)" : "¿Dónde vives? (ej. Orlando)"}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
                />
              )}
            </div>
          </Card>
        </section>

        <Card className="divide-y divide-zinc-800">
          {[
            { href: "/perfil", label: t("more.profile"), icon: User },
            { href: "/login", label: t("more.login"), icon: LogIn },
            { href: "/settings", label: t("more.settings"), icon: Settings },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 p-4 hover:bg-zinc-800/50">
              <Icon className="w-5 h-5 text-zinc-400" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </Card>
      </PageContent>
    </PageShell>
  );
}
