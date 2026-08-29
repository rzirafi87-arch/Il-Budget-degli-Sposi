import { redirect } from "next/navigation";

export default async function WelcomePage({ params }: { params: Promise<{ locale?: string }> }) {
  const { locale = "it" } = await params;
  redirect(`/${locale}`);
}
