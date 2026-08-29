"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Props = {
  links: string[][];
  authHref: string;
  loginLabel: string;
  startLabel: string;
  openLabel: string;
};

export default function PublicMobileMenu({ links, authHref, loginLabel, startLabel, openLabel }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative sm:hidden">
      <button type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-white text-fg" aria-label={openLabel} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
      </button>
      {open ? <div className="absolute right-0 top-14 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-border bg-white p-3 shadow-soft-xl">{links.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 font-semibold text-fg hover:bg-muted">{label}</a>)}<div className="mt-2 grid gap-2 border-t border-border pt-3"><Link href={authHref} className="app-button app-button-outline" onClick={() => setOpen(false)}>{loginLabel}</Link><Link href={authHref} className="app-button app-button-primary" onClick={() => setOpen(false)}>{startLabel}</Link></div></div> : null}
    </div>
  );
}
