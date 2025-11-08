import { render, screen } from "@testing-library/react";
import { NextIntlProvider } from "next-intl";
import NavTabs from "../NavTabs";

describe("NavTabs label rendering", () => {
  it("shows Location Ricevimento and Location Cerimonia in italian", () => {
    render(
      <NextIntlProvider locale="it" messages={{
        locationReception: "Location Ricevimento",
        locationCeremony: "Location Cerimonia",
        dashboard: "Dashboard",
        budget: "Budget",
        fornitori: "Fornitori",
        // ...other required keys as needed
      }}>
        <NavTabs />
      </NextIntlProvider>
    );
    expect(screen.getByText("Location Ricevimento")).toBeInTheDocument();
    expect(screen.getByText("Location Cerimonia")).toBeInTheDocument();
  });
});
