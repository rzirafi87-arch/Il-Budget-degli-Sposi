import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/supabaseBrowser", () => ({
  getBrowserClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: null } }),
      signInWithPassword: jest.fn(),
    },
  }),
}));

import AuthPage from "../[locale]/(routes)/auth/page";

describe("signup event type guard", () => {
  it("shows wedding as selectable and all 17 Coming Soon types as disabled", async () => {
    render(<AuthPage />);
    fireEvent.click(screen.getAllByRole("button", { name: "register" })[0]);

    const selector = screen.getByRole("combobox", { name: "eventType" });
    const options = Array.from(selector.querySelectorAll("option"));
    expect(options).toHaveLength(18);
    expect(options[0]).toHaveValue("wedding");
    expect(options[0]).toBeEnabled();
    expect(options.slice(1)).toHaveLength(17);
    for (const option of options.slice(1)) {
      expect(option).toBeDisabled();
      expect(option).toHaveTextContent(/comingSoon/);
    }
  });
});
