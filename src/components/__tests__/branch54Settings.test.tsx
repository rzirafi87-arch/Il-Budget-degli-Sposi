import { fireEvent, render, screen } from "@testing-library/react";
jest.mock("@/components/ThemeProvider", () => ({ useTheme: () => ({ preference: "light", setPreference: jest.fn() }) }));
jest.mock("@/components/CurrentEventSelector", () => ({ __esModule: true, default: () => null }));
jest.mock("next/navigation", () => ({ usePathname: () => "/it/auth", useRouter: () => ({ push: jest.fn() }) }));
import QuickSettings from "@/components/QuickSettings";

it("moves focus into settings, traps keyboard focus and restores it on Escape", () => {
  render(<QuickSettings />);
  const trigger = screen.getByRole("button", { name: "settings" });
  fireEvent.click(trigger);
  const dialog = screen.getByRole("dialog");
  expect(dialog.contains(document.activeElement)).toBe(true);
  const apply = screen.getByRole("button", { name: "apply" });
  apply.focus();
  fireEvent.keyDown(document, { key: "Tab" });
  expect(dialog.contains(document.activeElement)).toBe(true);
  expect(document.activeElement).not.toBe(apply);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
