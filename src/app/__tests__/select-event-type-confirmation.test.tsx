import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));
jest.mock("@/lib/supabaseBrowser", () => ({
  getBrowserClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: "token" } }, error: null }) } }),
}));

beforeAll(() => {
  // @ts-expect-error - Mocking global fetch for testing
  global.fetch = jest.fn((input) =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(String(input).includes("traditions") ? { traditions: [] } : { ok: true }) })
  );
});

import SelectEventTypePage from "../[locale]/(routes)/select-event-type/page";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import { createMockRouter } from "@/__mocks__/nextRouterMock";

describe("SelectEventTypePage - Cresima", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "";
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it("mostra Cresima come Coming Soon e non consente la creazione", () => {
    window.localStorage.setItem("language", "it");
    window.localStorage.setItem("country", "it");

    render(
      <RouterContext.Provider value={createMockRouter({ push: mockPush })}>
        <SelectEventTypePage />
      </RouterContext.Provider>
    );

    const btn = screen.getByRole("button", { name: /cresima/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(btn).toHaveTextContent(/coming soon/i);

    fireEvent.click(btn);
    expect(window.localStorage.getItem("eventType")).toBeNull();
    expect(document.cookie).not.toMatch(/eventType=confirmation/);
    expect(mockReplace).not.toHaveBeenCalledWith("/it/dashboard");
  });
});
