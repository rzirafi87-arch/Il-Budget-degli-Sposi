const mockSendMail = jest.fn();
const mockListUsers = jest.fn();
const mockGenerateLink = jest.fn();

jest.mock("@/lib/authRateLimit", () => ({
  checkAuthRateLimit: async () => ({ allowed: true, resetAt: Date.now() + 1000 }),
}));
jest.mock("@/lib/mailer", () => ({
  siteUrl: () => "https://app.example.test",
  emailLocaleFromRequest: () => "it",
  confirmationSubject: () => "Confirm account",
  confirmationTemplate: (link: string) => `<a href="${link}">confirm</a>`,
  sendMail: (...args: unknown[]) => mockSendMail(...args),
}));
jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({
    auth: { admin: { listUsers: mockListUsers, generateLink: mockGenerateLink } },
  }),
}));

function request(email = "target@example.com") {
  return {
    json: async () => ({ email }),
  } as unknown as import("next/server").NextRequest;
}

describe("confirmation resend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMail.mockResolvedValue({ id: "accepted" });
    mockGenerateLink.mockResolvedValue({
      data: {
        properties: {
          action_link: "https://auth.example.test/#access_token=secret-fragment",
          hashed_token: "resend-hash",
        },
      },
      error: null,
    });
  });

  it("sends a callback URL backed by the magic-link token hash", async () => {
    mockListUsers.mockResolvedValue({
      data: { users: [{ email: "target@example.com", email_confirmed_at: null }] },
      error: null,
    });
    const { POST } = await import("../api/auth/resend/route");

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail.mock.calls[0]?.[2]).toContain(
      "https://app.example.test/auth/callback?next=%2Fit%2Fdashboard&token_hash=resend-hash&type=email",
    );
    expect(mockSendMail.mock.calls[0]?.[2]).not.toContain("access_token");
  });

  it("continues through every user page before suppressing resend", async () => {
    const firstPage = Array.from({ length: 200 }, (_, index) => ({
      email: `other-${index}@example.com`,
      email_confirmed_at: null,
    }));
    mockListUsers
      .mockResolvedValueOnce({ data: { users: firstPage }, error: null })
      .mockResolvedValueOnce({
        data: { users: [{ email: "target@example.com", email_confirmed_at: null }] },
        error: null,
      });
    const { POST } = await import("../api/auth/resend/route");

    await POST(request());

    expect(mockListUsers).toHaveBeenNthCalledWith(1, { page: 1, perPage: 200 });
    expect(mockListUsers).toHaveBeenNthCalledWith(2, { page: 2, perPage: 200 });
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });
});
