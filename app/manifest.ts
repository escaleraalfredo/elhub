import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ElHub · Puerto Rico",
    short_name: "ElHub",
    description: "Noticias, deportes, eventos, luz, agua y clima de Puerto Rico",
    start_url: "/",
    display: "standalone",
    background_color: "#0b111d",
    theme_color: "#111a2b",
    lang: "es",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
