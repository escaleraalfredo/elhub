// app/logoMark.tsx
// Shared JSX for generated icons / social images (rendered by next/og).
export function LogoMark({ size }: { size: number }) {
  const stripe = Math.max(2, Math.round(size * 0.07));
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0a5c8f",
        borderRadius: size * 0.22,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: size * 0.58,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        E
      </div>
      <div style={{ display: "flex", height: stripe }}>
        <div style={{ flex: 1, background: "#e92228" }} />
        <div style={{ flex: 1, background: "#ffffff" }} />
        <div style={{ flex: 1, background: "#0050b5" }} />
      </div>
    </div>
  );
}
