// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Top 25 Puerto Rico",
    short_name: "Top25PR",
    description: "Vota por los mejores spots, playas, bares y canciones de Puerto Rico. Rankings en tiempo real.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#ef4444", // pr-red
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["entertainment", "food", "travel"],
    lang: "es",
  };
}