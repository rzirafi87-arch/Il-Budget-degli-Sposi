import WizardPage from "@/app/[locale]/wizard/page";
import { redirect } from "next/navigation";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

const redirectMock = redirect as jest.MockedFunction<typeof redirect>;

describe("retired wizard route", () => {
  beforeEach(() => {
    redirectMock.mockClear();
  });

  it("redirects the Italian wizard to the language selection flow", async () => {
    await WizardPage({ params: Promise.resolve({ locale: "it" }) });

    expect(redirectMock).toHaveBeenCalledWith("/it/select-language");
  });

  it("uses the safe Italian fallback when the locale is missing", async () => {
    await WizardPage({ params: Promise.resolve({ locale: undefined }) });

    expect(redirectMock).toHaveBeenCalledWith("/it/select-language");
    expect(redirectMock).not.toHaveBeenCalledWith(
      expect.stringContaining("undefined"),
    );
  });
});
