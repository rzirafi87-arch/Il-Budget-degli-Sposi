import { redirect } from "next/navigation";

type Props = {
  params: { locale: string };
};

export default async function LocaleHome({ params }: Props) {
  // Quando apri /it, /en, ecc. → vai al wizard
  const { locale } = await params;
  const safeLocale = locale && locale !== "undefined" ? locale : "it";
  redirect(`/${safeLocale}/wizard`);
}
