"use client";
import { useAppSettings } from "@/app/(providers)/app-settings";
import CountryPicker from "@/components/CountryPicker";
import EventPicker from "@/components/EventPicker";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WizardPage() {
  const router = useRouter();
  const { locale, countryCode, eventType } = useAppSettings();
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleContinue = () => {
    if (step < 3) {
      next();
    } else {
      router.push(`/${locale}/dashboard`);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Wizard</h1>
      <div className="mb-8">
        {step === 1 && (
          <div>
            <p className="mb-2">Scegli la lingua:</p>
            <LanguageSwitcher />
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="mb-2">Seleziona il paese:</p>
            <CountryPicker />
          </div>
        )}
        {step === 3 && (
          <div>
            <p className="mb-2">Scegli l&apos;evento:</p>
            <EventPicker locale={locale} />
          </div>
        )}
      </div>
      <div className="flex justify-between">
        <button
          className="px-4 py-2 rounded bg-gray-200"
          onClick={prev}
          disabled={step === 1}
        >
          Indietro
        </button>
        <button
          className="px-4 py-2 rounded bg-green-600 text-white"
          onClick={handleContinue}
          disabled={
            (step === 1 && !locale) ||
            (step === 2 && !countryCode) ||
            (step === 3 && !eventType)
          }
        >
          {step < 3 ? "Continua" : "Vai alla dashboard"}
        </button>
      </div>
    </div>
  );
}
