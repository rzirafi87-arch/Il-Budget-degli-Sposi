import { expect, test, type Page } from "@playwright/test";

const copy = {
  it: {
    source: "en",
    resetTitle: "Nuova password",
    authTitle: "Accedi o registrati",
    register: "Registrati",
    forgot: "Password dimenticata?",
    send: "Invia istruzioni",
    backToLogin: "Torna al login",
    showPassword: "Mostra password",
    home: ["Il tuo matrimonio.", "Tutto sotto controllo.", "Inizia gratuitamente"],
  },
  en: {
    source: "it",
    resetTitle: "New password",
    authTitle: "Sign in or register",
    register: "Register",
    forgot: "Forgot password?",
    send: "Send instructions",
    backToLogin: "Back to sign in",
    showPassword: "Show password",
    home: ["Your wedding.", "Everything under control.", "Start for free"],
  },
  es: {
    source: "it",
    resetTitle: "Nueva contraseña",
    authTitle: "Inicia sesión o regístrate",
    register: "Registrarse",
    forgot: "¿Olvidaste la contraseña?",
    send: "Enviar instrucciones",
    backToLogin: "Volver al acceso",
    showPassword: "Mostrar contraseña",
    home: ["Tu boda.", "Todo bajo control.", "Empieza gratis"],
  },
  fr: {
    source: "it",
    resetTitle: "Nouveau mot de passe",
    authTitle: "Se connecter ou s’inscrire",
    register: "S’inscrire",
    forgot: "Mot de passe oublié ?",
    send: "Envoyer les instructions",
    backToLogin: "Retour à la connexion",
    showPassword: "Afficher le mot de passe",
    home: ["Votre mariage.", "Tout est sous contrôle.", "Commencez gratuitement"],
  },
  de: {
    source: "it",
    resetTitle: "Neues Passwort",
    authTitle: "Anmelden oder registrieren",
    register: "Registrieren",
    forgot: "Passwort vergessen?",
    send: "Anweisungen senden",
    backToLogin: "Zurück zur Anmeldung",
    showPassword: "Passwort anzeigen",
    home: ["Ihre Hochzeit.", "Alles unter Kontrolle.", "Starten Sie kostenlos"],
  },
} as const;

type ReadyLocale = keyof typeof copy;

const nativeLocaleNames: Record<ReadyLocale, string> = {
  it: "Italiano",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

const intlLocales: Record<ReadyLocale, string> = {
  it: "it-IT",
  en: "en-GB",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
};

function runtimeProject(projectName: string) {
  const match = /^runtime-(it|en|es|fr|de)-(320|390|430|desktop)$/.exec(projectName);
  if (!match) throw new Error(`Unexpected runtime i18n project ${projectName}`);
  return { locale: match[1] as ReadyLocale, viewport: match[2] };
}

async function primeProtectedPreview(page: Page) {
  if (process.env.PLAYWRIGHT_BASE_URL?.includes("_vercel_share=")) {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL, { waitUntil: "domcontentloaded" });
  }
}

test("runtime locale switch preserves route state and loads the selected dictionary", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const { locale, viewport } = runtimeProject(testInfo.project.name);
  const expected = copy[locale];
  const consoleErrors: string[] = [];
  const hydrationErrors: string[] = [];
  page.on("console", message => {
    if (message.type() !== "error") return;
    consoleErrors.push(message.text());
    if (/hydration|react error #418/i.test(message.text())) hydrationErrors.push(message.text());
  });

  await primeProtectedPreview(page);
  await page.goto(`/${expected.source}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-runtime-locale", expected.source);
  await page.getByRole("link", { name: nativeLocaleNames[locale], exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}$`));
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator("html")).toHaveAttribute("data-runtime-locale", locale);
  for (const distinctive of expected.home) await expect(page.locator("body")).toContainText(distinctive);
  expect(await page.locator("#landing-web-application").textContent()).toContain(`"inLanguage":"${intlLocales[locale]}"`);
  if (locale !== "it") await expect(page.locator("body")).not.toContainText("Utilizzabile da smartphone");

  await page.goto(`/${expected.source}/reset-password?runtime=i18n#password`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("lang", expected.source);
  await expect(page.locator("html")).toHaveAttribute("data-runtime-locale", expected.source);

  const settings = page.locator("button:has(svg.lucide-settings):visible").last();
  await settings.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  const selector = page.locator("#quick-settings-language");
  await expect(selector).toHaveAccessibleName(/lingua|language|idioma|langue|sprache/i);

  await Promise.all([
    page.waitForURL(url => (
      url.pathname === `/${locale}/reset-password`
      && url.search === "?runtime=i18n"
      && url.hash === "#password"
    )),
    selector.selectOption(locale),
  ]);

  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator("html")).toHaveAttribute("data-runtime-locale", locale);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(expected.resetTitle);
  await expect(page.getByRole("button", { name: expected.showPassword })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]').first()).toHaveAttribute("href", new RegExp(`/${locale}/reset-password$`));
  await expect(page.locator(`link[rel="alternate"][hreflang="${locale}"]`).first()).toHaveAttribute("href", new RegExp(`/${locale}/reset-password$`));
  expect(await page.evaluate(() => localStorage.getItem("language"))).toBe(locale);
  expect((await page.context().cookies()).find(cookie => cookie.name === "language")?.value).toBe(locale);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`/${locale}/reset-password\\?runtime=i18n#password$`));
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator("html")).toHaveAttribute("data-runtime-locale", locale);
  const directDeepLink = await page.request.get(`/${locale}/reset-password`);
  const directDeepLinkHtml = await directDeepLink.text();
  expect(directDeepLinkHtml).toContain(`<html lang="${locale}"`);
  expect(directDeepLinkHtml).toContain(expected.resetTitle);
  expect(directDeepLinkHtml).toContain(`rel="canonical" href="https://ilbudgetdeglisposi.it/${locale}/reset-password"`);

  await page.goto(`/${locale}/auth?next=%2F${locale}%2Fdocumenti#access`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-runtime-locale", locale);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(expected.authTitle);
  await expect(page.getByRole("button", { name: expected.showPassword })).toBeVisible();
  await page.getByRole("button", { name: expected.register, exact: true }).click();
  const backToLogin = page.getByRole("button", { name: expected.backToLogin, exact: true });
  await expect(backToLogin).toBeVisible();
  await backToLogin.click();
  await page.getByRole("button", { name: expected.forgot, exact: true }).click();
  await expect(page.getByRole("button", { name: expected.send, exact: true })).toBeVisible();

  await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-runtime-locale", locale);
  for (const distinctive of expected.home) await expect(page.locator("body")).toContainText(distinctive);
  if (locale !== "it") {
    await expect(page.locator("body")).not.toContainText("Il tuo matrimonio. Tutto sotto controllo.");
    await expect(page.locator("body")).not.toContainText("Utilizzabile da smartphone");
  }

  const homeUrl = page.url();
  await page.getByRole("link", { name: expected.home[2], exact: true }).first().click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/auth$`));
  await page.goBack();
  await expect(page).toHaveURL(homeUrl);
  await page.goForward();
  await expect(page).toHaveURL(new RegExp(`/${locale}/auth$`));

  const pageAudit = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    lang: document.documentElement.lang,
  }));
  expect(pageAudit).toEqual({ overflow: false, lang: locale });
  expect(hydrationErrors, `${locale}/${viewport} hydration errors`).toEqual([]);
  expect(consoleErrors.filter(message => !/favicon/i.test(message)), `${locale}/${viewport} console errors`).toEqual([]);
});
