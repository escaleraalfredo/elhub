"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="text-7xl">🇵🇷</div>
        <h1 className="text-7xl font-bold tracking-tighter text-white">ElHub</h1>
      </div>
      <p className="text-3xl text-zinc-400 mb-12 max-w-lg">
        Noticias que importan.<br />Lugares que viven.
      </p>
      
      <Link 
        href="/dashboard"
        className="text-2xl px-14 py-8 rounded-3xl bg-white text-black hover:bg-emerald-400 font-semibold transition inline-block"
      >
        Entrar al Hub →
      </Link>
    </div>
  );
}