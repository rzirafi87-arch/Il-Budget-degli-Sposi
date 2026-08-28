import AppEntryGate from "@/components/routing/AppEntryGate";

type Props = {
  params: Promise<{ locale?: string }>;
};

export default async function LocaleHome({ params }: Props) {
  const { locale } = await params;
  return <AppEntryGate locale={locale} />;
}
