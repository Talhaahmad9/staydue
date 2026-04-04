import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
          borderRadius: 96,
        }}
      >
        {/* Calendar body */}
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 156,
            width: 320,
            height: 288,
            borderRadius: 40,
            background: "#242424",
            border: "8px solid #0D9488",
            display: "flex",
          }}
        />
        {/* Calendar header */}
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 156,
            width: 320,
            height: 88,
            borderRadius: "40px 40px 0 0",
            background: "#0D9488",
            display: "flex",
          }}
        />
        {/* Peg left */}
        <div
          style={{
            position: "absolute",
            left: 168,
            top: 112,
            width: 24,
            height: 72,
            borderRadius: 12,
            background: "#0D9488",
            display: "flex",
          }}
        />
        {/* Peg right */}
        <div
          style={{
            position: "absolute",
            left: 320,
            top: 112,
            width: 24,
            height: 72,
            borderRadius: 12,
            background: "#0D9488",
            display: "flex",
          }}
        />
        {/* Row 1 */}
        {[
          { left: 116, bg: "#333333", border: "none" },
          { left: 188, bg: "#333333", border: "none" },
          { left: 260, bg: "#0D9488", border: "none" },
          { left: 332, bg: "#333333", border: "none" },
        ].map((cell, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cell.left,
              top: 284,
              width: 56,
              height: 56,
              borderRadius: 10,
              background: cell.bg,
              display: "flex",
            }}
          />
        ))}
        {/* Row 2 */}
        {[
          { left: 116, bg: "#333333" },
          { left: 188, bg: "#2D1515" },
          { left: 260, bg: "#333333" },
          { left: 332, bg: "#333333" },
        ].map((cell, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cell.left,
              top: 356,
              width: 56,
              height: 56,
              borderRadius: 10,
              background: cell.bg,
              display: "flex",
            }}
          />
        ))}
      </div>
    ),
    { ...size }
  );
}
