// Minimal stub for app-settings context/provider

import React from "react";

export function useAppSettings() {
  // Return demo settings for now
  return {
    locale: 'it',
    theme: 'default',
    countryCode: 'IT',
    eventType: 'wedding',
  };
}

// Minimal AppSettingsProvider for layout usage
export function AppSettingsProvider({ initialLocale, children }: { initialLocale: string, children: React.ReactNode }) {
  // In a real app, would provide context. Here, just render children.
  return <>{children}</>;
}
