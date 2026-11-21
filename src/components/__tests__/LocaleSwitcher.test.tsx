import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LocaleSwitcher from "../LocaleSwitcher";

jest.mock("next-intl", () => { const t = (key: string) => key; return { useLocale: () => "it", useTranslations: () => t }; });

jest.mock("next/navigation", () => ({ useRouter: () => ({push: jest.fn()}), usePathname: () => "/it/dashboard" }));

describe("tester header preferences", () => {
  it("keeps language and country usable without changing the active event", async () => {
    localStorage.setItem("eventType", "wedding");
    global.fetch = jest.fn(async (url) => ({json: async () => String(url) === "/api/locales"
      ? {locales: [{code:"it",name:"Italiano",selectable:true}]}
      : {countries: [{code:"it",name:"Italia"}]}})) as jest.Mock;
    render(<LocaleSwitcher />);
    await waitFor(() => expect(screen.getAllByRole("combobox")).toHaveLength(2));
    expect(screen.queryByRole("combobox", {name:"event"})).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", {name:"country"}), {target:{value:"it"}});
    expect(localStorage.getItem("country")).toBe("it");
    expect(localStorage.getItem("eventType")).toBe("wedding");
    expect(global.fetch).not.toHaveBeenCalledWith("/api/events");
  });
});
