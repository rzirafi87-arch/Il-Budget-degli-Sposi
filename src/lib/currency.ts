const COUNTRY_TO_CURRENCY: Record<string, string> = {
  it: "EUR",
  es: "EUR",
  fr: "EUR",
  de: "EUR",
  gb: "GBP",
  ae: "AED",
  us: "USD",
  mx: "MXN",
  br: "BRL",
  de_: "EUR",
  in: "INR",
  jp: "JPY",
  cn: "CNY",
  zh: "CNY",
  ja: "JPY",
  ca: "CAD",
  id: "IDR",
  sa: "SAR",
};

export function currencyForCountry(code?: string | null): string {
  if (!code) return "EUR";
  const k = code.toLowerCase();
  return COUNTRY_TO_CURRENCY[k] || "EUR";
}

