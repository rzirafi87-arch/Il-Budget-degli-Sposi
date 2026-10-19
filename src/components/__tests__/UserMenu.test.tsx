import { act, fireEvent, render, screen } from "@testing-library/react";
import UserMenu from "@/components/UserMenu";

let mockPathname = "/it/dashboard";
jest.mock("next/navigation", () => ({ usePathname: () => mockPathname }));
jest.mock("next-intl", () => ({ useLocale: () => "it", useTranslations: () => (key: string) => key }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => <a {...props}>{children}</a> }));
jest.mock("@/components/LogoutButton", () => ({ __esModule: true, default: () => <button type="button">logout</button> }));
jest.mock("@/lib/supabaseBrowser", () => {
  const session = { access_token: "token", user: { email: "sposi@example.test" } };
  return {
    getBrowserClient: () => ({
      auth: {
        getSession: async () => ({ data: { session } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
      },
    }),
  };
});

beforeEach(() => {
  mockPathname = "/it/dashboard";
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ profile: { full_name: "Rocco" } }) })) as unknown as typeof fetch;
});

async function openMenu() {
  const view = render(<UserMenu />);
  const summary = await screen.findByText("Rocco");
  const details = summary.closest("details") as HTMLDetailsElement;
  details.open = true;
  return { ...view, details };
}

describe("UserMenu closes like a menu", () => {
  it("closes on a click outside", async () => {
    const { details } = await openMenu();
    act(() => { fireEvent.pointerDown(document.body); });
    expect(details.open).toBe(false);
  });

  it("stays open on a click inside", async () => {
    const { details } = await openMenu();
    act(() => { fireEvent.pointerDown(screen.getByText("sposi@example.test")); });
    expect(details.open).toBe(true);
  });

  it("closes on Escape", async () => {
    const { details } = await openMenu();
    act(() => { fireEvent.keyDown(document, { key: "Escape" }); });
    expect(details.open).toBe(false);
  });

  it("closes when the profile link is used", async () => {
    const { details } = await openMenu();
    fireEvent.click(screen.getByText("profile", { selector: "a" }));
    expect(details.open).toBe(false);
  });

  it("closes after client-side navigation", async () => {
    const { details, rerender } = await openMenu();
    mockPathname = "/it/profilo";
    rerender(<UserMenu />);
    expect(details.open).toBe(false);
  });
});
