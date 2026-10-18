/**
 * HTTP security headers applied to every response (B57).
 *
 * The Content-Security-Policy is a first, non-breaking step: it locks down
 * framing, plugins, <base>, form targets and which origins the page may load
 * from or talk to. `script-src` still allows inline scripts because Next.js
 * hydration and the GA bootstrap are inline; moving to per-request nonces is
 * the follow-up (start it as Report-Only on Preview).
 */

type CspEnv = {
  supabaseUrl?: string;
  /** "production" | "preview" | "development" (VERCEL_ENV or NODE_ENV). */
  environment?: string;
};

const GOOGLE_ANALYTICS = [
  "https://www.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
];

function supabaseOrigins(supabaseUrl?: string): string[] {
  try {
    if (!supabaseUrl) throw new Error("missing");
    const url = new URL(supabaseUrl);
    return [url.origin, `wss://${url.host}`];
  } catch {
    return ["https://*.supabase.co", "wss://*.supabase.co"];
  }
}

export function buildContentSecurityPolicy({ supabaseUrl, environment }: CspEnv = {}): string {
  const isDevelopment = environment === "development";
  const isPreview = environment === "preview";
  // Vercel's preview toolbar (comments, feedback) is served from vercel.live.
  const vercelLive = isPreview ? ["https://vercel.live"] : [];

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
      "https://www.googletagmanager.com",
      ...vercelLive,
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:", ...vercelLive],
    "connect-src": [
      "'self'",
      ...supabaseOrigins(supabaseUrl),
      ...GOOGLE_ANALYTICS,
      ...vercelLive,
      ...(isPreview ? ["wss://ws-us3.pusher.com"] : []),
      ...(isDevelopment ? ["ws:", "http://localhost:*", "http://127.0.0.1:*"] : []),
    ],
    "frame-src": ["'self'", ...vercelLive],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  if (!isDevelopment) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

export function securityHeaders(env: CspEnv = {}) {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(env) },
    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
}
