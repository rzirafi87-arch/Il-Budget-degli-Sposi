import {
  EmailDeliveryError,
  type EmailDeliveryResult,
  type EmailProviderConfig,
  type TransactionalEmailMessage,
} from "./types";

export async function sendWithResend(
  message: TransactionalEmailMessage,
  config: EmailProviderConfig,
): Promise<EmailDeliveryResult> {
  const { Resend } = await import("resend");
  const resend = new Resend(config.apiKey);
  const { data, error } = await resend.emails.send({
    from: `${config.fromName} <${config.from}>`,
    to: message.to,
    subject: message.subject,
    html: message.html,
  });
  if (error || !data?.id) throw new EmailDeliveryError("EMAIL_PROVIDER_REJECTED");
  return { id: data.id, provider: "resend" };
}
