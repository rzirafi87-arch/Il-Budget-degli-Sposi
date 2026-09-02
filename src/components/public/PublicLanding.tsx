import { BRAND_NAME, BRAND_SITE_URL } from "@/config/brand";
import { localeNames, locales, type Locale } from "@/i18n/config";
import {
  ArrowRight, CalendarCheck, Check, ChevronRight, ClipboardCheck, FileText,
  HeartHandshake, Landmark, MapPin, PiggyBank, ShieldCheck, Sparkles,
  Store, Users, WalletCards,
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
import type { ComponentType } from "react";
import PublicMobileMenu from "./PublicMobileMenu";

const featureIcons = [PiggyBank, Users, Store, MapPin, Landmark, CalendarCheck, ClipboardCheck, FileText];
type Translator = Awaited<ReturnType<typeof getTranslations>>;

export default async function PublicLanding({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "landing" });
  const authHref = `/${locale}/auth`;
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: BRAND_NAME,
    url: `${BRAND_SITE_URL}/${locale}`,
    description: t("seo.description"),
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript and a modern web browser",
    inLanguage: locale === "en" ? "en" : locale === "mx" ? "es-MX" : "it-IT",
    featureList: [0, 1, 5, 7].map((index) => t(`features.items.${index}.title`)),
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-bg text-fg">
      <Script id="landing-web-application" type="application/ld+json">{JSON.stringify(appSchema)}</Script>
      <PublicHeader locale={locale} authHref={authHref} t={t} />
      <main id="contenuto">
        <section className="relative isolate overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8">
          <div className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_20%_15%,rgba(184,120,120,.14),transparent_32%),radial-gradient(circle_at_80%_25%,rgba(69,111,92,.16),transparent_36%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
            <div className="max-w-2xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-soft-sm"><Sparkles size={17} aria-hidden /> {t("hero.eyebrow")}</p>
              <h1 className="max-w-3xl text-balance font-serif text-[clamp(2.55rem,7vw,5.25rem)] font-bold leading-[1.03] tracking-[-0.035em] text-fg">{t("hero.title")} <span className="text-primary">{t("hero.highlight")}</span></h1>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-fg sm:text-xl">{t("hero.description")}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href={authHref} className="app-button app-button--primary app-button--lg">{t("actions.start")} <ArrowRight size={19} aria-hidden /></Link>
                <a href="#come-funziona" className="app-button app-button--outline app-button--lg">{t("actions.discover")}</a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-muted-fg">
                {[0, 1, 2].map((index) => <span key={index} className="inline-flex items-center gap-2"><Check size={16} className="text-primary" aria-hidden />{t(`hero.proofs.${index}`)}</span>)}
              </div>
            </div>
            <DashboardPreview t={t} />
          </div>
        </section>

        <section id="funzionalita" className="scroll-mt-24 bg-[var(--surface-primary)] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <SectionIntro eyebrow={t("features.eyebrow")} title={t("features.title")} description={t("features.description")} />
          <div className="mx-auto mt-12 grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureIcons.map((Icon, index) => <FeatureCard key={index} icon={Icon} title={t(`features.items.${index}.title`)} description={t(`features.items.${index}.description`)} />)}
          </div>
        </section>

        <section id="come-funziona" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <SectionIntro eyebrow={t("how.eyebrow")} title={t("how.title")} description={t("how.description")} />
          <ol className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
            {[0, 1, 2].map((index) => <li key={index} className="app-card relative p-7 sm:p-8"><span className="mb-6 grid h-11 w-11 place-items-center rounded-full bg-primary font-bold text-white">{index + 1}</span><h3 className="text-xl text-fg">{t(`how.steps.${index}.title`)}</h3><p className="mt-3 leading-7 text-muted-fg">{t(`how.steps.${index}.description`)}</p></li>)}
          </ol>
        </section>

        <section id="vantaggi" className="scroll-mt-24 bg-[var(--surface-muted)] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div><p className="text-sm font-bold uppercase tracking-[.2em] text-primary">{t("benefits.eyebrow")}</p><h2 className="mt-4 text-balance font-serif text-3xl font-bold text-fg sm:text-5xl">{t("benefits.title")}</h2><p className="mt-5 max-w-xl text-lg leading-8 text-muted-fg">{t("benefits.description")}</p></div>
            <div className="grid gap-4">{[WalletCards, HeartHandshake, ShieldCheck].map((Icon, index) => <div key={index} className="flex gap-4 rounded-2xl border border-border bg-[var(--surface-elevated)] p-5 shadow-soft-sm sm:p-6"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={22} aria-hidden /></span><div><h3 className="text-lg text-fg">{t(`benefits.items.${index}.title`)}</h3><p className="mt-1 text-sm leading-6 text-muted-fg">{t(`benefits.items.${index}.description`)}</p></div></div>)}</div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 bg-[var(--surface-primary)] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <SectionIntro eyebrow="FAQ" title={t("faq.title")} description={t("faq.description")} />
          <div className="mx-auto mt-12 max-w-3xl divide-y divide-border overflow-hidden rounded-3xl border border-border bg-[var(--surface-elevated)] shadow-soft-sm">
            {[0, 1, 2, 3, 4].map((index) => <details key={index} className="group px-5 py-1 sm:px-7"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-fg focus-ring-sage">{t(`faq.items.${index}.question`)}<ChevronRight className="shrink-0 text-primary transition-transform group-open:rotate-90" size={20} aria-hidden /></summary><p className="max-w-2xl pb-5 leading-7 text-muted-fg">{t(`faq.items.${index}.answer`)}</p></details>)}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8"><div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#355b4a] px-6 py-12 text-center shadow-soft-xl sm:px-12 sm:py-16"><Sparkles className="mx-auto text-white/80" size={28} aria-hidden /><h2 className="mx-auto mt-5 max-w-3xl text-balance font-serif text-3xl font-bold text-white sm:text-5xl">{t("final.title")}</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/85">{t("final.description")}</p><Link href={authHref} className="app-button app-button--lg mt-8 bg-white text-[#355b4a] hover:bg-[#f8f5f0]">{t("actions.start")} <ArrowRight size={19} aria-hidden /></Link></div></section>
      </main>
      <PublicFooter locale={locale} t={t} />
    </div>
  );
}

function PublicHeader({ locale, authHref, t }: { locale: Locale; authHref: string; t: Translator }) {
  const links = [["#funzionalita", t("nav.features")], ["#come-funziona", t("nav.how")], ["#vantaggi", t("nav.benefits")], ["#faq", "FAQ"]];
  return <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/92 backdrop-blur-xl"><a href="#contenuto" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">{t("nav.skip")}</a><nav className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label={t("nav.label")}><Link href={`/${locale}`} className="flex min-h-11 items-center gap-3 rounded-xl focus-ring-sage"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#355b4a] font-serif text-xl font-bold text-white shadow-soft-sm" aria-hidden>B</span><span className="font-serif text-lg font-bold text-fg sm:text-xl">{BRAND_NAME}</span></Link><div className="hidden items-center gap-1 lg:flex">{links.map(([href, label]) => <a key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-semibold text-muted-fg hover:bg-[var(--surface-muted)] hover:text-primary">{label}</a>)}</div><div className="hidden items-center gap-2 sm:flex"><Link href={authHref} className="app-button app-button--ghost app-button--sm">{t("actions.login")}</Link><Link href={authHref} className="app-button app-button--primary app-button--sm">{t("actions.start")}</Link></div><PublicMobileMenu links={links} authHref={authHref} loginLabel={t("actions.login")} startLabel={t("actions.start")} openLabel={t("nav.openMenu")} /></nav></header>;
}

function DashboardPreview({ t }: { t: Translator }) {
  return <div className="relative mx-auto w-full max-w-[38rem]" aria-label={t("preview.label")} role="img"><div className="absolute -inset-6 -z-10 rounded-[3rem] bg-primary/10 blur-2xl"/><div className="overflow-hidden rounded-[1.6rem] border border-border bg-[var(--surface-primary)] shadow-soft-xl"><div className="flex items-center justify-between border-b border-border bg-[var(--surface-elevated)] px-5 py-4"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#dcb7b1]"/><span className="h-2.5 w-2.5 rounded-full bg-[#dfc394]"/><span className="h-2.5 w-2.5 rounded-full bg-[#8fb49b]"/></div><span className="text-xs font-semibold text-muted-fg">{t("preview.app")}</span></div><div className="grid grid-cols-[4rem_1fr] sm:grid-cols-[8.5rem_1fr]"><div className="border-r border-border bg-[#355b4a] p-3 sm:p-4"><div className="mb-5 grid h-9 w-9 place-items-center rounded-lg bg-white/15 font-serif font-bold text-white">B</div>{[0,1,2,3].map(i=><div key={i} className={`mb-3 h-2.5 rounded-full ${i===0?'bg-white/75':'bg-white/20'} ${i%2?'w-7 sm:w-16':'w-9 sm:w-20'}`}/>)}</div><div className="min-w-0 p-4 sm:p-6"><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">{t("preview.eyebrow")}</p><h2 className="mt-1 text-xl text-fg sm:text-2xl">{t("preview.title")}</h2><div className="mt-5 grid grid-cols-2 gap-3"><PreviewMetric label={t("preview.budget")} value="€ 24.500" progress="62%"/><PreviewMetric label={t("preview.guests")} value="86" progress="74%"/></div><div className="mt-3 rounded-xl border border-border bg-[var(--surface-elevated)] p-4"><div className="flex items-center justify-between text-xs font-semibold"><span>{t("preview.tasks")}</span><span className="text-primary">7/12</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[58%] rounded-full bg-primary"/></div><div className="mt-4 space-y-2">{[0,1,2].map(i=><div key={i} className="flex items-center gap-2"><span className={`h-4 w-4 rounded-full border ${i===0?'border-primary bg-primary':'border-border bg-white'}`}/><span className={`h-2 rounded-full bg-border ${i===2?'w-2/3':'w-4/5'}`}/></div>)}</div></div></div></div></div></div>;
}

function PreviewMetric({ label, value, progress }: { label: string; value: string; progress: string }) { return <div className="rounded-xl border border-border bg-white p-3 sm:p-4"><p className="text-[.7rem] font-semibold uppercase tracking-wide text-muted-fg">{label}</p><p className="mt-1 text-lg font-bold text-fg sm:text-xl">{value}</p><p className="mt-2 text-xs font-semibold text-primary">{progress}</p></div>; }
function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div className="mx-auto max-w-3xl text-center"><p className="text-sm font-bold uppercase tracking-[.2em] text-primary">{eyebrow}</p><h2 className="mt-4 text-balance font-serif text-3xl font-bold text-fg sm:text-5xl">{title}</h2><p className="mt-5 text-lg leading-8 text-muted-fg">{description}</p></div>; }
function FeatureCard({ icon: Icon, title, description }: { icon: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>; title: string; description: string }) { return <article className="rounded-2xl border border-border bg-[var(--surface-elevated)] p-6 shadow-soft-sm transition hover:-translate-y-1 hover:shadow-soft"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={22} aria-hidden /></span><h3 className="mt-5 text-lg text-fg">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-fg">{description}</p></article>; }
function PublicFooter({ locale, t }: { locale: Locale; t: Translator }) { return <footer className="border-t border-border bg-[#211b18] px-4 py-12 text-white sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_1fr_1fr]"><div><p className="font-serif text-xl font-bold text-white">{BRAND_NAME}</p><p className="mt-3 max-w-sm text-sm leading-6 text-white/70">{t("footer.description")}</p></div><div><h2 className="text-sm font-bold uppercase tracking-wider text-white">{t("footer.product")}</h2><ul className="mt-4 space-y-2 text-sm text-white/70"><li><a href="#funzionalita">{t("nav.features")}</a></li><li><a href="#come-funziona">{t("nav.how")}</a></li><li><Link href={`/${locale}/auth`}>{t("actions.login")}</Link></li></ul></div><div><h2 className="text-sm font-bold uppercase tracking-wider text-white">{t("footer.legal")}</h2><ul className="mt-4 space-y-2 text-sm text-white/70"><li><Link href={`/${locale}/privacy-policy`}>{t("footer.privacy")}</Link></li><li><Link href={`/${locale}/termini-servizio`}>{t("footer.terms")}</Link></li><li><Link href={`/${locale}/cookie-policy`}>{t("footer.cookies")}</Link></li><li><Link href={`/${locale}/contatti`}>{t("footer.contacts")}</Link></li></ul></div></div><div className="mx-auto mt-10 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} {BRAND_NAME}. {t("footer.rights")}</p><div className="flex flex-wrap gap-3">{locales.map(item=><Link key={item} href={`/${item}`} hrefLang={item} className={item===locale?'font-bold text-white':'hover:text-white'}>{localeNames[item]}</Link>)}</div></div></footer>; }
