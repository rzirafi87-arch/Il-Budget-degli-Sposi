// Server component
// @ts-ignore
import "@/app/globals.css";
import { LocaleProvider } from "@/providers/LocaleProvider";
// (opz) ThemeProvider se lo usi: import { ThemeProvider } from "@/components/ThemeProvider";

export const dynamic = "force-dynamic";

// @ts-expect-error Next.js 16 dynamic layout type workaround: params typing mismatch
export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-fg antialiased">
  <LocaleProvider initial={{ locale: locale as any }}>
          {/* <ThemeProvider attribute="class" defaultTheme="light" enableSystem> */}
            {children}
          {/* </ThemeProvider> */}
        </LocaleProvider>
      </body>
    </html>
  );
}
