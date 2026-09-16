// pages/api/offerte/verstuur-vrij.js — verstuurt een vrije, eenmalige e-mail vanaf
// offerte@strkbouw.nl (bijv. een antwoord op een klantvraag over een lopende offerte),
// optioneel met bijlage(n). Server-side omdat de mail-provider-credentials nooit naar de
// client mogen. Spiegelt pages/api/mail/verstuur-vrij.js (info@) maar dan voor offerte@,
// met bijlage-ondersteuning die lib/offerte/verstuurOfferteMail.js al biedt.
import { verstuurOfferteMail } from '@/lib/offerte/verstuurOfferteMail';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
};

function valideerAttachments(attachments) {
  if (attachments == null) return { ok: true, attachments: undefined };
  if (!Array.isArray(attachments)) return { ok: false, error: 'attachments moet een array zijn' };

  const gevalideerd = [];
  for (const bijlage of attachments) {
    const { filename, contentBase64, contentType } = bijlage || {};
    if (!filename || !contentBase64) return { ok: false, error: 'attachment mist filename of contentBase64' };

    const content = Buffer.from(contentBase64, 'base64');
    if (content.length === 0) return { ok: false, error: `attachment ${filename} is leeg of ongeldig base64` };
    if (content.length > MAX_ATTACHMENT_BYTES) return { ok: false, error: `attachment ${filename} overschrijdt de limiet van 15MB` };

    gevalideerd.push({ filename, content, contentType: contentType || undefined });
  }
  return { ok: true, attachments: gevalideerd };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, subject, html, text, replyTo, attachments } = req.body || {};
  if (!to || !EMAIL_RE.test(to)) return res.status(400).json({ error: 'Geldig e-mailadres (to) ontbreekt' });
  if (!subject) return res.status(400).json({ error: 'subject ontbreekt' });
  if (!html && !text) return res.status(400).json({ error: 'html of text ontbreekt' });

  const { ok, error, attachments: gevalideerdeAttachments } = valideerAttachments(attachments);
  if (!ok) return res.status(400).json({ error });

  const mailResult = await verstuurOfferteMail({
    to,
    subject,
    html,
    text: text || undefined,
    replyTo: replyTo || undefined,
    attachments: gevalideerdeAttachments,
  });
  return res.status(200).json({ ok: true, mailSent: !!mailResult.sent, mailResult });
}
