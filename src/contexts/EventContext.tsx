"use client";
import { createContext, useContext } from "react";

export type EventType = "WEDDING" | "BIRTHDAY" | "BAPTISM" | "EIGHTEENTH" | "ANNIVERSARY" |
  "GENDER_REVEAL" | "FIFTY" | "RETIREMENT" | "CONFIRMATION" | "GRADUATION" |
  "BABY_SHOWER" | "ENGAGEMENT" | "PROPOSAL" | "COMMUNION" | "BAR_MITZVAH" |
  "QUINCEANERA" | "CORP_EVENT" | "CHARITY_GALA" | "OTHER";

type EventContextType = {
  eventType: EventType;
};

const EventContext = createContext<EventContextType>({ eventType: "WEDDING" });

export function EventProvider({
  eventType,
  children
}: {
  eventType: EventType;
  children: React.ReactNode;
}) {
  return <EventContext.Provider value={{ eventType }}>{children}</EventContext.Provider>;
}

export function useEvent() {
  return useContext(EventContext);
}
