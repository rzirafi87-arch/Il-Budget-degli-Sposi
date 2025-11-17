import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// Mock next/navigation router to avoid real navigation in jsdom
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

// Simple fetch mock for the traditions preview
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ traditions: [] }) })
  ) as unknown as typeof fetch;
});

import SelectEventTypePage from "../[locale]/(routes)/select-event-type/page";

describe("SelectEventTypePage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    (document as unknown as { cookie: string }).cookie = "";
  });

  it("mostra i tipi di evento e salva la scelta", async () => {
    // Imposta lingua e paese per evitare redirect iniziali
    window.localStorage.setItem("language", "it");
    window.localStorage.setItem("country", "it");

    render(<SelectEventTypePage />);

    // Seleziona il bottone evento con name "Matrimonio Scopri di più"
    const buttons = await screen.findAllByRole("button", {
      name: /Matrimonio Scopri di più/i,
    });
    // Scegli il bottone che ha come label evento esattamente "Matrimonio"
    const btn = buttons.find(
      (b) =>
        b.textContent &&
        b.textContent.includes("Matrimonio") &&
        !b.textContent.includes("Anniversario")
    );
    expect(btn).toBeTruthy();
    fireEvent.click(btn!);

    await waitFor(() => {
      expect(window.localStorage.getItem("eventType")).toBe("wedding");
      expect(document.cookie).toMatch(/eventType=wedding/);
    });
  });
});
