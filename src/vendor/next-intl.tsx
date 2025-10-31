import React from 'react';

export function useTranslations(_ns?: string) {
  return (key: string, opts?: any) => (opts?.fallback ?? opts?.default ?? key);
}

export function IntlProvider({ children }: { children: React.ReactNode; messages?: any; locale?: string; timeZone?: string }) {
  return <>{children}</>;
}
