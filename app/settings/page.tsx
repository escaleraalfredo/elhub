"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, User, Bell, Shield, Palette, Moon, Sun, Volume2, Eye, LogOut, Globe } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"es" | "en">("es");

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      toast.success("🌙 Modo Oscuro activado");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      toast.success("☀️ Modo Claro activado");
    }
  };

  const changeLanguage = (lang: "es" | "en") => {
    setSelectedLanguage(lang);
    toast.success(lang === "es" ? "Idioma cambiado a Español" : "Language changed to English");
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <h1 className="text-xl font-bold text-white">Configuración</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Account Section */}
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

          {/* Edit Profile - Now Clickable */}
          <button 
            onClick={() => toast.info("Editar perfil se conectará más adelante")}
            className="w-full px-6 py-4 flex items-center gap-4 hover:bg-zinc-800 transition-all text-left border-b border-zinc-800"
          >
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

            {/* Dark / Light Mode Toggle - Beautiful Version */}
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between py-5 px-5 hover:bg-zinc-800 transition-all rounded-2xl group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center">
                  {isDarkMode ? 
                    <Moon className="w-5 h-5 text-zinc-400" /> : 
                    <Sun className="w-5 h-5 text-amber-400" />
                  }
                </div>
                <div>
                  <p className="font-medium text-base">Modo {isDarkMode ? "Oscuro" : "Claro"}</p>
                  <p className="text-xs text-zinc-500">Cambia la apariencia de toda la app</p>
                </div>
              </div>

              {/* Modern Toggle Switch */}
              <div className={`relative w-14 h-8 rounded-full transition-all duration-300 flex items-center px-1 
                ${isDarkMode ? "bg-pr-red" : "bg-zinc-700"}`}>
                <div 
                  className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center
                    ${isDarkMode ? "translate-x-6" : "translate-x-0"}`}
                >
                  {isDarkMode ? 
                    <Moon className="w-3.5 h-3.5 text-zinc-900" /> : 
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  }
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="bg-zinc-900 rounded-3xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Globe className="w-5 h-5 text-zinc-400" />
              <p className="font-medium">Idioma</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => changeLanguage("es")}
                className={`flex-1 py-4 rounded-2xl border transition-all ${selectedLanguage === "es" ? "bg-pr-red text-white border-pr-red" : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"}`}
              >
                Español
              </button>
              <button
                onClick={() => changeLanguage("en")}
                className={`flex-1 py-4 rounded-2xl border transition-all ${selectedLanguage === "en" ? "bg-pr-red text-white border-pr-red" : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"}`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Other Settings */}
        <div className="bg-zinc-900 rounded-3xl overflow-hidden">
          <div className="p-6 space-y-2">
            <button className="w-full flex items-center gap-4 py-4 hover:bg-zinc-800 transition-all rounded-2xl px-4 text-left">
              <Bell className="w-5 h-5 text-zinc-400" />
              <div className="flex-1">
                <p className="font-medium">Notificaciones</p>
                <p className="text-xs text-zinc-500">Alertas y actualizaciones</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-4 py-4 hover:bg-zinc-800 transition-all rounded-2xl px-4 text-left">
              <Volume2 className="w-5 h-5 text-zinc-400" />
              <div className="flex-1">
                <p className="font-medium">Sonidos</p>
                <p className="text-xs text-zinc-500">Efectos y notificaciones</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-4 py-4 hover:bg-zinc-800 transition-all rounded-2xl px-4 text-left">
              <Eye className="w-5 h-5 text-zinc-400" />
              <div className="flex-1">
                <p className="font-medium">Ahorro de datos</p>
                <p className="text-xs text-zinc-500">Optimiza el uso en Reels</p>
              </div>
            </button>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center text-xs text-zinc-500 pt-6 pb-10">
          ElHub v1.2.4 • Hecho con ❤️ para la comunidad boricua
        </div>

        {/* Logout */}
        <button 
          onClick={() => toast.info("Cierre de sesión se conectará con Supabase más tarde")}
          className="w-full bg-zinc-900 hover:bg-red-950/50 transition-all py-4 rounded-3xl text-red-500 font-medium flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>

      <BottomNav />
    </div>
  );
}