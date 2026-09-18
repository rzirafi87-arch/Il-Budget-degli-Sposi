import {
  EmailDeliveryError,
  type EmailDeliveryResult,
  type EmailProviderConfig,
  type TransactionalEmailMessage,
} from "./types";

const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export async function sendWithBrevo(
  message: TransactionalEmailMessage,
  config: EmailProviderConfig,
  options: { fetcher?: typeof fetch; retryDelayMs?: number; timeoutMs?: number } = {},
): Promise<EmailDeliveryResult> {
  const fetcher = options.fetcher || fetch;
  const timeoutMs = options.timeoutMs ?? 8_000;
  const retryDelayMs = options.retryDelayMs ?? 150;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetcher(BREVO_EMAIL_URL, {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": config.apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { email: config.from, name: config.fromName },
          to: [{ email: message.to }],
          subject: message.subject,
          htmlContent: message.html,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (attempt === 0 && RETRYABLE_STATUS.has(response.status)) {
          await wait(retryDelayMs);
          continue;
        }
        throw new EmailDeliveryError("EMAIL_PROVIDER_REJECTED");
      }

      const body: unknown = await response.json().catch(() => null);
      const id = body && typeof body === "object" && "messageId" in body
        && typeof body.messageId === "string" ? body.messageId : "";
      if (!id) throw new EmailDeliveryError("EMAIL_PROVIDER_RESPONSE_INVALID");
      return { id, provider: "brevo" };
    } catch (error) {
      if (error instanceof EmailDeliveryError) throw error;
      const timedOut = error instanceof Error && error.name === "AbortError";
      if (attempt === 0) {
        await wait(retryDelayMs);
        continue;
      }
      throw new EmailDeliveryError(timedOut ? "EMAIL_PROVIDER_TIMEOUT" : "EMAIL_PROVIDER_REJECTED");
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new EmailDeliveryError("EMAIL_PROVIDER_REJECTED");
}
