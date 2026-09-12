// lib/mail/verstuurMail.js
// Generieke, provider-agnostische mail-verzending — gedeeld tussen offerte-mails
// (offerte@strkbouw.nl) en afspraak-bevestigingsmails (info@strkbouw.nl). SMTP-inloggegevens
// worden per aanroeper meegegeven (elke mailbox heeft eigen credentials bij Cloud86);
// Mailtrap/Resend blijven een gedeelde fallback als er geen SMTP is geconfigureerd.
import nodemailer from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer';
import { appendToSent } from './appendToSent.js';

const MAILTRAP_ENDPOINT = 'https://send.api.mailtrap.io/api/send';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function bouwRawMime({ from, to, replyTo, subject, html, text }) {
  const composer = new MailComposer({ from, to, replyTo: replyTo || undefined, subject, html, text });
  return new Promise((resolve, reject) => {
    composer.compile().build((err, message) => (err ? reject(err) : resolve(message)));
  });
}

async function sendViaSmtp({ smtp, to, fromEmail, fromName, replyTo, subject, html, text }) {
  const { host, port, secure, user, pass } = smtp || {};
  if (!host || !user || !pass) return null; // niet geconfigureerd → volgende provider proberen

  const transporter = nodemailer.createTransport({
    host,
    port: port || 587,
    secure: secure != null ? secure : port === 465,
    auth: { user, pass },
  });

  const from = `${fromName} <${fromEmail}>`;
  let raw;
  try {
    raw = await bouwRawMime({ from, to, replyTo, subject, html, text });
  } catch {
    raw = null; // bouwen van de raw-versie mag de verzending zelf niet blokkeren
  }

  try {
    const info = await transporter.sendMail(raw ? { raw, envelope: { from: fromEmail, to } } : { from, to, replyTo: replyTo || undefined, subject, html, text });
    // 'sent: true' betekent alleen dat de mailserver het bericht heeft AANGENOMEN voor
    // bezorging (SMTP-response, accepted/rejected-adressen) — geen garantie voor daadwerkelijke
    // inbox-aflevering bij de ontvanger.
    const resultaat = {
      sent: true,
      provider: 'smtp',
      messageId: info.messageId,
      smtpResponse: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
      pending: info.pending,
    };

    if (raw) {
      try {
        const appendResultaat = await appendToSent({ host, user, pass, raw });
        resultaat.sentFolder = appendResultaat;
      } catch (e) {
        // Best-effort: de mail is echt verstuurd, alleen de kopie in Verzonden ontbreekt dan.
        resultaat.sentFolder = { appended: false, reason: String(e?.message || e).slice(0, 300) };
      }
    }

    return resultaat;
  } catch (e) {
    return { sent: false, provider: 'smtp', reason: String(e?.message || e).slice(0, 300), code: e?.code, responseCode: e?.responseCode };
  }
}

async function sendViaMailtrap(token, { to, fromEmail, fromName, replyTo, subject, html, text }) {
  const r = await fetch(MAILTRAP_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject, html, text,
      ...(replyTo ? { headers: { 'Reply-To': replyTo } } : {}),
    }),
  });
  const body = await r.text().catch(() => '');
  return { sent: r.ok, status: r.status, provider: 'mailtrap', body: r.ok ? undefined : body.slice(0, 300) };
}

async function sendViaResend(apiKey, { to, fromEmail, fromName, replyTo, subject, html, text }) {
  const r = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      reply_to: replyTo || undefined,
      subject, html, text,
    }),
  });
  const body = await r.text().catch(() => '');
  return { sent: r.ok, status: r.status, provider: 'resend', body: r.ok ? undefined : body.slice(0, 300) };
}

export async function verstuurMail({ smtp, to, replyTo, subject, html, text, fromEmail, fromName }) {
  const msg = { smtp, to, fromEmail, fromName, replyTo, subject, html, text };

  const smtpResult = await sendViaSmtp(msg);
  if (smtpResult) return smtpResult;

  const mailtrapToken = process.env.MAILTRAP_API_TOKEN;
  const resendKey = process.env.RESEND_API_KEY;
  if (!mailtrapToken && !resendKey) return { sent: false, reason: 'no_provider_configured' };

  try {
    if (mailtrapToken) return await sendViaMailtrap(mailtrapToken, msg);
    return await sendViaResend(resendKey, msg);
  } catch (e) {
    return { sent: false, reason: String(e?.message || e).slice(0, 200) };
  }
}
