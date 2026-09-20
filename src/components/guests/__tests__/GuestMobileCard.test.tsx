import { fireEvent, render, screen } from "@testing-library/react";
import { GuestMobileCard, type MobileGuest } from "../GuestMobileCard";

const guest: MobileGuest = {
  id: "guest-1",
  name: "Giuseppina Maria D’Angelo della Famiglia con un Nome Molto Lungo",
  guestType: "bride",
  isMainContact: true,
  familyGroupId: "family-1",
  familyGroupName: "Famiglia D’Angelo-Rossi con denominazione molto lunga",
  excludeFromFamilyTable: false,
  invitationDate: "2026-09-20",
  rsvpReceived: true,
  attending: true,
  menuPreferences: ["vegetariano"],
  receivesBomboniera: true,
  allergiesIntolerances: "Glutine e lattosio",
  notes: "Contatto principale",
};

describe("GuestMobileCard", () => {
  it("keeps long names and family names readable and edits the correct guest", () => {
    const onChange = jest.fn();
    const onChangeMultiple = jest.fn();
    const onDelete = jest.fn();
    render(
      <GuestMobileCard
        guest={guest}
        families={[{ id: "family-1", familyName: guest.familyGroupName! }, { id: "family-2", familyName: "Famiglia Álvarez" }]}
        onChange={onChange}
        onChangeMultiple={onChangeMultiple}
        onToggleMenu={jest.fn()}
        onDelete={onDelete}
      />,
    );

    const name = screen.getByLabelText("fieldLabels.name");
    expect((name as HTMLTextAreaElement).value).toBe(guest.name);
    expect(name.classList.contains("whitespace-normal")).toBe(true);
    expect(name.classList.contains("break-words")).toBe(true);
    expect(screen.getByTestId("selected-family-name").textContent).toContain(guest.familyGroupName!);

    fireEvent.change(name, { target: { value: "María José D’Àngelo" } });
    expect(onChange).toHaveBeenCalledWith("name", "María José D’Àngelo");

    fireEvent.change(screen.getByLabelText("fieldLabels.family"), { target: { value: "family-2" } });
    expect(onChangeMultiple).toHaveBeenCalledWith({ familyGroupId: "family-2", familyGroupName: "Famiglia Álvarez" });

    fireEvent.click(screen.getByRole("button", { name: "actions.deleteGuest" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("exposes labelled touch controls, focus, status, and the no-family state", () => {
    const noFamilyGuest = { ...guest, id: "guest-2", familyGroupId: undefined, familyGroupName: undefined };
    render(
      <GuestMobileCard
        guest={noFamilyGuest}
        families={[]}
        onChange={jest.fn()}
        onChangeMultiple={jest.fn()}
        onToggleMenu={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByTestId("selected-family-name").textContent).toContain("families.none");
    expect(screen.getByText("columns.mainContact")).not.toBeNull();
    expect(screen.getByText("columns.rsvpReceived")).not.toBeNull();
    expect(screen.getByText("columns.attending")).not.toBeNull();

    const typeSelect = screen.getByLabelText("fieldLabels.type");
    typeSelect.focus();
    expect(document.activeElement).toBe(typeSelect);
    expect(screen.getByText("mobile.editDetails").closest("summary")?.classList.contains("min-h-11")).toBe(true);
  });
});
