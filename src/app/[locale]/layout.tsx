// Server component
// @ts-ignore
// (opz) ThemeProvider se lo usi: import { ThemeProvider } from "@/components/ThemeProvider";


// @ts-expect-error Next.js 16 dynamic layout type workaround: params typing mismatch
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import "../globals.css";

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
