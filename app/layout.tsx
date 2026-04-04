// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { GamificationProvider } from "@/lib/gamificationContext";
import { NewsProvider } from "@/lib/newsContext";
import GlobalHeader from "@/components/GlobalHeader";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ElHub - Puerto Rico",
  description: "Lo que pasa en Puerto Rico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-dark-bg text-white`}>
        <GamificationProvider>
          <NewsProvider>
            <GlobalHeader />
            {children}
            <Toaster position="top-center" richColors closeButton />
          </NewsProvider>
        </GamificationProvider>
      </body>
    </html>
  );
}