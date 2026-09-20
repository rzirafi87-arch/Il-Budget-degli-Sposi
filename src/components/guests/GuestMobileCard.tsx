"use client";

import { AppButton } from "@/components/ui/AppButton";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";

export type GuestMenuPreference = "carne" | "pesce" | "baby" | "animazione" | "vegetariano" | "posto_tavolo";

export type MobileGuest = {
  id?: string;
  name: string;
  guestType: "bride" | "groom" | "common";
  isMainContact: boolean;
  familyGroupId?: string;
  familyGroupName?: string;
  excludeFromFamilyTable: boolean;
  invitationDate: string;
  rsvpReceived: boolean;
  attending: boolean;
  menuPreferences: GuestMenuPreference[];
  receivesBomboniera: boolean;
  allergiesIntolerances: string;
  notes: string;
};

export type MobileFamilyGroup = {
  id?: string;
  familyName: string;
};

type Props = {
  guest: MobileGuest;
  families: readonly MobileFamilyGroup[];
  onChange: (field: keyof MobileGuest, value: string | boolean | string[]) => void;
  onChangeMultiple: (updates: Partial<MobileGuest>) => void;
  onToggleMenu: (preference: GuestMenuPreference) => void;
  onDelete: () => void;
};

const MENU_PREFERENCES: readonly GuestMenuPreference[] = [
  "carne",
  "pesce",
  "baby",
  "animazione",
  "vegetariano",
  "posto_tavolo",
];

const MENU_ICONS: Record<GuestMenuPreference, string> = {
  carne: "🥩",
  pesce: "🐟",
  baby: "👶",
  animazione: "🎪",
  vegetariano: "🥗",
  posto_tavolo: "💺",
};

export function GuestMobileCard({
  guest,
  families,
  onChange,
  onChangeMultiple,
  onToggleMenu,
  onDelete,
}: Props) {
  const t = useTranslations("guestsPage");
  const generatedId = useId();
  const prefix = `guest-${guest.id || generatedId.replaceAll(":", "")}`;
  const displayName = guest.name || t("list.guestFallback");
  const selectedFamily = families.find((family) => family.id === guest.familyGroupId);

  return (
    <article
      className="app-card app-card--md min-w-0 space-y-4"
      data-testid={`mobile-guest-${guest.id || "new"}`}
      aria-labelledby={`${prefix}-title`}
    >
      <div className="min-w-0">
        <label id={`${prefix}-title`} htmlFor={`${prefix}-name`} className="app-label block">
          {t("columns.name")}
        </label>
        <textarea
          id={`${prefix}-name`}
          rows={2}
          className="app-input mt-1 min-h-16 w-full resize-y whitespace-normal break-words text-base font-semibold"
          value={guest.name}
          onChange={(event) => onChange("name", event.target.value)}
          placeholder={t("list.namePlaceholder")}
          aria-label={t("fieldLabels.name", { name: displayName })}
        />
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label htmlFor={`${prefix}-type`} className="app-label min-w-0">
          {t("columns.type")}
          <select
            id={`${prefix}-type`}
            className="app-select mt-1 w-full"
            value={guest.guestType}
            onChange={(event) => onChange("guestType", event.target.value)}
            aria-label={t("fieldLabels.type", { name: displayName })}
          >
            <option value="common">{t("guestTypes.common")}</option>
            <option value="bride">{t("guestTypes.bride")}</option>
            <option value="groom">{t("guestTypes.groom")}</option>
          </select>
        </label>

        <label htmlFor={`${prefix}-family`} className="app-label min-w-0">
          {t("columns.family")}
          <select
            id={`${prefix}-family`}
            className="app-select mt-1 w-full"
            value={guest.familyGroupId || ""}
            onChange={(event) => {
              const familyId = event.target.value || undefined;
              const family = families.find((entry) => entry.id === familyId);
              onChangeMultiple({ familyGroupId: familyId, familyGroupName: family?.familyName });
            }}
            aria-label={t("fieldLabels.family", { name: displayName })}
          >
            <option value="">{t("families.none")}</option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>{family.familyName}</option>
            ))}
          </select>
          <span className="app-helper mt-1 block whitespace-normal break-words" data-testid="selected-family-name">
            {selectedFamily?.familyName || t("families.none")}
          </span>
        </label>
      </div>

      <fieldset className="min-w-0 rounded-xl border border-border p-3">
        <legend className="px-1 text-sm font-semibold text-fg">{t("mobile.status")}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={guest.isMainContact}
              onChange={(event) => onChange("isMainContact", event.target.checked)}
              className="h-5 w-5 shrink-0"
            />
            <span>{t("columns.mainContact")}</span>
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={guest.rsvpReceived}
              onChange={(event) => onChange("rsvpReceived", event.target.checked)}
              className="h-5 w-5 shrink-0"
            />
            <span>{t("columns.rsvpReceived")}</span>
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={guest.attending}
              onChange={(event) => onChange("attending", event.target.checked)}
              className="h-5 w-5 shrink-0"
            />
            <span>{t("columns.attending")}</span>
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={guest.excludeFromFamilyTable}
              onChange={(event) => onChange("excludeFromFamilyTable", event.target.checked)}
              className="h-5 w-5 shrink-0"
              disabled={!guest.familyGroupId}
            />
            <span>{t("columns.separate")}</span>
          </label>
        </div>
      </fieldset>

      <details className="group rounded-xl border border-border bg-bg">
        <summary className="flex min-h-11 cursor-pointer items-center px-3 py-2 font-semibold text-primary">
          {t("mobile.editDetails")}
        </summary>
        <div className="space-y-4 border-t border-border p-3">
          <label htmlFor={`${prefix}-invitation-date`} className="app-label block">
            {t("columns.invitationDate")}
            <input
              id={`${prefix}-invitation-date`}
              type="date"
              className="app-input mt-1"
              value={guest.invitationDate}
              onChange={(event) => onChange("invitationDate", event.target.value)}
            />
          </label>

          <fieldset>
            <legend className="app-label">{t("columns.menu")}</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {MENU_PREFERENCES.map((preference) => (
                <button
                  key={preference}
                  type="button"
                  onClick={() => onToggleMenu(preference)}
                  className={`min-h-11 rounded-lg border px-2 py-2 text-left text-sm ${
                    guest.menuPreferences.includes(preference)
                      ? "border-primary bg-primary text-primary-fg"
                      : "border-border bg-muted text-fg"
                  }`}
                  aria-pressed={guest.menuPreferences.includes(preference)}
                >
                  <span aria-hidden>{MENU_ICONS[preference]}</span>{" "}{t(`menu.${preference}`)}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex min-h-11 items-center gap-3 rounded-lg text-sm text-fg">
            <input
              type="checkbox"
              checked={guest.receivesBomboniera}
              onChange={(event) => onChange("receivesBomboniera", event.target.checked)}
              className="h-5 w-5 shrink-0"
            />
            <span>{t("columns.favour")}</span>
          </label>

          <label htmlFor={`${prefix}-allergies`} className="app-label block">
            {t("columns.allergies")}
            <textarea
              id={`${prefix}-allergies`}
              rows={2}
              className="app-input mt-1 min-h-16 resize-y"
              value={guest.allergiesIntolerances}
              onChange={(event) => onChange("allergiesIntolerances", event.target.value)}
              placeholder={t("list.allergiesPlaceholder")}
            />
          </label>

          <label htmlFor={`${prefix}-notes`} className="app-label block">
            {t("columns.notes")}
            <textarea
              id={`${prefix}-notes`}
              rows={2}
              className="app-input mt-1 min-h-16 resize-y"
              value={guest.notes}
              onChange={(event) => onChange("notes", event.target.value)}
            />
          </label>
        </div>
      </details>

      <div className="flex justify-end">
        <AppButton
          type="button"
          variant="ghost"
          className="text-red-700 dark:text-red-300"
          onClick={onDelete}
          aria-label={t("actions.deleteGuest", { name: displayName })}
        >
          <Trash2 size={18} aria-hidden />
          {t("actions.delete")}
        </AppButton>
      </div>
    </article>
  );
}
