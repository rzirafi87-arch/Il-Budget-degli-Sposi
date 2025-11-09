

import { cookies } from "next/headers";
import AppointmentsClient from "./AppointmentsClient";

export default async function AppointmentsPage() {
  // Recupera JWT dalla cookie (se presente)
  const cookieStore = await cookies();
  const jwt = cookieStore.get("sb-access-token")?.value;

  // Prepara headers per la fetch
  const headers: HeadersInit = {};
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;

  // Fetch dati appuntamenti dal backend API route
  let appointments = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/my/appointments`, {
      headers,
      cache: "no-store"
    });
    const data = await res.json();
    appointments = data.appointments || [];
  } catch {
    appointments = [];
  }

  return <AppointmentsClient initialAppointments={appointments} />;
}
