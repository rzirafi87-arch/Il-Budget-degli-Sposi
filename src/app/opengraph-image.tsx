import { BRAND_NAME } from "@/config/brand";
import { cookies } from "next/headers";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Read language cookie (edge-compatible)
  let lang = "it";
  try {
    const c = await cookies();
    const v = c.get("language")?.value;
    if (v) lang = v.toLowerCase();
  } catch {}

  const siteName = BRAND_NAME;
  const title = lang === "en" ? "Plan your event with peace of mind" : "Organizza il tuo evento con serenità";
  const subtitle = lang === "en"
    ? "Budget, suppliers and calm — all in one place"
    : "Budget, fornitori e serenità — tutto in un unico posto";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FDFBF7 0%, #E8E0D6 100%)",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 16px",
            borderRadius: 999,
            background: "#A3B59D",
            color: "#fff",
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          {siteName}
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.1, color: "#2D2A26", maxWidth: 980 }}>
          {title}
        </div>
        <div style={{ marginTop: 24, fontSize: 28, color: "#5B5B5B" }}>
          {subtitle}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
