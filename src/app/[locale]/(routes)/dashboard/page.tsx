import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2">Benvenuto nella tua dashboard.</p>
      <div className="mt-6">
        <Link href="../wizard" className="underline">
          Vai al Wizard
        </Link>
      </div>
    </main>
  );
}
