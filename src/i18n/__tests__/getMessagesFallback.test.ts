import { mergeMessageFallback } from "../getMessages";

describe("message fallback", () => {
  it("falls back only for the missing key without replacing the localized dictionary", () => {
    expect(mergeMessageFallback(
      { page: { title: "Titolo", description: "Descrizione", action: "Continua" } },
      { page: { title: "Title", action: "Continue" } },
    )).toEqual({
      page: { title: "Title", description: "Descrizione", action: "Continue" },
    });
  });
});
