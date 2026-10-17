import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProgressiveSetup from "@/components/dashboard/ProgressiveSetup";
import PartnerLifecycleSection from "@/components/PartnerLifecycleSection";

const mockSession = jest.fn();
jest.mock("@/lib/supabaseBrowser", () => ({ getBrowserClient: () => ({ auth: { getSession: mockSession } }) }));
jest.mock("next-intl", () => ({ useLocale: () => "it", useTranslations: () => (key: string) => key }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a> }));

beforeEach(() => {
  mockSession.mockResolvedValue({ data: { session: { access_token: "test" } } });
  global.fetch = jest.fn();
});

it("offers checklist retry after a failed read, then resumes from persisted facts", async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true, json: async () => ({ event: { total_budget: 100, has_budget_items: false, has_expenses: false, has_saved_suppliers: false } }) });
  render(<ProgressiveSetup />);
  expect(await screen.findByRole("alert")).toHaveTextContent("loadError");
  fireEvent.click(screen.getByRole("button", { name: "retry" }));
  await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  expect(await screen.findByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  expect(screen.getByRole("link", { name: "firstValue" })).toHaveAttribute("href", "/it/budget");
});

it("counts a saved supplier as first value without pretending it was selected", async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ event: { total_budget: 100, has_saved_suppliers: true, has_suppliers: false } }) });
  render(<ProgressiveSetup />);
  expect(await screen.findByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  expect(screen.getByRole("link", { name: "suppliers" })).toBeInTheDocument();
});

it("offers partner read retry and hides backend error text", async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ error: "secret@example.com backend details" }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ members: [], accessRole: "owner" }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ invitations: [] }) });
  render(<PartnerLifecycleSection />);
  expect(await screen.findByRole("alert")).not.toHaveTextContent("secret@example.com");
  fireEvent.click(screen.getByRole("button", { name: "retry" }));
  expect(await screen.findByRole("button", { name: "invite" })).toBeInTheDocument();
});
