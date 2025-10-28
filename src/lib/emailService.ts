import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
// Mittente configurabile da env per evitare modifiche al codice tra ambienti
// Esempi validi:
//   Il Budget degli Sposi <onboarding@resend.dev>
//   Il Budget degli Sposi <noreply@ilbudgetdeglisposi.it>
const FROM = process.env.RESEND_FROM || "Il Budget degli Sposi <onboarding@resend.dev>";

export async function sendSubscriptionExpiryWarning(
  email: string,
  supplierName: string,
  tier: string,
  expiresAt: Date,
  daysRemaining: number
) {
  if (!resend) {
    console.warn("Resend API key not configured - email not sent");
    return { success: false, error: "Email service not configured" };
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `⚠️ Il tuo abbonamento ${tier} scade tra ${daysRemaining} giorni`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #A3B59D 0%, #8a9d84 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .cta-button { display: inline-block; background: #A3B59D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💌 Promemoria Abbonamento</h1>
            </div>
            <div class="content">
              <p>Ciao <strong>${supplierName}</strong>,</p>
              
              <div class="alert-box">
                <strong>⏰ Il tuo abbonamento ${tier.toUpperCase()} scadrà tra ${daysRemaining} giorni</strong>
                <br>
                Data di scadenza: <strong>${expiresAt.toLocaleDateString("it-IT")}</strong>
              </div>

              <p>Dopo la scadenza, il tuo profilo:</p>
              <ul>
                <li>Non sarà più visibile nelle ricerche pubbliche</li>
                <li>Perderà il badge premium</li>
                <li>Verrà automaticamente declassato al piano gratuito</li>
              </ul>

              <p><strong>Rinnova ora per mantenere la tua visibilità!</strong></p>

              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pacchetti-fornitori" class="cta-button">
                  Rinnova Abbonamento
                </a>
              </center>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Se hai già rinnovato, ignora questa email. Se hai domande, 
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/contatti">contattaci</a>.
              </p>
            </div>
            <div class="footer">
              <p>
                Il Budget degli Sposi<br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}">ilbudgetdeglisposi.it</a>
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
  billingPeriod: string
) {
  if (!resend) {
    console.warn("Resend API key not configured - email not sent");
    return { success: false, error: "Email service not configured" };
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `✓ Abbonamento ${tier} attivato con successo!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #A3B59D 0%, #8a9d84 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-box { background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 6px; }
            .cta-button { display: inline-block; background: #A3B59D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Benvenuto nel Piano ${tier.toUpperCase()}!</h1>
            </div>
            <div class="content">
              <p>Ciao <strong>${supplierName}</strong>,</p>
              
              <div class="success-box">
                <strong>✓ Il tuo abbonamento ${tier.toUpperCase()} è ora attivo!</strong>
              </div>

              <div class="info-box">
                <p><strong>Dettagli Abbonamento:</strong></p>
                <ul style="list-style: none; padding: 0;">
                  <li>📦 Piano: <strong>${tier}</strong></li>
                  <li>⏰ Periodo: <strong>${billingPeriod === "monthly" ? "Mensile" : "Annuale"}</strong></li>
                  <li>📅 Scade il: <strong>${expiresAt.toLocaleDateString("it-IT")}</strong></li>
                </ul>
              </div>

              <p><strong>Cosa puoi fare ora:</strong></p>
              <ul>
                <li>Il tuo profilo è visibile agli utenti</li>
                <li>Hai accesso al badge premium</li>
                <li>Visualizza le tue statistiche nella dashboard</li>
                <li>Gestisci il tuo profilo e le foto</li>
              </ul>

              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/fornitori-dashboard" class="cta-button">
                  Vai alla Dashboard
                </a>
              </center>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Grazie per aver scelto Il Budget degli Sposi! 
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/contatti">Contattaci</a> 
                se hai bisogno di assistenza.
              </p>
            </div>
            <div class="footer">
              <p>
                Il Budget degli Sposi<br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}">ilbudgetdeglisposi.it</a>
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
