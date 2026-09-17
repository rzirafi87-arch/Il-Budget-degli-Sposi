export type TransactionalEmailMessage = {
  html: string;
  subject: string;
  to: string;
};

export type EmailDeliveryResult = {
  id: string;
  provider: "brevo" | "resend";
};

export type EmailProviderConfig = {
  apiKey: string;
  from: string;
  fromName: string;
};

export type EmailDeliveryErrorCode =
  | "EMAIL_PROVIDER_NOT_CONFIGURED"
  | "EMAIL_PROVIDER_UNSUPPORTED"
  | "EMAIL_SENDER_INVALID"
  | "EMAIL_PROVIDER_REJECTED"
  | "EMAIL_PROVIDER_TIMEOUT"
  | "EMAIL_PROVIDER_RESPONSE_INVALID";

export class EmailDeliveryError extends Error {
  constructor(public readonly code: EmailDeliveryErrorCode) {
    super(code);
    this.name = "EmailDeliveryError";
  }
}
