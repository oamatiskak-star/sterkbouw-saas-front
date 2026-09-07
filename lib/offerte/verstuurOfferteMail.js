// lib/offerte/verstuurOfferteMail.js
// Verstuurt de premium offerte-mail naar de klant vanaf offerte@strkbouw.nl (Cloud86-mailbox).
// Provider-volgorde: SMTP (Cloud86, primair) → Mailtrap → Resend → no-op zonder configuratie.
// Alleen het afzenderadres is dedicated, los van LEADS_FROM_EMAIL: dat is voor interne
// lead-notificaties, dit is het klantgerichte offerte-postvak.
import nodemailer from 'nodemailer';

const MAILTRAP_ENDPOINT = 'https://send.api.mailtrap.io/api/send';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

async function sendViaSmtp({ to, fromEmail, fromName, replyTo, subject, html, text }) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || fromEmail;
  const pass = process.env.SMTP_PASS;
  if (!host || !pass) return null; // niet geconfigureerd → volgende provider proberen

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: { user, pass },
  });

  try {
    const info = await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      replyTo: replyTo || undefined,
      subject,
      html,
      text,
    });
    return { sent: true, provider: 'smtp', messageId: info.messageId };
  } catch (e) {
    return { sent: false, provider: 'smtp', reason: String(e?.message || e).slice(0, 300) };
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

export async function verstuurOfferteMail({ to, replyTo, subject, html, text }) {
  const fromEmail = process.env.OFFERTE_FROM_EMAIL || 'offerte@strkbouw.nl';
  const fromName = process.env.OFFERTE_FROM_NAME || 'STRKBOUW';
  const msg = { to, fromEmail, fromName, replyTo, subject, html, text };

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
