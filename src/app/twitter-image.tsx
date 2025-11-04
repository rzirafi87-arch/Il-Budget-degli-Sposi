import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#A3B59D",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 24,
            padding: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 800, color: "#2D2A26" }}>
            MYBUDGETEVENTO
          </div>
          <div style={{ fontSize: 28, marginTop: 12, color: "#4A4A4A" }}>
            Organizza il tuo matrimonio senza stress
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
