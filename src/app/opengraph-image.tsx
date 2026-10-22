import { ImageResponse } from "next/og";
export const runtime = "nodejs";
export const alt = "Grappasonni dal 1908. Roma, Via Appia Nuova.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "#171914",
        color: "#D7B68C",
        display: "flex",
        flexDirection: "column",
        padding: 64,
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 19,
          letterSpacing: 3,
        }}
      >
        <span>ROMA, VIA APPIA NUOVA</span>
        <span>DAL 1908</span>
      </div>
      <div style={{ fontSize: 151, letterSpacing: -10, lineHeight: 1 }}>
        grappasonni
      </div>
      <div style={{ height: 1, background: "#D7B68C", width: "100%" }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 28,
        }}
      >
        <span>Un indirizzo. Una storia.</span>
        <span>858–860</span>
      </div>
    </div>,
    size,
  );
}
