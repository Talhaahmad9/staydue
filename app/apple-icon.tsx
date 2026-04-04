import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const revalidate = 60;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
          borderRadius: 34,
        }}
      >
        <div style={{ position: "absolute", left: 34, top: 55, width: 112, height: 101, borderRadius: 14, background: "#242424", border: "3px solid #0D9488", display: "flex" }} />
        <div style={{ position: "absolute", left: 34, top: 55, width: 112, height: 31, borderRadius: "14px 14px 0 0", background: "#0D9488", display: "flex" }} />
        <div style={{ position: "absolute", left: 59, top: 40, width: 9, height: 25, borderRadius: 5, background: "#0D9488", display: "flex" }} />
        <div style={{ position: "absolute", left: 112, top: 40, width: 9, height: 25, borderRadius: 5, background: "#0D9488", display: "flex" }} />
        {[34, 54, 74, 94].map((left, i) => (
          <div key={i} style={{ position: "absolute", left, top: 100, width: 18, height: 18, borderRadius: 3, background: i === 2 ? "#0D9488" : "#333333", display: "flex" }} />
        ))}
        {[34, 54, 74, 94].map((left, i) => (
          <div key={i} style={{ position: "absolute", left, top: 124, width: 18, height: 18, borderRadius: 3, background: i === 1 ? "#2D1515" : "#333333", display: "flex" }} />
        ))}
      </div>
    ),
    { ...size }
  );
}
