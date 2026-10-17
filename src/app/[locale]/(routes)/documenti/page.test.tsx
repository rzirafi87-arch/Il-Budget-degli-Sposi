import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "./page";
jest.mock("@/components/PageInfoNote", () => ({ __esModule: true, default: () => null }));
jest.mock("@/lib/supabaseBrowser", () => ({ getBrowserClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: "token" } } }) } }) }));

const doc = { id: "doc", name: "pending.pdf", category: "generic", mimeType: "application/pdf", fileSize: 1, uploadedAt: "2026-10-04" };
describe("retryable document deletion", () => {
  beforeEach(() => { window.confirm = jest.fn(() => true); });
  it("downloads response bytes using a temporary local URL and revokes it", async () => {
    const blob = new Blob(["private bytes"]);
    const json = jest.fn();
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ documents: [doc] }) })
      .mockResolvedValueOnce({ ok: true, blob: async () => blob, json });
    URL.createObjectURL = jest.fn(() => "blob:local-document");
    URL.revokeObjectURL = jest.fn();
    const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<Page />);
    await screen.findByText(doc.name);
    fireEvent.click(screen.getByRole("button", { name: "downloadNamed" }));
    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(json).not.toHaveBeenCalled();
    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:local-document"), { timeout: 2000 });
    click.mockRestore();
  });
  it("retains a retry action after a transient deletion failure", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ documents: [doc] }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ deletionPending: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    global.fetch = fetchMock;
    render(<Page />);
    await screen.findByText(doc.name);
    fireEvent.click(screen.getByRole("button", { name: "deleteNamed" }));
    await screen.findByTestId("pending-document-doc");
    expect(screen.queryByRole("button", { name: "downloadNamed" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("pending-document-doc").querySelector("button")!);
    await waitFor(() => expect(screen.queryByText(doc.name)).not.toBeInTheDocument());
    expect(fetchMock.mock.calls[2][0]).toBe("/api/my/documents/doc");
    expect(fetchMock.mock.calls[2][1].method).toBe("DELETE");
  });
  it("recovers pending deletions after a fresh page load", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ documents: [], pendingDeletions: [{ id: doc.id, name: doc.name }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    global.fetch = fetchMock;
    render(<Page />);
    await screen.findByTestId("pending-document-doc");
    fireEvent.click(screen.getByTestId("pending-document-doc").querySelector("button")!);
    await waitFor(() => expect(screen.queryByText(doc.name)).not.toBeInTheDocument());
    expect(fetchMock.mock.calls[1][0]).toBe("/api/my/documents/doc");
  });
});
