import { fireEvent, render, screen, waitFor } from "@testing-library/react";
const mockSignIn = jest.fn();
jest.mock("@/lib/supabaseBrowser", () => ({ getBrowserClient: () => ({ auth: { getSession: async () => ({ data: { session: null } }), signInWithPassword: (...args: unknown[]) => mockSignIn(...args) } }) }));
jest.mock("next-intl", () => ({ useLocale: () => "it", useTranslations: () => (key: string) => key }));
import AuthPage from "../[locale]/(routes)/auth/page";

it("provides native form submission and recovers from a network rejection", async () => {
  mockSignIn.mockRejectedValue(new Error("offline"));
  render(<AuthPage />);
  const submit = screen.getByRole("button", { name: "signIn" });
  expect(submit).toHaveAttribute("type", "submit");
  fireEvent.change(screen.getByLabelText("email"), { target: { value: "qa@example.invalid" } });
  fireEvent.change(screen.getByLabelText("label"), { target: { value: "test-password" } });
  fireEvent.submit(submit.closest("form")!);
  expect(await screen.findByRole("alert")).toBeInTheDocument();
  await waitFor(() => expect(submit).toBeEnabled());
});
