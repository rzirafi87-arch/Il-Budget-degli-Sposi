import { IntlProvider } from "@/vendor/next-intl";
import { render, screen } from "@testing-library/react";
import NavTabs from "../NavTabs";

describe("NavTabs label rendering", () => {
  it("shows Location Ricevimento and Location Cerimonia in italian", () => {
    render(
      <IntlProvider
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
          contabilità: "Contabilità",
          invitati: "Invitati",
          preferiti: "Preferiti",
          spese: "Spese",
        }}
      >
        <NavTabs />
  </IntlProvider>
    );
    expect(screen.getByText("Location Ricevimento")).not.toBeNull();
    expect(screen.getByText("Location Cerimonia")).not.toBeNull();
  });
});
