import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import BudgetIdeaPage from "./page";

jest.mock("next-intl", () => ({
  useLocale: () => "it",
  useTranslations: () => (key: string, values?: Record<string, unknown>) => (values ? `${key}:${JSON.stringify(values)}` : key),
}));
jest.mock("@/lib/supabaseBrowser", () => ({
  getBrowserClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: "token" } } }) } }),
}));

type Saved = Array<Record<string, unknown>>;
let savedRows: Saved = [];
const posts: string[] = [];

beforeEach(() => {
  posts.length = 0;
  localStorage.clear();
  global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (init?.method === "POST") {
      posts.push(url);
      return { ok: true, json: async () => ({ success: true, inserted: 1 }) } as Response;
    }
    if (url.startsWith("/api/event/resolve")) return { ok: true, json: async () => ({ event: { event_type: "wedding", currency: "EUR", country: "it" } }) } as Response;
    return { ok: true, json: async () => ({ data: savedRows }) } as Response;
  }) as unknown as typeof fetch;
  window.confirm = jest.fn(() => true);
});

const firstCategory = () => screen.getAllByRole("button", { expanded: false })[0];

describe("Budget idea locks once saved", () => {
  it("opens editable when nothing was saved yet", async () => {
    savedRows = [];
    render(<BudgetIdeaPage />);
    await screen.findByText("actions.save");
    expect(screen.queryByText("actions.edit")).toBeNull();
    expect(screen.getByLabelText("contingencyPct")).not.toBeDisabled();
  });

  it("opens read-only when an idea was saved, and Edit unlocks it", async () => {
    savedRows = [{ category: "Addio al Nubilato", subcategory: "Cena", amount: 875, enabled: true }];
    render(<BudgetIdeaPage />);
    const edit = await screen.findByText("actions.edit");
    expect(screen.queryByText("actions.save")).toBeNull();
    expect(screen.getByText("messages.locked")).toBeInTheDocument();
    expect(screen.getByLabelText("contingencyPct")).toBeDisabled();
    fireEvent.click(firstCategory());
    const checkbox = screen.getAllByRole("checkbox")[0];
    expect(checkbox).toBeDisabled();

    fireEvent.click(edit);
    expect(screen.getByText("actions.save")).toBeInTheDocument();
    expect(screen.getByLabelText("contingencyPct")).not.toBeDisabled();
    expect(screen.getAllByRole("checkbox")[0]).not.toBeDisabled();
  });

  it("locks again after a successful save", async () => {
    savedRows = [];
    render(<BudgetIdeaPage />);
    fireEvent.click(await screen.findByText("actions.save"));
    await screen.findByText("actions.edit");
    expect(posts).toEqual(["/api/idea-di-budget"]);
  });

  it("asks before replacing previously applied items, and does nothing if refused", async () => {
    savedRows = [];
    (window.confirm as jest.Mock).mockReturnValueOnce(false);
    render(<BudgetIdeaPage />);
    const applyButton = await screen.findByText("actions.apply");
    await act(async () => { fireEvent.click(applyButton); });
    expect(window.confirm).toHaveBeenCalledWith("messages.applyConfirm");
    expect(posts).toEqual([]);

    await act(async () => { fireEvent.click(screen.getByText("actions.apply")); });
    await waitFor(() => expect(posts).toEqual(["/api/idea-di-budget", "/api/idea-di-budget/apply"]));
    await screen.findByText("actions.edit");
  });

  it("shows the contingency amount in the summary", async () => {
    savedRows = [];
    render(<BudgetIdeaPage />);
    await screen.findByText("actions.save");
    expect(screen.getByText(/summary\.contingency:\{"amount":".*€/)).toBeInTheDocument();
  });
});

describe("Budget idea summary copy", () => {
  // Locale files load in alphabetical order and later files win, so `<locale>.json`
  // overrides `budgetIdea.<locale>.json`: the placeholder must be there.
  it.each(["it", "en", "es", "fr", "de"])("%s shows the contingency amount", locale => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const messages = require(`../../../../messages/${locale}.json`) as { budgetIdea: { summary: { contingency: string } } };
    expect(messages.budgetIdea.summary.contingency).toContain("{amount}");
  });
});
