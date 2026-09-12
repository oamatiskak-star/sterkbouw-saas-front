// lib/mail/appendToSent.js — zet een kopie van een verstuurde mail in de IMAP-map "Verzonden"
// van het postvak dat 'm verstuurde. Nodig omdat SMTP zelf nooit iets in Verzonden zet — dat
// doet normaal de mail-app zelf via IMAP APPEND na het versturen. Wij versturen via kale SMTP
// (Cloud86), dus zonder dit blijft de map leeg terwijl de mail wél echt is afgeleverd.
// Best-effort: als dit faalt, mag de mail zelf gewoon als verstuurd gelden (zie verstuurMail.js).
import { ImapFlow } from 'imapflow';

export async function appendToSent({ host, port, user, pass, raw }) {
  const client = new ImapFlow({
    host,
    port: port || 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  await client.connect();
  try {
    const mailboxes = await client.list();
    const sentBox =
      mailboxes.find((m) => m.specialUse === '\\Sent') ||
      mailboxes.find((m) => /^(sent|verzonden)/i.test(m.name));
    if (!sentBox) throw new Error('Geen Verzonden-map gevonden op de mailserver');

    await client.append(sentBox.path, raw, ['\\Seen']);
    return { appended: true, mailbox: sentBox.path };
  } finally {
    await client.logout().catch(() => {});
  }
}
