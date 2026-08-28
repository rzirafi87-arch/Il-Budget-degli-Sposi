import WizardEntryGate from "@/components/routing/WizardEntryGate";

type Props = {
  params: Promise<{ locale?: string }>;
};

export default async function WizardPage({ params }: Props) {
  const { locale } = await params;
  return <WizardEntryGate locale={locale} />;
}
