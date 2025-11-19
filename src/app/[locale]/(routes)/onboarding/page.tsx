\"use client\";

import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useAppContext } from "@/providers/AppContext";
import Link from "next/link";

export default function OnboardingPage() {
  const { locale } = useAppContext();
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Benvenuto!</h1>
      <p className="mb-4">Configura la lingua, la nazione e il tipo di evento per personalizzare la tua esperienza.</p>
      <LocaleSwitcher />
      <div className="mt-6">
        <Link href={`/${locale}/wizard`} className="btn bg-sage-600 text-white px-4 py-2 rounded-xl">Configura lingua/nazione/evento</Link>
      </div>
    </main>
  );
}
