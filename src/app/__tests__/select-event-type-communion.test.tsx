import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// Mock next/navigation router to avoid real navigation in jsdom
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));
jest.mock("@/lib/supabaseBrowser", () => ({
  getBrowserClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: "token" } }, error: null }) } }),
}));

// Simple fetch mock for the traditions preview
beforeAll(() => {
  // @ts-expect-error - Mocking global fetch for testing
  global.fetch = jest.fn((input) =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(String(input).includes("traditions") ? { traditions: [] } : { ok: true }) })
  );
});

// Mock Zod (or the schema library) to prevent "t.optional is not a function" error in test
jest.mock("zod", () => {
  const actual = jest.requireActual<typeof import("zod")>("zod");
  return {
    ...actual,
    optional: <T,>(schema: T): T => schema,
  };
});

import SelectEventTypePage from "../[locale]/(routes)/select-event-type/page";

describe("SelectEventTypePage - Comunione", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "";
    mockPush.mockClear();
  });

  it("mostra Comunione e salva la scelta, reindirizzando alla Dashboard", async () => {
    // Imposta lingua e paese per evitare redirect iniziali
    window.localStorage.setItem("language", "it");
    window.localStorage.setItem("country", "it");

    render(<SelectEventTypePage />);

    const btn = screen.getByRole("button", { name: /comunione/i });
    fireEvent.click(btn);

    expect(window.localStorage.getItem("eventType")).toBe("communion");
    expect(document.cookie).toMatch(/eventType=communion/);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/it/dashboard"));
  });
});
