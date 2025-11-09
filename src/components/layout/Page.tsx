import { ReactNode } from "react";

export default function Page({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-screen-md px-4 pb-16">
      {children}
    </div>
  );
}
