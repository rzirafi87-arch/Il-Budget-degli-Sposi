import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BudgetPage from "../[locale]/(routes)/budget/page";
jest.mock("next-intl", () => { const t = (key: string) => key; return {useLocale:()=>"it",useTranslations:()=>t}; });
jest.mock("@/lib/supabaseBrowser", () => ({ getBrowserClient: () => ({auth:{getSession: async () => ({data:{session:{access_token:"test"}}})}})}));
jest.mock("@/components/ExportPDFButton",()=>({__esModule:true,default:()=>null}));
jest.mock("@/components/ImageCarousel",()=>({__esModule:true,default:()=>null}));
jest.mock("@/components/expenses/ExpenseForm",()=>({ExpenseForm:()=>null}));

test("Budget includes approved expenses only, matching Accounting totals", async () => {
  global.fetch=jest.fn(async (url)=>({ok:true,json:async()=>String(url).includes("budget-items") ? {items:[{name:"APPROVED_COST",amount:100}]} : {expenses:[
    {status:"approved",category:"Cerimonia",subcategory:"APPROVED_COST",amount:80,committed:80,paid:20},
    {status:"pending",category:"Cerimonia",subcategory:"PENDING_QUOTE",amount:1150,committed:1150},
    {status:"rejected",category:"Cerimonia",subcategory:"REJECTED_COST",amount:200},
    {category:"Cerimonia",subcategory:"UNKNOWN_STATUS",amount:300},
  ]}})) as jest.Mock;
  render(<BudgetPage/>);
  await waitFor(()=>expect(screen.getAllByText(/APPROVED_COST/).length).toBeGreaterThan(0));
  expect(screen.getByText(/budgetPage.plannedVsActual.under/)).toBeInTheDocument();
  expect(screen.queryByText(/budgetPage.plannedVsActual.over/)).not.toBeInTheDocument();
  expect(screen.queryByText("PENDING_QUOTE")).not.toBeInTheDocument();
  expect(screen.queryByText("REJECTED_COST")).not.toBeInTheDocument();
  expect(screen.queryByText("UNKNOWN_STATUS")).not.toBeInTheDocument();
});

test("an API failure is shown as an error and can be retried without a false empty budget", async () => {
  global.fetch=jest.fn().mockResolvedValueOnce({ok:false,json:async()=>({error:"failed"})})
    .mockResolvedValueOnce({ok:true,json:async()=>({items:[]})})
    .mockImplementation(async (url)=>({ok:true,json:async()=>String(url).includes("budget-items") ? {items:[]} : {expenses:[]}}));
  render(<BudgetPage/>);
  expect(await screen.findByRole("alert")).toHaveTextContent("budgetPage.loadError");
  expect(screen.queryByText("budgetPage.emptyTitle")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", {name:"budgetPage.retry"}));
  await waitFor(()=>expect(screen.getAllByText("budgetPage.emptyTitle").length).toBeGreaterThan(0));
});
