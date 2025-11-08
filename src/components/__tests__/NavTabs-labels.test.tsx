import { render, screen } from "@testing-library/react";
import { NextIntlProvider } from "next-intl";
import NavTabs from "../NavTabs";

describe("NavTabs label rendering", () => {
  it("shows Location Ricevimento and Location Cerimonia in italian", () => {
    render(
      <NextIntlProvider
        locale="it"
        messages={{
          locationReception: "Location Ricevimento",
          locationCeremony: "Location Cerimonia",
          dashboard: "Dashboard",
          budget: "Budget",
          fornitori: "Fornitori",
          guests: "Invitati",
          accounting: "Contabilità",
          suppliers: "Fornitori",
          saveTheDate: "Save the Date",
          ideaBudget: "Idea di Budget",
          weddingThings: "Cose matrimonio",
          favorites: "Preferiti",
          documents: "Documenti",
          suggestions: "Suggerimenti",
          auth: "Accedi",
          chat: "Chatta con noi su WhatsApp",
          settings: "Impostazioni",
        }}
      >
        <NavTabs />
      </NextIntlProvider>
    );
    expect(screen.getByText("Location Ricevimento")).toBeInTheDocument();
    expect(screen.getByText("Location Cerimonia")).toBeInTheDocument();
  });
});
