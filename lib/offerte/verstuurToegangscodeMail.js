// lib/offerte/verstuurToegangscodeMail.js
// Toegangscode-mail van het klantportaal. Gaat via Resend (betere aflevering bij Outlook.com/Hotmail dan de gedeelde
// Cloud86-SMTP; aflevering volgbaar via het Resend-ID). Afzender blijft offerte@strkbouw.nl. Zonder RESEND_API_KEY, of als
// Resend weigert/onbereikbaar is, valt de mail terug op de bestaande offerte-SMTP; beide pogingen worden teruggegeven,
// zodat de aanroeper eerlijk kan loggen wat er gebeurde. Alle andere offerte-mails blijven ongewijzigd via verstuurOfferteMail.
import { verstuurViaResend } from '../mail/verstuurViaResend.js';

export async function verstuurToegangscodeMail({ to, subject, html, text, idempotencyKey }, deps = {}) {
  const viaResend = deps.verstuurViaResend || verstuurViaResend;
  const env = deps.env || process.env;
  const resend = await viaResend({
    apiKey: env.RESEND_API_KEY,
    fromEmail: env.OFFERTE_FROM_EMAIL || 'offerte@strkbouw.nl',
    fromName: env.OFFERTE_FROM_NAME || 'STRKBOUW',
    to, subject, html, text, idempotencyKey,
  });
  if (resend.sent) return { ...resend, pogingen: [resend] };
  const viaSmtp = deps.verstuurOfferteMail || (await import('./verstuurOfferteMail.js')).verstuurOfferteMail;
  const smtp = await viaSmtp({ to, subject, html, text });
  return { ...(smtp || { sent: false, reason: 'smtp_onbekend' }), provider: smtp?.provider || 'smtp', terugval: true, pogingen: [resend, smtp] };
}
