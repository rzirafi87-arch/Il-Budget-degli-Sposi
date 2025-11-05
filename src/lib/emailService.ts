import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
// Mittente configurabile da env per evitare modifiche al codice tra ambienti
// Esempi validi:
//   MYBUDGETEVENTO <onboarding@resend.dev>
//   MYBUDGETEVENTO <noreply@mybudgetevento.it>
const FROM = process.env.RESEND_FROM || "MYBUDGETEVENTO <onboarding@resend.dev>";

function normLang(locale?: string) {
  const l = (locale || "it").toLowerCase();
  // estrae codice lingua a 2 lettere
  const m = l.match(/^[a-z]{2}/);
  return m ? m[0] : "it";
}

function getEmailCopy(locale: string) {
  const lang = normLang(locale);
  // English
  if (lang === "en") {
    return {
      expiry: {
        subject: (tier: string, days: number) => `⏰ Your ${tier} subscription expires in ${days} days`,
        headerTitle: "Subscription Reminder",
        greeting: (name: string) => `Hi <strong>${name}</strong>,`,
        alertTitle: (tier: string, days: number) => `⚠️ Your ${tier.toUpperCase()} subscription will expire in ${days} days`,
        expiryDateLabel: "Expiration date",
        bulletsIntro: "After expiration, your profile:",
        bullets: [
          "Will no longer be publicly visible in searches",
          "Will lose the premium badge",
          "Will automatically be downgraded to the free plan",
        ],
        renewNow: "Renew Now",
        contactText: (baseUrl: string) => `If you've already renewed, you can ignore this email. If you have questions, <a href="${baseUrl}/contatti">contact us</a>.`,
      },
      activated: {
        subject: (tier: string) => `🎉 ${tier} subscription activated successfully!`,
        headerTitle: (tier: string) => `Welcome to the ${tier.toUpperCase()} plan!`,
        greeting: (name: string) => `Hi <strong>${name}</strong>,`,
        successTitle: (tier: string) => `✅ Your ${tier.toUpperCase()} subscription is now active!`,
        detailsTitle: "Subscription Details:",
        planLabel: "Plan",
        periodTitle: "Period",
        periodLabel: (billing: string) => (billing === "monthly" ? "Monthly" : "Yearly"),
        expiresLabel: "Expires on",
        actionsTitle: "What you can do now:",
        actions: [
          "Your profile is visible to users",
          "You have access to the premium badge",
          "View your stats in the dashboard",
          "Manage your profile and photos",
        ],
        dashboardCta: "Go to Dashboard",
  thanksText: (baseUrl: string) => `Thanks for choosing MYBUDGETEVENTO! <a href="${baseUrl}/contatti">Contact us</a> if you need any help.`,
      },
    } as const;
  }
  // Spanish
  if (lang === "es") {
    return {
      expiry: {
        subject: (tier: string, days: number) => `⏰ Tu suscripción ${tier} vence en ${days} días`,
        headerTitle: "Recordatorio de suscripción",
        greeting: (name: string) => `Hola <strong>${name}</strong>,`,
        alertTitle: (tier: string, days: number) => `⚠️ Tu suscripción ${tier.toUpperCase()} vencerá en ${days} días`,
        expiryDateLabel: "Fecha de vencimiento",
        bulletsIntro: "Después del vencimiento, tu perfil:",
        bullets: [
          "Ya no será visible públicamente en las búsquedas",
          "Perderá la insignia premium",
          "Se degradará automáticamente al plan gratuito",
        ],
        renewNow: "Renovar ahora",
        contactText: (baseUrl: string) => `Si ya has renovado, puedes ignorar este correo. Si tienes preguntas, <a href="${baseUrl}/contatti">contáctanos</a>.`,
      },
      activated: {
        subject: (tier: string) => `🎉 ¡Suscripción ${tier} activada con éxito!`,
        headerTitle: (tier: string) => `¡Bienvenido al plan ${tier.toUpperCase()}!`,
        greeting: (name: string) => `Hola <strong>${name}</strong>,`,
        successTitle: (tier: string) => `✅ ¡Tu suscripción ${tier.toUpperCase()} ya está activa!`,
        detailsTitle: "Detalles de la suscripción:",
        planLabel: "Plan",
        periodTitle: "Período",
        periodLabel: (billing: string) => (billing === "monthly" ? "Mensual" : "Anual"),
        expiresLabel: "Vence el",
        actionsTitle: "Qué puedes hacer ahora:",
        actions: [
          "Tu perfil es visible para los usuarios",
          "Tienes acceso a la insignia premium",
          "Consulta tus estadísticas en el panel",
          "Gestiona tu perfil y fotos",
        ],
        dashboardCta: "Ir al Panel",
  thanksText: (baseUrl: string) => `¡Gracias por elegir MYBUDGETEVENTO! <a href="${baseUrl}/contatti">Contáctanos</a> si necesitas ayuda.`,
      },
    } as const;
  }
  // French
  if (lang === "fr") {
    return {
      expiry: {
        subject: (tier: string, days: number) => `⏰ Votre abonnement ${tier} expire dans ${days} jours`,
        headerTitle: "Rappel d'abonnement",
        greeting: (name: string) => `Bonjour <strong>${name}</strong>,`,
        alertTitle: (tier: string, days: number) => `⚠️ Votre abonnement ${tier.toUpperCase()} expirera dans ${days} jours`,
        expiryDateLabel: "Date d'expiration",
        bulletsIntro: "Après l'expiration, votre profil :",
        bullets: [
          "Ne sera plus visible publiquement dans les recherches",
          "Perdra le badge premium",
          "Sera automatiquement rétrogradé au plan gratuit",
        ],
        renewNow: "Renouveler maintenant",
        contactText: (baseUrl: string) => `Si vous avez déjà renouvelé, ignorez cet email. En cas de questions, <a href="${baseUrl}/contatti">contactez-nous</a>.`,
      },
      activated: {
        subject: (tier: string) => `🎉 Abonnement ${tier} activé avec succès !`,
        headerTitle: (tier: string) => `Bienvenue dans le plan ${tier.toUpperCase()} !`,
        greeting: (name: string) => `Bonjour <strong>${name}</strong>,`,
        successTitle: (tier: string) => `✅ Votre abonnement ${tier.toUpperCase()} est maintenant actif !`,
        detailsTitle: "Détails de l'abonnement :",
        planLabel: "Forfait",
        periodTitle: "Période",
        periodLabel: (billing: string) => (billing === "monthly" ? "Mensuel" : "Annuel"),
        expiresLabel: "Expire le",
        actionsTitle: "Ce que vous pouvez faire maintenant :",
        actions: [
          "Votre profil est visible par les utilisateurs",
          "Vous avez accès au badge premium",
          "Consultez vos statistiques dans le tableau de bord",
          "Gérez votre profil et vos photos",
        ],
        dashboardCta: "Aller au tableau de bord",
  thanksText: (baseUrl: string) => `Merci d'avoir choisi MYBUDGETEVENTO ! <a href="${baseUrl}/contatti">Contactez-nous</a> si vous avez besoin d'aide.`,
      },
    } as const;
  }
  // German
  if (lang === "de") {
    return {
      expiry: {
        subject: (tier: string, days: number) => `⏰ Dein ${tier}-Abonnement läuft in ${days} Tagen ab`,
        headerTitle: "Abonnement-Erinnerung",
        greeting: (name: string) => `Hallo <strong>${name}</strong>,`,
        alertTitle: (tier: string, days: number) => `⚠️ Dein ${tier.toUpperCase()}-Abonnement läuft in ${days} Tagen ab`,
        expiryDateLabel: "Ablaufdatum",
        bulletsIntro: "Nach dem Ablauf gilt für dein Profil:",
        bullets: [
          "Es ist in der öffentlichen Suche nicht mehr sichtbar",
          "Das Premium-Abzeichen wird entfernt",
          "Automatische Herabstufung auf den kostenlosen Plan",
        ],
        renewNow: "Jetzt verlängern",
        contactText: (baseUrl: string) => `Wenn du bereits verlängert hast, ignoriere diese E-Mail. Bei Fragen <a href="${baseUrl}/contatti">kontaktiere uns</a>.`,
      },
      activated: {
        subject: (tier: string) => `🎉 ${tier}-Abonnement erfolgreich aktiviert!`,
        headerTitle: (tier: string) => `Willkommen im ${tier.toUpperCase()}-Plan!`,
        greeting: (name: string) => `Hallo <strong>${name}</strong>,`,
        successTitle: (tier: string) => `✅ Dein ${tier.toUpperCase()}-Abonnement ist jetzt aktiv!`,
        detailsTitle: "Abonnementdetails:",
        planLabel: "Plan",
        periodTitle: "Zeitraum",
        periodLabel: (billing: string) => (billing === "monthly" ? "Monatlich" : "Jährlich"),
        expiresLabel: "Läuft ab am",
        actionsTitle: "Was du jetzt tun kannst:",
        actions: [
          "Dein Profil ist für Nutzer sichtbar",
          "Du hast Zugriff auf das Premium-Abzeichen",
          "Sieh dir deine Statistiken im Dashboard an",
          "Verwalte dein Profil und deine Fotos",
        ],
        dashboardCta: "Zum Dashboard",
  thanksText: (baseUrl: string) => `Danke, dass du MYBUDGETEVENTO gewählt hast! <a href="${baseUrl}/contatti">Kontaktiere uns</a>, wenn du Hilfe benötigst.`,
      },
    } as const;
  }
  // Italian default
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    expiry: {
      subject: (tier: string, days: number) => `⏰ Il tuo abbonamento ${tier} scade tra ${days} giorni`,
      headerTitle: "Promemoria Abbonamento",
      greeting: (name: string) => `Ciao <strong>${name}</strong>,`,
      alertTitle: (tier: string, days: number) => `⚠️ Il tuo abbonamento ${tier.toUpperCase()} scadrà tra ${days} giorni`,
      expiryDateLabel: "Data di scadenza",
      bulletsIntro: "Dopo la scadenza, il tuo profilo:",
      bullets: [
        "Non sarà più visibile nelle ricerche pubbliche",
        "Perderà il badge premium",
        "Verrà automaticamente declassato al piano gratuito",
      ],
      renewNow: "Rinnova Abbonamento",
      contactText: () => `Se hai già rinnovato, ignora questa email. Se hai domande, <a href="${base}/contatti">contattaci</a>.`,
    },
    activated: {
      subject: (tier: string) => `🎉 Abbonamento ${tier} attivato con successo!`,
      headerTitle: (tier: string) => `Benvenuto nel Piano ${tier.toUpperCase()}!`,
      greeting: (name: string) => `Ciao <strong>${name}</strong>,`,
      successTitle: (tier: string) => `✅ Il tuo abbonamento ${tier.toUpperCase()} è ora attivo!`,
      detailsTitle: "Dettagli Abbonamento:",
      planLabel: "Piano",
      periodTitle: "Periodo",
      periodLabel: (billing: string) => (billing === "monthly" ? "Mensile" : "Annuale"),
      expiresLabel: "Scade il",
      actionsTitle: "Cosa puoi fare ora:",
      actions: [
        "Il tuo profilo è visibile agli utenti",
        "Hai accesso al badge premium",
        "Visualizza le tue statistiche nella dashboard",
        "Gestisci il tuo profilo e le foto",
      ],
      dashboardCta: "Vai alla Dashboard",
  thanksText: (baseUrl: string) => `Grazie per aver scelto MYBUDGETEVENTO! <a href="${baseUrl}/contatti">Contattaci</a> se hai bisogno di assistenza.`,
    },
  } as const;
}

export async function sendSubscriptionExpiryWarning(
  email: string,
  supplierName: string,
  tier: string,
  expiresAt: Date,
  daysRemaining: number,
  locale: string = "it-IT"
) {
  if (!resend) {
    console.warn("Resend API key not configured - email not sent");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const t = getEmailCopy(locale).expiry;
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: t.subject(tier, daysRemaining),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4e8666 0%, #315d47 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .cta-button { display: inline-block; background: #4e8666; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${t.headerTitle}</h1>
            </div>
            <div class="content">
              <p>${t.greeting(supplierName)}</p>
              
              <div class="alert-box">
                <strong>${t.alertTitle(tier, daysRemaining)}</strong>
                <br>
                ${t.expiryDateLabel}: <strong>${expiresAt.toLocaleDateString(locale)}</strong>
              </div>

              <p>${t.bulletsIntro}</p>
              <ul>
                ${t.bullets.map((b)=>`<li>${b}</li>`).join("")}
              </ul>

              <p><strong>${t.renewNow}!</strong></p>

              <center>
                <a href="${baseUrl}/pacchetti-fornitori" class="cta-button">${t.renewNow}</a>
              </center>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">${t.contactText(baseUrl)}</p>
            </div>
            <div class="footer">
              <p>
                MYBUDGETEVENTO<br>
                <a href="${baseUrl}">ilbudgetdeglisposi.it</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending expiry warning email:", error);
    return { success: false, error };
  }
}

export async function sendSubscriptionActivated(
  email: string,
  supplierName: string,
  tier: string,
  expiresAt: Date,
  billingPeriod: string,
  locale: string = "it-IT"
) {
  if (!resend) {
    console.warn("Resend API key not configured - email not sent");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const t = getEmailCopy(locale).activated;
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: t.subject(tier),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4e8666 0%, #315d47 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-box { background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 6px; }
            .cta-button { display: inline-block; background: #4e8666; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${t.headerTitle(tier)}</h1>
            </div>
            <div class="content">
              <p>${t.greeting(supplierName)}</p>
              
              <div class="success-box">
                <strong>${t.successTitle(tier)}</strong>
              </div>

              <div class="info-box">
                <p><strong>${t.detailsTitle}</strong></p>
                <ul style="list-style: none; padding: 0;">
                  <li>${t.planLabel}: <strong>${tier}</strong></li>
                  <li>${(t as unknown as { periodTitle?: string }).periodTitle || "Periodo"}: <strong>${t.periodLabel(billingPeriod)}</strong></li>
                  <li>${t.expiresLabel}: <strong>${expiresAt.toLocaleDateString(locale)}</strong></li>
                </ul>
              </div>

              <p><strong>${t.actionsTitle}</strong></p>
              <ul>
                ${t.actions.map((a)=>`<li>${a}</li>`).join("")}
              </ul>

              <center>
                <a href="${baseUrl}/fornitori-dashboard" class="cta-button">${t.dashboardCta}</a>
              </center>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">${t.thanksText(baseUrl)}</p>
            </div>
            <div class="footer">
              <p>
                MYBUDGETEVENTO<br>
                <a href="${baseUrl}">ilbudgetdeglisposi.it</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending activation email:", error);
    return { success: false, error };
  }
}

// Generic appointment reminder email (7 days or 48 hours before)
export async function sendAppointmentReminder(
  email: string,
  coupleName: string,
  appointmentTitle: string,
  appointmentDate: Date,
  daysBefore: 7 | 2,
  locale: string = "it-IT"
) {
  if (!resend) {
    console.warn("Resend API key not configured - appointment email not sent");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const lang = (locale || "it").slice(0, 2);
    const subjectByLang: Record<string, (days: number, title: string) => string> = {
      en: (d, t) => (d === 7 ? `Reminder: ${t} in 7 days` : `Reminder: ${t} in 48 hours`),
      es: (d, t) => (d === 7 ? `Recordatorio: ${t} en 7 días` : `Recordatorio: ${t} en 48 horas`),
      fr: (d, t) => (d === 7 ? `Rappel : ${t} dans 7 jours` : `Rappel : ${t} dans 48 heures`),
      de: (d, t) => (d === 7 ? `Erinnerung: ${t} in 7 Tagen` : `Erinnerung: ${t} in 48 Stunden`),
      it: (d, t) => (d === 7 ? `Promemoria: ${t} tra 7 giorni` : `Promemoria: ${t} tra 48 ore`),
    };

    const subject = (subjectByLang[lang] || subjectByLang["it"])(daysBefore, appointmentTitle);
    const dateString = appointmentDate.toLocaleDateString(locale);
    const whenText = daysBefore === 7 ? (lang === "en" ? "in 7 days" : "tra 7 giorni") : (lang === "en" ? "in 48 hours" : "tra 48 ore");

    await resend.emails.send({
      from: FROM,
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4e8666 0%, #315d47 100%); color: white; padding: 24px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #e6f4ea; border-left: 4px solid #34a853; padding: 12px; margin: 16px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 16px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${lang === "en" ? "Appointment Reminder" : "Promemoria Appuntamento"}</h1>
            </div>
            <div class="content">
              <p>${lang === "en" ? "Hello" : "Ciao"} <strong>${coupleName}</strong>,</p>

              <div class="alert-box">
                <strong>${appointmentTitle}</strong><br />
                ${lang === "en" ? "Date" : "Data"}: <strong>${dateString}</strong><br />
                (${whenText})
              </div>

              <p>
                ${lang === "en" 
                  ? "You can review or update your agenda from the app."
                  : "Puoi rivedere o aggiornare l'agenda dall'app."}
              </p>

              <center>
                <a href="${baseUrl}/documenti/appuntamenti" style="display:inline-block;background:#4e8666;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
                  ${lang === "en" ? "Open Agenda" : "Apri Agenda"}
                </a>
              </center>
            </div>
            <div class="footer">
              <p>
                MYBUDGETEVENTO<br>
                <a href="${baseUrl}">ilbudgetdeglisposi.it</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending appointment reminder:", error);
    return { success: false, error };
  }
}

