import {
  transactionalEmailBodyDiagnostic,
  transactionalEmailLinks,
} from "../../../e2e/helpers/transactional-email-audit";

describe("transactional email link extraction", () => {
  it("extracts and decodes a normal HTML anchor", () => {
    expect(transactionalEmailLinks('<a href="https://app.example.test/auth/callback?type=signup&amp;token_hash=hash">Confirm</a>'))
      .toEqual(["https://app.example.test/auth/callback?type=signup&token_hash=hash"]);
  });

  it("normalizes quoted-printable HTML before extracting links", () => {
    expect(transactionalEmailLinks('<a href=3D"https://app.example.test/it/invitation?token=3Dabc123">Open</a>'))
      .toEqual(["https://app.example.test/it/invitation?token=abc123"]);
  });

  it("extracts an HTTPS URL from a plain-text body", () => {
    expect(transactionalEmailLinks("Open https://app.example.test/it/invitation?token=abc123."))
      .toEqual(["https://app.example.test/it/invitation?token=abc123"]);
  });

  it("extracts a link from a MIME base64 body", () => {
    const html = '<a href="https://app.example.test/auth/callback?token_hash=abc123">Confirm</a>';
    const body = `Content-Type: text/html; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${Buffer.from(html).toString("base64")}`;

    expect(transactionalEmailLinks(body))
      .toEqual(["https://app.example.test/auth/callback?token_hash=abc123"]);
  });

  it("extracts a link from a wholly base64-encoded provider body", () => {
    const body = Buffer.from('Open <a href="https://app.example.test/it/invitation?token=abc123">invite</a>')
      .toString("base64");

    expect(transactionalEmailLinks(body))
      .toEqual(["https://app.example.test/it/invitation?token=abc123"]);
  });

  it("normalizes serialized markup escapes and encoded URL punctuation", () => {
    expect(transactionalEmailLinks('<a href=\\"https&colon;\\/\\/app.example.test\\/auth\\/callback?token_hash=abc123\\">Confirm</a>'))
      .toEqual(["https://app.example.test/auth/callback?token_hash=abc123"]);
  });

  it("ignores non-HTTPS links", () => {
    expect(transactionalEmailLinks('<a href="mailto:qa@example.test">Mail</a> http://app.example.test/path'))
      .toEqual([]);
  });

  it("allows HTTP only for an isolated loopback test server", () => {
    expect(transactionalEmailLinks("http://127.0.0.1:3000/auth/v1/verify?type=recovery"))
      .toEqual(["http://127.0.0.1:3000/auth/v1/verify?type=recovery"]);
  });

  it("reduces provider bodies to diagnostics without content, addresses, URLs or tokens", () => {
    const body = '<a href="https://secret.example.test/it/invitation?token=super-secret">qa@example.test</a>';
    const diagnostic = transactionalEmailBodyDiagnostic(body, "delivered");
    const serialized = JSON.stringify(diagnostic);

    expect(diagnostic).toEqual({
      body: "1-1024",
      decodedVariantCount: 1,
      delivery: "delivered",
      hrefSyntaxCount: 1,
      httpSyntaxCount: 0,
      httpsSyntaxCount: 1,
      linkCount: 1,
    });
    expect(serialized).not.toContain("qa@example.test");
    expect(serialized).not.toContain("secret.example.test");
    expect(serialized).not.toContain("super-secret");
  });

  it("distinguishes unavailable, empty and oversized provider bodies without preserving content", () => {
    expect(transactionalEmailBodyDiagnostic(undefined, "pending")).toEqual({
      body: "missing", decodedVariantCount: 0, delivery: "pending", hrefSyntaxCount: 0,
      httpSyntaxCount: 0, httpsSyntaxCount: 0, linkCount: 0,
    });
    expect(transactionalEmailBodyDiagnostic("", "pending")).toEqual({
      body: "empty", decodedVariantCount: 0, delivery: "pending", hrefSyntaxCount: 0,
      httpSyntaxCount: 0, httpsSyntaxCount: 0, linkCount: 0,
    });
    expect(transactionalEmailBodyDiagnostic("x".repeat(16_385), "terminal")).toEqual({
      body: "over-16384", decodedVariantCount: 1, delivery: "terminal", hrefSyntaxCount: 0,
      httpSyntaxCount: 0, httpsSyntaxCount: 0, linkCount: 0,
    });
  });
});
