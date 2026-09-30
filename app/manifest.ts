import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ElHub · Puerto Rico",
    short_name: "ElHub",
    description: "Noticias, deportes, eventos, luz, agua y clima de Puerto Rico",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ef",
    theme_color: "#0a5c8f",
    lang: "es",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
