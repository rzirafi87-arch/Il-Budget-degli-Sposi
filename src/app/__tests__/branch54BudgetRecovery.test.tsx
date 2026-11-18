import { fireEvent, render, screen } from "@testing-library/react";
jest.mock("@/lib/supabaseBrowser", () => ({ getBrowserClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: "test" } } }) } }) }));
jest.mock("@/components/ImageCarousel", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/ExportPDFButton", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/expenses/ExpenseForm", () => ({ ExpenseForm: () => null }));
jest.mock("next-intl", () => ({ useLocale: () => "it", useTranslations: () => (key: string) => key }));
import BudgetPage from "../[locale]/(routes)/budget/page";

it("does not present failed reads as an empty budget and allows retry", async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, json: async () => ({}) }).mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) });
  render(<BudgetPage />);
  expect(await screen.findByRole("alert")).toHaveTextContent("loadError");
  expect(screen.queryByText("budgetPage.emptyTitle")).not.toBeInTheDocument();
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ expenses: [], items: [] }) });
  fireEvent.click(screen.getByRole("button", { name: "retry" }));
  expect((await screen.findAllByText("budgetPage.emptyTitle")).length).toBeGreaterThan(0);
});
