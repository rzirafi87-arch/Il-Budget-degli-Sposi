// Server component
import "@/app/globals.css";
import { LocaleProvider } from "@/providers/LocaleProvider";
import { ReactNode } from "react";
// (opz) ThemeProvider se lo usi: import { ThemeProvider } from "@/components/ThemeProvider";

export const dynamic = "force-dynamic";


export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <LocaleProvider locale={locale}>
          {/* <ThemeProvider attribute="class" defaultTheme="light" enableSystem> */}
            {children}
          {/* </ThemeProvider> */}
        </LocaleProvider>
      </body>
    </html>
  );
}
