"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import NewsFeed from "@/components/NewsFeed";
import Descubre from "@/components/Descubre";
import TrendingTopics from "@/components/TrendingTopics";
import CommunityTopics from "@/components/CommunityTopics";
import Profile from "@/components/Profile";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("news");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const renderContent = () => {
    if (activeTab === "news") return <NewsFeed />;
    if (activeTab === "descubre") return <Descubre />;
    if (activeTab === "trending") return <TrendingTopics />;
    if (activeTab === "community") return <CommunityTopics />;
    if (activeTab === "profile") return <Profile />;
    return <div className="text-4xl font-bold text-center mt-20">Página en construcción</div>;
  };

  if (!mounted) {
    return (
      <div className="flex h-screen bg-zinc-950 text-zinc-100">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-zinc-800 px-8" />
          <main className="flex-1 overflow-auto p-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-zinc-800 px-8 flex items-center justify-end gap-4">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-3 hover:bg-zinc-800 rounded-3xl"
          >
            {resolvedTheme === "dark" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}