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

jest.mock("zod", () => {
  const actual = jest.requireActual<typeof import("zod")>("zod");
  return { ...actual, optional: <T,>(schema: T): T => schema };
});

import SelectEventTypePage from "../[locale]/(routes)/select-event-type/page";

describe("SelectEventTypePage - Comunione", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "";
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it("mostra Comunione come Coming Soon e non consente la creazione", () => {
    window.localStorage.setItem("language", "it");
    window.localStorage.setItem("country", "it");

    render(<SelectEventTypePage />);

    const btn = screen.getByText("events.communion").closest("button");
    expect(btn).toBeTruthy();
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(btn).toHaveTextContent(/coming soon/i);

    fireEvent.click(btn!);
    expect(window.localStorage.getItem("eventType")).toBeNull();
    expect(document.cookie).not.toMatch(/eventType=communion/);
    expect(mockReplace).not.toHaveBeenCalledWith("/it/dashboard");
  });
});
