import { ReactNode } from "react";

export default function Page({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl pb-16">
      {children}
    </div>
  );
}
