// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";
import GlobalHeader from "@/components/GlobalHeader";
import AlertBanner from "@/components/AlertBanner";
import BottomNav from "@/components/BottomNav";
import ServiceWorker from "@/components/ServiceWorker";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const display = Montserrat({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "ElHub · Puerto Rico", template: "%s · ElHub" },
  description: "Lo que pasa en Puerto Rico: noticias, deportes, eventos, luz, agua y clima.",
  applicationName: "ElHub",
  appleWebApp: { capable: true, title: "ElHub", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#050506",
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
          {children}
          <BottomNav />
          <Toaster position="top-center" richColors closeButton />
          <ServiceWorker />
        </Providers>
      </body>
    </html>
  );
}
