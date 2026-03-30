"use client";
import { Newspaper, MapPin, TrendingUp, Users, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "news", label: "Noticias", icon: Newspaper },
  { id: "descubre", label: "Descubre", icon: MapPin },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "community", label: "Temas Comunidad", icon: Users },
  { id: "profile", label: "Mi Perfil", icon: User },
];

export default function Sidebar({ activeTab, setActiveTab }: any) {
  return (
    <div className="w-72 border-r border-zinc-800 bg-zinc-900 h-screen p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <div className="text-5xl">🇵🇷</div>
        <h1 className="text-4xl font-bold tracking-tighter">ElHub</h1>
      </div>

      <div className="space-y-2 flex-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-3xl text-left text-lg font-medium hover:bg-zinc-800 transition-all",
                activeTab === tab.id && "bg-white text-black font-semibold"
              )}
            >
              <Icon className="w-6 h-6" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6">
        <button className="w-full bg-emerald-400 hover:bg-emerald-500 text-black py-4 rounded-3xl font-semibold flex items-center justify-center gap-2 transition">
          <Plus className="w-5 h-5" />
          Añadir Spot / Tema
        </button>
      </div>
    </div>
  );
}