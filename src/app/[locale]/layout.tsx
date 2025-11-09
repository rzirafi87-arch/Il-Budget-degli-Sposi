// Server component
import "@/app/globals.css";
import { LocaleProvider } from "@/providers/LocaleProvider";
import type { LayoutProps } from "next";
// (opz) ThemeProvider se lo usi: import { ThemeProvider } from "@/components/ThemeProvider";

export const dynamic = "force-dynamic";


  children,
  params,
}: LayoutProps) {
  const { locale } = params;
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
