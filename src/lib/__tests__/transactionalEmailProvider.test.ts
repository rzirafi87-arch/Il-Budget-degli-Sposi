const mockResendConstructor = jest.fn();
const mockResendSend = jest.fn();

jest.mock("resend", () => ({
  Resend: function MockResend(key: string) {
    mockResendConstructor(key);
    return { emails: { send: mockResendSend } };
  },
}));

const originalEnv = process.env;
const message = { to: "recipient@example.test", subject: "Subject", html: "<p>Body</p>" };

function response(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
}

describe("transactional email provider", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      EMAIL_PROVIDER: "brevo",
      BREVO_API_KEY: "brevo-test-secret",
      EMAIL_FROM: "sender@example.test",
      EMAIL_FROM_NAME: "Il Budget degli Sposi",
    };
  });

  afterAll(() => { process.env = originalEnv; });

  it("selects Brevo, accepts a valid delivery and never initializes Resend", async () => {
    const fetcher = jest.fn(() => response(201, { messageId: "brevo-message" }));
    global.fetch = fetcher as unknown as typeof fetch;
    const { sendTransactionalEmail } = await import("@/lib/email/sendTransactionalEmail");
    await expect(sendTransactionalEmail(message)).resolves.toEqual({ id: "brevo-message", provider: "brevo" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(mockResendConstructor).not.toHaveBeenCalled();
    expect(mockResendSend).not.toHaveBeenCalled();
  });

  it.each([400, 401, 403])("sanitizes a non-retryable Brevo %s", async status => {
    global.fetch = jest.fn(() => response(status, { message: "secret provider detail" })) as unknown as typeof fetch;
    const { sendTransactionalEmail } = await import("@/lib/email/sendTransactionalEmail");
    await expect(sendTransactionalEmail(message)).rejects.toMatchObject({ code: "EMAIL_PROVIDER_REJECTED" });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it.each([429, 500, 503])("retries once and sanitizes retryable Brevo %s", async status => {
    global.fetch = jest.fn(() => response(status, { message: "secret provider detail" })) as unknown as typeof fetch;
    const { sendWithBrevo } = await import("@/lib/email/brevoProvider");
    await expect(sendWithBrevo(message, {
      apiKey: "secret", from: "sender@example.test", fromName: "Il Budget degli Sposi",
    }, { retryDelayMs: 0 })).rejects.toMatchObject({ code: "EMAIL_PROVIDER_REJECTED" });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("accepts a controlled retry after a transient failure", async () => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() => response(503, {}))
      .mockImplementationOnce(() => response(201, { messageId: "accepted-after-retry" })) as unknown as typeof fetch;
    const { sendWithBrevo } = await import("@/lib/email/brevoProvider");
    await expect(sendWithBrevo(message, {
      apiKey: "secret", from: "sender@example.test", fromName: "Il Budget degli Sposi",
    }, { retryDelayMs: 0 })).resolves.toMatchObject({ id: "accepted-after-retry" });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("rejects a malformed accepted response", async () => {
    global.fetch = jest.fn(() => response(201, { unexpected: true })) as unknown as typeof fetch;
    const { sendTransactionalEmail } = await import("@/lib/email/sendTransactionalEmail");
    await expect(sendTransactionalEmail(message)).rejects.toMatchObject({ code: "EMAIL_PROVIDER_RESPONSE_INVALID" });
  });

  it("retries a timeout once and exposes only a stable code", async () => {
    const abortError = Object.assign(new Error("secret timeout detail"), { name: "AbortError" });
    global.fetch = jest.fn().mockRejectedValue(abortError) as unknown as typeof fetch;
    const { sendWithBrevo } = await import("@/lib/email/brevoProvider");
    await expect(sendWithBrevo(message, {
      apiKey: "secret", from: "sender@example.test", fromName: "Il Budget degli Sposi",
    }, { retryDelayMs: 0, timeoutMs: 1 })).rejects.toMatchObject({ code: "EMAIL_PROVIDER_TIMEOUT" });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["missing secret", { BREVO_API_KEY: undefined }, "EMAIL_PROVIDER_NOT_CONFIGURED"],
    ["missing sender", { EMAIL_FROM: undefined }, "EMAIL_PROVIDER_NOT_CONFIGURED"],
    ["invalid sender", { EMAIL_FROM: "invalid" }, "EMAIL_SENDER_INVALID"],
  ])("fails closed for %s", async (_label, override, code) => {
    process.env = { ...process.env, ...override };
    const { sendTransactionalEmail } = await import("@/lib/email/sendTransactionalEmail");
    await expect(sendTransactionalEmail(message)).rejects.toMatchObject({ code });
    expect(mockResendConstructor).not.toHaveBeenCalled();
  });

  it("does not leak recipient, secret or provider detail to logs", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    global.fetch = jest.fn(() => response(403, { message: "provider-secret-detail" })) as unknown as typeof fetch;
    const { sendTransactionalEmail } = await import("@/lib/email/sendTransactionalEmail");
    await expect(sendTransactionalEmail(message)).rejects.toBeDefined();
    expect(JSON.stringify([...error.mock.calls, ...warn.mock.calls])).not.toMatch(/recipient|brevo-test-secret|provider-secret-detail/);
    error.mockRestore(); warn.mockRestore();
  });

  it.each(["it", "en", "es", "fr", "de"] as const)("renders escaped %s confirmation and recovery messages", async locale => {
    const { confirmationSubject, confirmationTemplate, recoverySubject, recoveryTemplate } = await import("@/lib/mailer");
    const unsafeLink = "https://app.example.test/auth/callback?token=<secret>&next=/dashboard";
    expect(confirmationSubject(locale)).toBeTruthy();
    expect(recoverySubject(locale)).toBeTruthy();
    expect(confirmationTemplate(unsafeLink, locale)).toContain("&lt;secret&gt;&amp;next=");
    expect(recoveryTemplate(unsafeLink, locale)).toContain("&lt;secret&gt;&amp;next=");
  });
});
