import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EventDeletionSection from "@/components/EventDeletionSection";

jest.mock("next-intl", () => ({
  useLocale: () => "it",
  useTranslations: () => (key: string, values?: Record<string, string>) =>
    values?.event
      ? `${key}:${values.event}`
      : values?.code
        ? `${key}:${values.code}`
        : key,
}));
jest.mock("@/lib/supabaseBrowser", () => ({
  getBrowserClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: { access_token: "jwt" } } }),
    },
  }),
}));

const current = {
  status: "RESOLVED",
  currentEvent: {
    eventId: "11111111-1111-1111-1111-111111111111",
    name: "Nozze A",
    eventType: "wedding",
    accessRole: "owner",
  },
};

describe("EventDeletionSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => current });
  });
  it("requires exact typed confirmation and supports cancel/focus return", async () => {
    render(<EventDeletionSection />);
    const open = await screen.findByRole("button", { name: "open" });
    fireEvent.click(open);
    const confirm = screen.getByRole("button", { name: "confirm" });
    expect(confirm.hasAttribute("disabled")).toBe(true);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Nozze A" },
    });
    expect(confirm.hasAttribute("disabled")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "cancel" }));
    await waitFor(() => expect(document.activeElement).toBe(open));
  });
  it("shows a stable API error and prevents duplicate submission", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "EVENT_DELETE_FAILED" }),
    });
    render(<EventDeletionSection />);
    fireEvent.click(await screen.findByRole("button", { name: "open" }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Nozze A" },
    });
    fireEvent.click(screen.getByRole("button", { name: "confirm" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "EVENT_DELETE_FAILED",
    );
  });
});
