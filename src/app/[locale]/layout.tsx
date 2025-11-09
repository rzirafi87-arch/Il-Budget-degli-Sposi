// Server component
import "@/app/globals.css";
import { ReactNode } from "react";
import { LocaleProvider } from "@/components/LocaleProvider";
// (opz) ThemeProvider se lo usi: import { ThemeProvider } from "@/components/ThemeProvider";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  // Se hai una lista di lingue, mettila qui; altrimenti ometti questa funzione
  return [{ locale: "it" }, { locale: "en" }];
}

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
