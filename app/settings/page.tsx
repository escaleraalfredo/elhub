// app/settings/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, User, Bell, Palette, Volume2, Eye, LogOut, Globe, Moon, Sun } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "@/lib/themeContext";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"es" | "en">("es");

  const changeLanguage = (lang: "es" | "en") => {
    setSelectedLanguage(lang);
    toast.success(lang === "es" ? "Idioma cambiado a Español" : "Language changed to English");
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white">
            <ChevronLeft className="w-7 h-7" />
          </button>
          <h1 className="text-xl font-bold text-white">Configuración</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Account */}
        <div className="bg-zinc-900 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-700 rounded-2xl" />
              <div>
                <p className="font-semibold text-lg">@tuusuario</p>
                <p className="text-zinc-500 text-sm">Nivel 3 • 1,255 pts</p>
              </div>
            </div>
          </div>
          <button className="w-full px-6 py-4 flex items-center gap-4 hover:bg-zinc-800 text-left border-b border-zinc-800">
            <User className="w-5 h-5 text-zinc-400" />
            <div className="flex-1">
              <p className="font-medium">Editar perfil</p>
              <p className="text-xs text-zinc-500">Foto, nombre, bio y más</p>
            </div>
          </button>
        </div>

        {/* Appearance */}
        <div className="bg-zinc-900 rounded-3xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Palette className="w-5 h-5 text-zinc-400" />
              <p className="font-medium">Apariencia</p>
            </div>

            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between py-5 px-5 hover:bg-zinc-800 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center">
                  {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
                </div>
                <div>
                  <p className="font-medium">Modo {theme === "dark" ? "Oscuro" : "Claro"}</p>
                  <p className="text-xs text-zinc-500">Cambia la apariencia de la app</p>
                </div>
              </div>

              <div className={`relative w-14 h-8 rounded-full flex items-center px-1 transition-all ${theme === "dark" ? "bg-pr-red" : "bg-zinc-700"}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow transition-all ${theme === "dark" ? "translate-x-6" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Rest of your settings... */}
        {/* (Language, Notifications, etc. - keep your existing code here) */}

        <div className="text-center text-xs text-zinc-500 pt-10">
          ElHub v1.2.4 • Hecho con ❤️ para la comunidad boricua
        </div>
      </div>

      <BottomNav />
    </div>
  );
}