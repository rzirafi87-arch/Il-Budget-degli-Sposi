import { BRAND_NAME } from "@/config/brand";
import { cookies } from "next/headers";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  let lang = "it";
  try {
    const c = await cookies();
    const v = c.get("language")?.value;
    if (v) lang = v.toLowerCase();
  } catch {}

  const subtitle = lang === "en" ? "Plan your event without stress" : "Organizza il tuo evento senza stress";
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
            {BRAND_NAME}
          </div>
          <div style={{ fontSize: 28, marginTop: 12, color: "#4A4A4A" }}>{subtitle}</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
