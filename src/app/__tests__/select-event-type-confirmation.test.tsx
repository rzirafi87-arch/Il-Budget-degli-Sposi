import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

// Mock next/navigation router to avoid real navigation in jsdom
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

// Simple fetch mock for the traditions preview
beforeAll(() => {
  // @ts-expect-error - Mocking global fetch for testing
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ traditions: [] }) })
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

  it("mostra Cresima e salva la scelta, reindirizzando alla Dashboard", () => {
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
    expect(mockPush).toHaveBeenCalledWith("/it/dashboard");
  });
});
