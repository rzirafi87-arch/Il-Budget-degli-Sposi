import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, THEME_STORAGE_KEY, useTheme } from "../ThemeProvider";

let systemDark = false;

function ThemeHarness() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  return <><output>{preference}:{resolvedTheme}</output><button onClick={() => setPreference("dark")}>dark</button><button onClick={() => setPreference("system")}>system</button></>;
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    systemDark = false;
    Object.defineProperty(window, "matchMedia", { configurable: true, value: jest.fn(() => ({ matches: systemDark, addEventListener: jest.fn(), removeEventListener: jest.fn() })) });
    document.documentElement.classList.remove("dark");
    document.documentElement.dataset.theme = "light";
  });

  it("defaults to light even when the operating system is dark", () => {
    systemDark = true;
    render(<ThemeProvider><ThemeHarness /></ThemeProvider>);
    expect(screen.getByText("light:light")).not.toBeNull();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("persists an explicit dark preference", () => {
    render(<ThemeProvider><ThemeHarness /></ThemeProvider>);
    fireEvent.click(screen.getByRole("button", { name: "dark" }));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("uses the system preference only after system is selected", () => {
    systemDark = true;
    render(<ThemeProvider><ThemeHarness /></ThemeProvider>);
    fireEvent.click(screen.getByRole("button", { name: "system" }));
    expect(screen.getByText("system:dark")).not.toBeNull();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });
});
