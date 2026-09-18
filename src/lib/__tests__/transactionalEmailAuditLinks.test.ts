import { transactionalEmailLinks } from "../../../e2e/helpers/transactional-email-audit";

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

  it("ignores non-HTTPS links", () => {
    expect(transactionalEmailLinks('<a href="mailto:qa@example.test">Mail</a> http://app.example.test/path'))
      .toEqual([]);
  });
});
