import { type ReactNode } from "react";

export default function Page({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-screen-lg px-4 sm:px-6 lg:px-8 pb-16">
      {children}
    </div>
  );
}
