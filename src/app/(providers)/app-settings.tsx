import { cookies } from "next/headers";
import { type ReactNode } from "react";
import { AppContextProvider } from "@/providers/AppContext";

type AppSettingsProviderProps = {
  initialLocale: string;
  children: ReactNode;
};

export default async function AppSettingsProvider({
  initialLocale,
  children,
}: AppSettingsProviderProps) {
  const cookieStore = await cookies();
  const countryCode =
    cookieStore.get("country_code")?.value ?? cookieStore.get("country")?.value;
  const eventType =
    cookieStore.get("event_type")?.value ?? cookieStore.get("eventType")?.value;

  return (
    <AppContextProvider
      initialLocale={initialLocale}
      initialCountryCode={countryCode ?? undefined}
      initialEventType={eventType ?? undefined}
    >
      {children}
    </AppContextProvider>
  );
}
