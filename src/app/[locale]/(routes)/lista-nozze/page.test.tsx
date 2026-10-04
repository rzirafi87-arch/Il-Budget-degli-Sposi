import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "./page";

jest.mock("@/components/PageInfoNote", () => ({ __esModule: true, default: () => null }));
jest.mock("@/lib/supabaseBrowser", () => ({ getBrowserClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: "token" } } }) } }) }));
jest.mock("next-intl", () => ({ useLocale: () => "it", useTranslations: () => (key: string) => {
  if (key.startsWith("types.") && !["honeymoon", "cash", "experiences", "furniture", "appliances", "luxury", "charity", "vouchers", "smartHome", "other"].includes(key.slice(6))) throw new Error(`MISSING_MESSAGE ${key}`);
  return key;
} }));

const mappings = [
  ["Contributo viaggio di nozze", "honeymoon"], ["Cassa comune", "cash"],
  ["Esperienze (cene, spa, tour)", "experiences"], ["Arredamento", "furniture"],
  ["Elettrodomestici", "appliances"], ["Beni di lusso", "luxury"],
  ["Beneficenza", "charity"], ["Buoni regalo", "vouchers"],
  ["Tech & Smart Home", "smartHome"], ["Altro", "other"],
] as const;
const cases: Array<readonly [string, string]> = [...mappings, ...mappings.map(([, key]) => [key, key] as const), ["Custom historical type", "Custom historical type"]];

describe("gift type compatibility in the new UI", () => {
  beforeEach(() => {
    localStorage.setItem("eventType", "wedding");
    window.scrollTo = jest.fn();
  });

  it.each(cases)("renders and edits %s without losing its type", async (stored, expected) => {
    const item = { id: "gift-id", type: stored, name: "Gift", priority: "medium", status: "wanted", description: "", notes: "", url: "" };
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [item], item: { ...item, type: expected } }) });
    global.fetch = fetchMock;
    render(<Page />);
    await screen.findByText("Gift");
    expect(screen.getByText(stored === "Custom historical type" ? `${stored} · priorities.medium` : `types.${expected} · priorities.medium`)).toBeInTheDocument();
    fireEvent.click(screen.getByText("edit"));
    expect(screen.getByLabelText("fields.type")).toHaveValue(expected);
    fireEvent.click(screen.getByText("saveChanges"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const body = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(body).toMatchObject({ id: "gift-id", type: expected, name: "Gift" });
    await screen.findByText("updated");
  });
});
