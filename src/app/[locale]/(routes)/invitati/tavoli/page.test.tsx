import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "./page";

jest.mock("@/lib/supabaseBrowser", () => ({ getBrowserClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: "token" } } }) } }) }));

describe("RSVP changes in persisted table plans", () => {
  beforeEach(() => { window.confirm = jest.fn(() => true); });
  it.each(["regenerate", "unassign", "delete"])("does not seat declined guests after %s", async (action) => {
    const table = { id: "table", tableNumber: 1, totalSeats: 8, assignedGuests: [
      { guestId: "yes", guestName: "Attending", guestType: "common", attending: true },
      { guestId: "no", guestName: "Declined", guestType: "common", attending: false },
    ] };
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ tables: [table], availableGuests: [] }) });
    global.fetch = fetchMock;
    render(<Page />);
    await screen.findByText("Declined");
    if (action === "unassign") fireEvent.click(screen.getAllByText("unassign")[1]);
    if (action === "delete") {
      fireEvent.click(screen.getByText("deleteTable"));
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(screen.queryByText("Declined")).not.toBeInTheDocument());
    }
    fireEvent.click(screen.getByText("autoAssign"));
    expect(screen.queryByText("Declined")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("save"));
    await waitFor(() => expect(fetchMock.mock.calls.some(([, init]) => init?.method === "POST")).toBe(true));
    const saved = JSON.parse(fetchMock.mock.calls.find(([, init]) => init?.method === "POST")![1].body);
    expect(saved.tables.flatMap((value: { assignedGuests: Array<{ guestId: string }> }) => value.assignedGuests).map((guest: { guestId: string }) => guest.guestId)).not.toContain("no");
    await screen.findByText("saved");
  });

  it("persists an empty regenerated plan when every seated guest has declined", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ tables: [{ id: "table", totalSeats: 8, assignedGuests: [{ guestId: "no", guestName: "Declined", guestType: "common", attending: false }] }], availableGuests: [] }) });
    global.fetch = fetchMock;
    render(<Page />);
    await screen.findByText("Declined");
    fireEvent.click(screen.getByText("autoAssign"));
    expect(screen.queryByText("Declined")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("save"));
    await waitFor(() => expect(fetchMock.mock.calls.some(([, init]) => init?.method === "POST")).toBe(true));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ tables: [], replace: true });
    await screen.findByText("saved");
  });
});
