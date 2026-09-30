import { ImageResponse } from "next/og";
import { LogoMark } from "./logoMark";

export const alt = "ElHub — Lo que pasa en Puerto Rico";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Preview card used when ElHub links are shared on WhatsApp, Facebook, X...
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0a5c8f 0%, #06324f 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 96, height: 96, display: "flex" }}>
            <LogoMark size={96} />
          </div>
          <div style={{ fontSize: 56, fontWeight: 800 }}>ElHub</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>Lo que pasa en Puerto Rico</div>
          <div style={{ fontSize: 34, color: "#ffd9cf" }}>Noticias · Deportes · Eventos · Luz y agua · Clima</div>
        </div>
        <div style={{ display: "flex", height: 10, width: 240 }}>
          <div style={{ flex: 1, background: "#e92228" }} />
          <div style={{ flex: 1, background: "#ffffff" }} />
          <div style={{ flex: 1, background: "#ef5b3c" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
