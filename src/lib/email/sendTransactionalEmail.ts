import { sendWithBrevo } from "./brevoProvider";
import { sendWithResend } from "./resendProvider";
import {
  EmailDeliveryError,
  type EmailDeliveryResult,
  type EmailProviderConfig,
  type TransactionalEmailMessage,
} from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function providerConfig(provider: "brevo" | "resend"): EmailProviderConfig {
  const apiKey = provider === "brevo" ? process.env.BREVO_API_KEY : process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || (provider === "resend" ? process.env.RESEND_FROM : undefined);
  const fromName = process.env.EMAIL_FROM_NAME?.trim();
  if (!apiKey || !from || !fromName) {
    throw new EmailDeliveryError("EMAIL_PROVIDER_NOT_CONFIGURED");
  }
  if (!EMAIL_PATTERN.test(from)) throw new EmailDeliveryError("EMAIL_SENDER_INVALID");
  return { apiKey, from, fromName };
}

export async function sendTransactionalEmail(
  message: TransactionalEmailMessage,
): Promise<EmailDeliveryResult> {
  const selected = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (selected === "brevo") return sendWithBrevo(message, providerConfig("brevo"));
  if (selected === "resend") return sendWithResend(message, providerConfig("resend"));
  if (!selected) throw new EmailDeliveryError("EMAIL_PROVIDER_NOT_CONFIGURED");
  throw new EmailDeliveryError("EMAIL_PROVIDER_UNSUPPORTED");
}

export { EmailDeliveryError } from "./types";
export type { EmailDeliveryResult, TransactionalEmailMessage } from "./types";
