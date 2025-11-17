import { redirect } from "next/navigation";

type Props = {
  params: { locale: string };
};

export default function LocaleHome({ params }: Props) {
  // Quando apri /it, /en, ecc. → vai al wizard
  redirect(`/${params.locale}/wizard`);
}
