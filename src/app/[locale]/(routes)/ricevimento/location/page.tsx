import { redirect } from "next/navigation";

export default async function LegacyRicevimentoLocationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/location`);
}
