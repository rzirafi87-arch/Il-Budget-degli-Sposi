import { Buffer } from "node:buffer";

type EmailProvider = "brevo" | "resend";

type TransactionalEmail = {
  body: string;
  id: string;
};

type EmailAuditCandidateDiagnostic = {
  body: "missing" | "empty" | "1-1024" | "1025-4096" | "4097-16384" | "over-16384";
  decodedVariantCount: number;
  delivery: "delivered" | "pending" | "terminal";
  hrefSyntaxCount: number;
  httpSyntaxCount: number;
  httpsSyntaxCount: number;
  linkCount: number;
};

type EmailAuditLookupDiagnostic = {
  candidates: EmailAuditCandidateDiagnostic[];
  detailNotFoundCount: number;
  listedCount: number;
  matchedCount: number;
};

type EmailAuditLookupResult = {
  diagnostic: EmailAuditLookupDiagnostic;
  message: TransactionalEmail | null;
};

type WaitForTransactionalEmailOptions = {
  previousMessageId?: string;
  recipient: string;
  requireDelivered?: boolean;
  requireLink?: boolean;
  startedAt: number;
  subject: string | RegExp;
  timeoutMs?: number;
};

type ResendEmail = {
  created_at: string;
  id: string;
  last_event?: string;
  subject: string;
  to: string[];
};

type BrevoEmail = {
  date: string;
  email: string;
  subject: string;
  uuid: string;
};

type BrevoEmailContent = {
  body?: string;
  events?: Array<{ name?: string; time?: string }>;
};

class EmailAuditRateLimitError extends Error {
  constructor(readonly retryAfterMs: number) {
    super("QA email audit was rate limited.");
  }
}

class EmailAuditNotFoundError extends Error {
  constructor() {
    super("QA email audit detail is not available yet.");
  }
}

const provider = process.env.PLAYWRIGHT_EMAIL_PROVIDER?.trim().toLowerCase();
const resendApiKey = process.env.PLAYWRIGHT_RESEND_API_KEY;
const brevoApiKey = process.env.PLAYWRIGHT_BREVO_API_KEY;

export function emailAuditMissingConfiguration() {
  const missing: string[] = [];
  if (!provider) return ["PLAYWRIGHT_EMAIL_PROVIDER"];
  if (provider === "brevo" && !brevoApiKey) missing.push("PLAYWRIGHT_BREVO_API_KEY");
  else if (provider === "resend" && !resendApiKey) missing.push("PLAYWRIGHT_RESEND_API_KEY");
  else if (provider !== "brevo" && provider !== "resend") missing.push("PLAYWRIGHT_EMAIL_PROVIDER (brevo or resend)");
  return missing;
}

export function emailAuditConfigured() {
  return emailAuditMissingConfiguration().length === 0;
}

export function transactionalEmailLinkMetadata(values: string[]) {
  return values.slice(0, 10).map(value => {
    try {
      const url = new URL(value);
      return {
        origin: url.origin,
        pathname: url.pathname,
        queryKeys: [...url.searchParams.keys()].sort(),
      };
    } catch {
      return { invalid: true };
    }
  });
}

function decodeTransferAndEntities(value: string) {
  const quotedPrintable = /=3d|=\r?\n/i.test(value)
    ? value
      .replace(/=\r?\n/g, "")
      .replace(/=([0-9a-f]{2})/gi, (_match, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
    : value;
  let decoded = quotedPrintable;
  for (let pass = 0; pass < 3; pass += 1) {
    const next = decoded
      .replace(/&amp;/gi, "&")
      .replace(/&#0*38;/gi, "&")
      .replace(/&#x0*26;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#0*39;/gi, "'")
      .replace(/&#x0*27;/gi, "'")
      .replace(/&colon;/gi, ":")
      .replace(/&#0*58;/gi, ":")
      .replace(/&#x0*3a;/gi, ":");
    if (next === decoded) break;
    decoded = next;
  }
  return decoded;
}

function unescapeSerializedMarkup(value: string) {
  return value
    .replace(/\\u([0-9a-f]{4})/gi, (_match, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\x([0-9a-f]{2})/gi, (_match, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\(["'\\/])/g, "$1")
    .replace(/\\[rnt]/g, " ");
}

function decodeBase64Candidate(value: string) {
  const compact = value.replace(/\s/g, "");
  if (compact.length < 16 || compact.length % 4 !== 0 || !/^[a-z0-9+/]+={0,2}$/i.test(compact)) return null;
  const decoded = Buffer.from(compact, "base64").toString("utf8");
  return /(?:href\s*=|https?:\/\/|<a\b|<html\b)/i.test(decoded) ? decoded : null;
}

function emailMarkupVariants(value: string) {
  const variants = new Set<string>();
  const add = (candidate: string) => {
    const normalized = decodeTransferAndEntities(unescapeSerializedMarkup(candidate));
    if (normalized) variants.add(normalized);
  };
  add(value);

  const mimeBase64 = /content-transfer-encoding\s*:\s*base64[^\r\n]*\r?\n(?:[^\r\n]*\r?\n)*?\r?\n([a-z0-9+/=\r\n]+)/gi;
  for (const match of value.matchAll(mimeBase64)) {
    const decoded = decodeBase64Candidate(match[1]);
    if (decoded) add(decoded);
  }
  const wholeBody = decodeBase64Candidate(value);
  if (wholeBody) add(wholeBody);
  return [...variants];
}

export function transactionalEmailLinks(body: string) {
  const variants = emailMarkupVariants(body);
  const hrefs = variants.flatMap(decoded => [...decoded.matchAll(/\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi)]
    .map(match => match[1] || match[2] || match[3] || ""));
  const textUrls = variants.flatMap(decoded => decoded.match(/https?:\/\/[^\s"'<>]+/gi) || []);
  return [...new Set([...hrefs, ...textUrls]
    .map(value => value.replace(/[),.;]+$/, ""))
    .filter(value => {
      try {
        const url = new URL(value);
        return url.protocol === "https:" || (
          url.protocol === "http:"
          && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
        );
      } catch {
        return false;
      }
    }))];
}

export function transactionalEmailBodyDiagnostic(
  body: string | undefined,
  delivery: EmailAuditCandidateDiagnostic["delivery"],
): EmailAuditCandidateDiagnostic {
  const length = body?.length || 0;
  const bodyBucket = body === undefined
    ? "missing"
    : length === 0
      ? "empty"
      : length <= 1_024
        ? "1-1024"
        : length <= 4_096
          ? "1025-4096"
          : length <= 16_384
            ? "4097-16384"
            : "over-16384";
  const variants = body ? emailMarkupVariants(body) : [];
  const syntax = variants.join("\n");
  return {
    body: bodyBucket,
    decodedVariantCount: Math.min(variants.length, 10),
    delivery,
    hrefSyntaxCount: Math.min((syntax.match(/\bhref\s*=/gi) || []).length, 10),
    httpSyntaxCount: Math.min((syntax.match(/http:\/\//gi) || []).length, 10),
    httpsSyntaxCount: Math.min((syntax.match(/https:\/\//gi) || []).length, 10),
    linkCount: Math.min(body ? transactionalEmailLinks(body).length : 0, 10),
  };
}

function isBrevoTrackingUrl(url: URL) {
  const isKnownTrackingHost = ["sendibt2.com", "sendibt3.com"]
    .some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  return url.protocol === "https:"
    && isKnownTrackingHost
    && url.pathname.startsWith("/tr/cl/")
    && !url.username
    && !url.password
    && !url.hash;
}

export async function resolveTransactionalEmailLink(value: string) {
  let current: URL;
  try {
    current = new URL(value);
  } catch {
    return value;
  }
  if (configuredProvider() !== "brevo" || !isBrevoTrackingUrl(current)) return current.href;

  for (let hop = 0; hop < 3 && isBrevoTrackingUrl(current); hop += 1) {
    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    const location = response.headers.get("location");
    if (![301, 302, 303, 307, 308].includes(response.status) || !location) {
      throw new Error("QA email tracking link did not resolve safely.");
    }
    current = new URL(location, current);
    if (current.protocol !== "https:" || current.username || current.password || current.hash) {
      throw new Error("QA email tracking link resolved to an unsafe destination.");
    }
  }

  if (isBrevoTrackingUrl(current)) throw new Error("QA email tracking link exceeded the redirect limit.");
  return current.href;
}

function configuredProvider(): EmailProvider {
  const missing = emailAuditMissingConfiguration();
  if (missing.length) throw new Error(`QA email audit is missing: ${missing.join(", ")}.`);
  return provider as EmailProvider;
}

function matchesSubject(actual: string, expected: string | RegExp) {
  if (typeof expected === "string") return actual === expected;
  expected.lastIndex = 0;
  return expected.test(actual);
}

async function jsonRequest<T>(url: string, headers: Record<string, string>): Promise<T> {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
  if (response.status === 429) {
    const retryAfterSeconds = Number(response.headers.get("retry-after"));
    const retryAfterMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? retryAfterSeconds * 1_000
      : 10_000;
    throw new EmailAuditRateLimitError(Math.min(retryAfterMs, 30_000));
  }
  if (response.status === 404) throw new EmailAuditNotFoundError();
  if (!response.ok) throw new Error(`QA email audit failed with HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}

async function latestResendEmail(options: WaitForTransactionalEmailOptions): Promise<EmailAuditLookupResult> {
  const headers = { Authorization: `Bearer ${resendApiKey!}` };
  const listed = await jsonRequest<{ data: ResendEmail[] }>("https://api.resend.com/emails?limit=100", headers);
  const messages = listed.data.filter(item =>
    item.id !== options.previousMessageId
    && Date.parse(item.created_at) >= options.startedAt
    && matchesSubject(item.subject, options.subject)
    && item.to.some(address => address.toLowerCase() === options.recipient.toLowerCase()));
  const diagnostic: EmailAuditLookupDiagnostic = {
    candidates: [],
    detailNotFoundCount: 0,
    listedCount: listed.data.length,
    matchedCount: messages.length,
  };
  for (const message of messages) {
    let detail: ResendEmail & { html?: string };
    try {
      detail = await jsonRequest<ResendEmail & { html?: string }>(
        `https://api.resend.com/emails/${encodeURIComponent(message.id)}`,
        headers,
      );
    } catch (error) {
      if (error instanceof EmailAuditNotFoundError) {
        diagnostic.detailNotFoundCount += 1;
        continue;
      }
      throw error;
    }
    const terminal = ["bounced", "complained", "failed", "canceled"].includes(detail.last_event || "");
    const delivered = detail.last_event === "delivered";
    diagnostic.candidates.push(transactionalEmailBodyDiagnostic(
      detail.html,
      terminal ? "terminal" : delivered ? "delivered" : "pending",
    ));
    if (terminal) {
      throw new Error("QA email reached a terminal delivery failure.");
    }
    if (options.requireDelivered && !delivered) continue;
    if (detail.html && (!options.requireLink || transactionalEmailLinks(detail.html).length > 0)) {
      return { diagnostic, message: { body: detail.html, id: message.id } };
    }
  }
  return { diagnostic, message: null };
}

async function latestBrevoEmail(options: WaitForTransactionalEmailOptions): Promise<EmailAuditLookupResult> {
  const headers = { "api-key": brevoApiKey!, accept: "application/json" };
  const query = new URLSearchParams({ email: options.recipient, limit: "10", sort: "desc" });
  const listed = await jsonRequest<{ transactionalEmails?: BrevoEmail[] }>(
    `https://api.brevo.com/v3/smtp/emails?${query}`,
    headers,
  );
  const listedMessages = listed.transactionalEmails || [];
  const messages = listedMessages.filter(item =>
    item.uuid !== options.previousMessageId
    && Date.parse(item.date) >= options.startedAt
    && matchesSubject(item.subject, options.subject)
    && item.email.toLowerCase() === options.recipient.toLowerCase());
  const diagnostic: EmailAuditLookupDiagnostic = {
    candidates: [],
    detailNotFoundCount: 0,
    listedCount: listedMessages.length,
    matchedCount: messages.length,
  };
  for (const message of messages) {
    let detail: BrevoEmailContent;
    try {
      detail = await jsonRequest<BrevoEmailContent>(
        `https://api.brevo.com/v3/smtp/emails/${encodeURIComponent(message.uuid)}`,
        headers,
      );
    } catch (error) {
      if (error instanceof EmailAuditNotFoundError) {
        diagnostic.detailNotFoundCount += 1;
        continue;
      }
      throw error;
    }
    const events = (detail.events || []).map(event => (event.name || "").toLowerCase());
    const delivered = events.includes("delivered");
    const terminal = events.some(event => ["blocked", "hardbounce", "hardbounces", "invalid"].includes(event))
      || (!delivered && events.some(event => ["softbounce", "softbounces"].includes(event)));
    diagnostic.candidates.push(transactionalEmailBodyDiagnostic(
      detail.body,
      terminal ? "terminal" : delivered ? "delivered" : "pending",
    ));
    if (terminal) {
      throw new Error("QA email reached a terminal delivery failure.");
    }
    if (options.requireDelivered && !delivered) continue;
    if (detail.body && (!options.requireLink || transactionalEmailLinks(detail.body).length > 0)) {
      return { diagnostic, message: { body: detail.body, id: message.uuid } };
    }
  }
  return { diagnostic, message: null };
}

export async function waitForTransactionalEmail(
  options: WaitForTransactionalEmailOptions,
): Promise<TransactionalEmail> {
  const selectedProvider = configuredProvider();
  const deadline = Date.now() + (options.timeoutMs ?? 60_000);
  const diagnostic = {
    candidateStates: new Set<string>(),
    detailNotFoundCount: 0,
    maxListedCount: 0,
    maxMatchedCount: 0,
    polls: 0,
    rateLimitedCount: 0,
  };
  while (Date.now() < deadline) {
    try {
      const result = selectedProvider === "brevo"
        ? await latestBrevoEmail(options)
        : await latestResendEmail(options);
      diagnostic.polls += 1;
      diagnostic.detailNotFoundCount += result.diagnostic.detailNotFoundCount;
      diagnostic.maxListedCount = Math.max(diagnostic.maxListedCount, result.diagnostic.listedCount);
      diagnostic.maxMatchedCount = Math.max(diagnostic.maxMatchedCount, result.diagnostic.matchedCount);
      for (const candidate of result.diagnostic.candidates) {
        diagnostic.candidateStates.add(JSON.stringify(candidate));
      }
      if (result.message) return result.message;
      await new Promise(resolve => setTimeout(resolve, selectedProvider === "brevo" ? 5_000 : 2_000));
    } catch (error) {
      if (!(error instanceof EmailAuditRateLimitError)) throw error;
      diagnostic.rateLimitedCount += 1;
      await new Promise(resolve => setTimeout(resolve, Math.min(error.retryAfterMs, Math.max(1, deadline - Date.now()))));
    }
  }
  const safeDiagnostic = {
    provider: selectedProvider,
    requireDelivered: Boolean(options.requireDelivered),
    requireLink: Boolean(options.requireLink),
    polls: diagnostic.polls,
    rateLimitedCount: diagnostic.rateLimitedCount,
    maxListedCount: diagnostic.maxListedCount,
    maxMatchedCount: diagnostic.maxMatchedCount,
    detailNotFoundCount: diagnostic.detailNotFoundCount,
    candidateStates: [...diagnostic.candidateStates].slice(0, 10).map(value => JSON.parse(value)),
  };
  throw new Error(`QA transactional email was not available within the allowed interval. Diagnostic: ${JSON.stringify(safeDiagnostic)}`);
}
