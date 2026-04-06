// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";
import BottomNav from "@/components/BottomNav";
import { GamificationProvider } from "@/lib/gamificationContext";
import { ThemeProvider } from "@/lib/themeContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Boricua Spots",
  description: "La app boricua pa' descubrir spots, reels y comunidad 🔥",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-zinc-950 text-white min-h-screen`}>
        <ThemeProvider>
          <GamificationProvider>
            <GlobalHeader />
            <main className="pb-20 min-h-[calc(100vh-64px)]">
              {children}
            </main>
            <BottomNav />
            <Toaster position="top-center" richColors />
          </GamificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}