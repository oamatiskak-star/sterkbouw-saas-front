// pages/api/mail/verstuur-vrij.js — verstuurt een vrije, eenmalige e-mail (bijv. een korte
// "we bellen u morgen terug"-melding naar een nieuwe lead) vanaf info@strkbouw.nl. Server-side
// omdat de mail-provider-credentials nooit naar de client mogen. Geen DB-koppeling nodig —
// dit is losstaand van de opnames-flow (die zijn eigen sjabloon/audit-trail heeft).
import { verstuurAfspraakMail } from '@/lib/afspraken/verstuurAfspraakMail';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, subject, html, text } = req.body || {};
  if (!to || !EMAIL_RE.test(to)) return res.status(400).json({ error: 'Geldig e-mailadres (to) ontbreekt' });
  if (!subject) return res.status(400).json({ error: 'subject ontbreekt' });
  if (!html && !text) return res.status(400).json({ error: 'html of text ontbreekt' });

  const mailResult = await verstuurAfspraakMail({ to, subject, html, text: text || undefined });
  return res.status(200).json({ ok: true, mailSent: !!mailResult.sent, mailResult });
}
