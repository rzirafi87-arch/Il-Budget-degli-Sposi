import Link from "next/link";

export default function LocaleHome() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-3xl font-bold mb-8">Scegli un evento</h1>
      <nav className="flex flex-col gap-4">
        <Link
          href="/it/birthday"
          className="text-lg text-sage-700 hover:underline"
        >
          Compleanno
        </Link>
        <Link
          href="/it/engagement-party"
          className="text-lg text-sage-700 hover:underline"
        >
          Festa di Fidanzamento
        </Link>
        <Link
          href="/it/baby-shower"
          className="text-lg text-sage-700 hover:underline"
        >
          Baby Shower
        </Link>
      </nav>
    </main>
  );
}
