"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";

const supabase = getBrowserClient();

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setErr(error.message);
    } else {
      window.location.assign("/"); // torna alla home
    }
  }

  async function signIn() {
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErr(error.message);
    } else {
      window.location.assign("/");
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.replace("/");
      }
    });
  }, []);

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Accedi o registrati</h1>
      <input
        className="border px-3 py-2 block w-full max-w-sm"
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="border px-3 py-2 block w-full max-w-sm"
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          className="border px-3 py-2 hover:bg-gray-50 disabled:opacity-60"
          onClick={signIn}
          disabled={loading}
        >
          Accedi
        </button>
        <button
          className="border px-3 py-2 hover:bg-gray-50 disabled:opacity-60"
          onClick={signUp}
          disabled={loading}
        >
          Registrati
        </button>
      </div>
      {err && <p className="text-red-600">{err}</p>}
    </main>
  );
}
