// lib/offerte/verstuurOfferteMail.js
// Verstuurt de premium offerte-mail naar de klant vanaf offerte@strkbouw.nl (Cloud86-mailbox).
// Dunne wrapper om de gedeelde lib/mail/verstuurMail.js met de offerte-specifieke afzender.
import { verstuurMail } from '@/lib/mail/verstuurMail';

export async function verstuurOfferteMail({ to, replyTo, subject, html, text }) {
  return verstuurMail({
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : undefined,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    fromEmail: process.env.OFFERTE_FROM_EMAIL || 'offerte@strkbouw.nl',
    fromName: process.env.OFFERTE_FROM_NAME || 'STRKBOUW',
    to,
    replyTo,
    subject,
    html,
    text,
  });
}
