// app/settings/page.tsx
"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ChevronRight, Globe, LogIn, Monitor, Moon, Palette, Sun, User } from "lucide-react";
import { Card, PageContent, PageHeader, PageShell } from "@/components/ui/Page";
import Avatar from "@/components/ui/Avatar";
import { usePoints } from "@/lib/points";
import { updateProfile, useProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";

const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

export default function SettingsPage() {
  const { total, level } = usePoints();
  const profile = useProfile();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const en = profile.lang === "en";

  const themes = [
    { id: "light", label: en ? "Light" : "Claro", icon: Sun },
    { id: "dark", label: en ? "Dark" : "Oscuro", icon: Moon },
    { id: "system", label: en ? "System" : "Sistema", icon: Monitor },
  ];

  return (
    <PageShell>
      <PageHeader title={en ? "Settings" : "Configuración"} back />
      <PageContent>
        <Card className="divide-y divide-zinc-800">
          <Link href="/perfil" className="flex items-center gap-4 p-5">
            <Avatar name={profile.username} size={56} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg">@{profile.username}</p>
              <p className="text-zinc-500 text-sm">Nivel {level.level} · {level.title} · {total.toLocaleString()} pts</p>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-500" />
          </Link>
          <label className="flex items-center gap-4 px-5 py-4">
            <User className="w-5 h-5 text-zinc-400" />
            <span className="flex-1 font-medium">{en ? "Username" : "Usuario"}</span>
            <input
              value={profile.username}
              maxLength={24}
              onChange={(e) => updateProfile({ username: e.target.value.replace(/[^\w.áéíóúñü]/gi, "").toLowerCase() || "tuusuario" })}
              className="w-36 text-right bg-transparent text-zinc-300 focus:outline-none"
            />
          </label>
          <Link href="/login" className="flex items-center gap-4 px-5 py-4">
            <LogIn className="w-5 h-5 text-zinc-400" />
            <span className="flex-1 font-medium">{en ? "Sign in / create account" : "Entrar o crear cuenta"}</span>
            <ChevronRight className="w-5 h-5 text-zinc-500" />
          </Link>
        </Card>

        <Card className="p-5 space-y-3">
          <p className="flex items-center gap-3 font-medium">
            <Palette className="w-5 h-5 text-zinc-400" /> {en ? "Appearance" : "Apariencia"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-sm font-medium",
                  mounted && theme === id ? "border-brand bg-brand/10 text-brand" : "border-zinc-800 text-zinc-300"
                )}
              >
                <Icon className="w-5 h-5" /> {label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <p className="flex items-center gap-3 font-medium">
            <Globe className="w-5 h-5 text-zinc-400" /> {en ? "Language" : "Idioma"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => updateProfile({ lang: l })}
                className={cn(
                  "rounded-2xl border py-3 text-sm font-semibold",
                  profile.lang === l ? "border-ink bg-ink text-zinc-950" : "border-zinc-800 text-zinc-300"
                )}
              >
                {l === "es" ? "Español" : "English"}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500">
            {en
              ? "Menus and screens switch to English; news stays in its original language."
              : "Cambia menús y pantallas; las noticias se mantienen en su idioma original."}
          </p>
        </Card>

        <p className="text-center text-xs text-zinc-500 pt-4">ElHub · Hecho con ❤️ para la comunidad boricua</p>
      </PageContent>
    </PageShell>
  );
}
