import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/it/select-language");
  return null;
}
