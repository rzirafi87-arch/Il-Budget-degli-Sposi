import { buildLocalizedPath } from "@/lib/localizedPath";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale?: string }>;
};

export default async function LocaleHome({ params }: Props) {
  const { locale } = await params;
  // Quando apri /it, /en, ecc. → vai al wizard
  redirect(buildLocalizedPath(locale, "/wizard"));
}
