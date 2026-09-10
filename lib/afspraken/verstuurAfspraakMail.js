// lib/afspraken/verstuurAfspraakMail.js
// Verstuurt de afspraak-bevestigingsmail naar de klant vanaf info@strkbouw.nl (eigen
// Cloud86-mailbox met eigen inloggegevens, los van offerte@strkbouw.nl). Host/poort/beveiliging
// vallen terug op de al werkende SMTP_HOST/SMTP_PORT/SMTP_SECURE (zelfde mailserver) — alleen
// gebruikersnaam/wachtwoord zijn dedicated aan dit postvak.
import { verstuurMail } from '@/lib/mail/verstuurMail';

export async function verstuurAfspraakMail({ to, replyTo, subject, html, text }) {
  return verstuurMail({
    smtp: {
      host: process.env.SMTP_HOST_INFO || process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT_INFO || process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE_INFO ? process.env.SMTP_SECURE_INFO === 'true' : (process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : undefined),
      user: process.env.SMTP_USER_INFO,
      pass: process.env.SMTP_PASS_INFO,
    },
    fromEmail: process.env.INFO_FROM_EMAIL || 'info@strkbouw.nl',
    fromName: process.env.INFO_FROM_NAME || 'STRKBOUW',
    to,
    replyTo,
    subject,
    html,
    text,
  });
}
