type EmailProvider = "brevo" | "resend";

type TransactionalEmail = {
  body: string;
  id: string;
};

type WaitForTransactionalEmailOptions = {
  previousMessageId?: string;
  recipient: string;
  requireDelivered?: boolean;
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
  if (!response.ok) throw new Error(`QA email audit failed with HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}

async function latestResendEmail(options: WaitForTransactionalEmailOptions): Promise<TransactionalEmail | null> {
  const headers = { Authorization: `Bearer ${resendApiKey!}` };
  const listed = await jsonRequest<{ data: ResendEmail[] }>("https://api.resend.com/emails?limit=100", headers);
  const message = listed.data.find(item =>
    item.id !== options.previousMessageId
    && Date.parse(item.created_at) >= options.startedAt
    && matchesSubject(item.subject, options.subject)
    && item.to.some(address => address.toLowerCase() === options.recipient.toLowerCase()));
  if (!message) return null;
  const detail = await jsonRequest<ResendEmail & { html?: string }>(
    `https://api.resend.com/emails/${encodeURIComponent(message.id)}`,
    headers,
  );
  if (["bounced", "complained", "failed", "canceled"].includes(detail.last_event || "")) {
    throw new Error("QA email reached a terminal delivery failure.");
  }
  if (options.requireDelivered && detail.last_event !== "delivered") return null;
  return detail.html ? { body: detail.html, id: message.id } : null;
}

async function latestBrevoEmail(options: WaitForTransactionalEmailOptions): Promise<TransactionalEmail | null> {
  const headers = { "api-key": brevoApiKey!, accept: "application/json" };
  const query = new URLSearchParams({ email: options.recipient, limit: "100", sort: "desc" });
  const listed = await jsonRequest<{ transactionalEmails?: BrevoEmail[] }>(
    `https://api.brevo.com/v3/smtp/emails?${query}`,
    headers,
  );
  const message = (listed.transactionalEmails || []).find(item =>
    item.uuid !== options.previousMessageId
    && Date.parse(item.date) >= options.startedAt
    && matchesSubject(item.subject, options.subject)
    && item.email.toLowerCase() === options.recipient.toLowerCase());
  if (!message) return null;
  const detail = await jsonRequest<BrevoEmailContent>(
    `https://api.brevo.com/v3/smtp/emails/${encodeURIComponent(message.uuid)}`,
    headers,
  );
  const events = (detail.events || []).map(event => (event.name || "").toLowerCase());
  if (events.some(event => ["blocked", "hardbounce", "hardbounces", "invalid"].includes(event))) {
    throw new Error("QA email reached a terminal delivery failure.");
  }
  if (options.requireDelivered && !events.includes("delivered")) return null;
  return detail.body ? { body: detail.body, id: message.uuid } : null;
}

export async function waitForTransactionalEmail(
  options: WaitForTransactionalEmailOptions,
): Promise<TransactionalEmail> {
  const selectedProvider = configuredProvider();
  const deadline = Date.now() + (options.timeoutMs ?? 60_000);
  while (Date.now() < deadline) {
    const message = selectedProvider === "brevo"
      ? await latestBrevoEmail(options)
      : await latestResendEmail(options);
    if (message) return message;
    await new Promise(resolve => setTimeout(resolve, 2_000));
  }
  throw new Error("QA transactional email was not available within the allowed interval.");
}
