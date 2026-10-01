// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";
import GlobalHeader from "@/components/GlobalHeader";
import AlertBanner from "@/components/AlertBanner";
import BottomNav from "@/components/BottomNav";
import ScoreTicker from "@/components/ScoreTicker";
import ServiceWorker from "@/components/ServiceWorker";

const inter = Barlow({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const display = Barlow_Condensed({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700", "800"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: "ElHub · Puerto Rico", template: "%s · ElHub" },
  description: "Lo que pasa en Puerto Rico: noticias, deportes, eventos, luz, agua y clima.",
  applicationName: "ElHub",
  appleWebApp: { capable: true, title: "ElHub", statusBarStyle: "black" },
};

export const viewport: Viewport = {
  themeColor: "#111a2b",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${display.variable} bg-zinc-950 text-ink antialiased`}>
        <Providers>
          <GlobalHeader />
          <AlertBanner />
          <ScoreTicker />
          {children}
          <BottomNav />
          <Toaster position="top-center" richColors closeButton />
          <ServiceWorker />
        </Providers>
      </body>
    </html>
  );
}
