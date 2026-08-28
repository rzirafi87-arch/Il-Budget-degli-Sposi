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

// Import the component as default, but wrap it in a mock router context to avoid Next.js App Router issues
import SelectEventTypePage from "../[locale]/(routes)/select-event-type/page";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import { createMockRouter } from "@/__mocks__/nextRouterMock";

describe("SelectEventTypePage - Cresima", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "";
    mockPush.mockClear();
  });

  it("mostra Cresima e salva la scelta, reindirizzando alla Dashboard", async () => {
    // Imposta lingua e paese per evitare redirect iniziali
    window.localStorage.setItem("language", "it");
    window.localStorage.setItem("country", "it");

    render(
      <RouterContext.Provider value={createMockRouter({ push: mockPush })}>
        <SelectEventTypePage />
      </RouterContext.Provider>
    );

    const btn = screen.getByRole("button", { name: /cresima/i });
    fireEvent.click(btn);

    expect(window.localStorage.getItem("eventType")).toBe("confirmation");
    expect(document.cookie).toMatch(/eventType=confirmation/);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/it/dashboard"));
  });
});
