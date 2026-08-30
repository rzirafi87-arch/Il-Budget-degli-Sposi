import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ traditions: [] }) })
  ) as unknown as typeof fetch;
});

import SelectEventTypePage from "../[locale]/(routes)/select-event-type/page";

describe("SelectEventTypePage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    (document as unknown as { cookie: string }).cookie = "";
  });

  it("mantiene Matrimonio READY e salva la scelta", async () => {
    window.localStorage.setItem("language", "it");
    window.localStorage.setItem("country", "it");

    render(<SelectEventTypePage />);

    const matchingButtons = await screen.findAllByRole("button", { name: /matrimonio/i });
    const btn = matchingButtons.find((button) => button.getAttribute("aria-disabled") === "false");
    expect(btn).toBeTruthy();
    expect(btn).toBeEnabled();
    expect(btn).toHaveTextContent(/disponibile/i);
    fireEvent.click(btn!);

    await waitFor(() => {
      expect(window.localStorage.getItem("eventType")).toBe("wedding");
      expect(document.cookie).toMatch(/eventType=wedding/);
    });
  });
});
