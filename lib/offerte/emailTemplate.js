// lib/offerte/emailTemplate.js
// STRKBOUW-uitnodiging voor particuliere bouwklanten (tekst goedgekeurd 22-10-2026, letterlijk overgenomen).
// Puur HTML-opmaak, geen logica — data komt van de aanroeper (pages/api/offerte/verstuur.js, test-mail.js).
// Eén CTA naar de persoonlijke offerte; geen prijs. De link moet een geldige productielink zijn (geldigePortaalUrl),
// anders weigert de aanroeper te verzenden.

const esc = (s) => String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

export const PORTAAL_HOST = 'calculatie.strkbouw.nl';

// Alleen https://calculatie.strkbouw.nl/portaal/<token>; geen placeholder, preview, tunnel of localhost.
export function geldigePortaalUrl(url) {
  if (typeof url !== 'string' || /[[\]{}<>]|PERSOONLIJKE|VOLGT/i.test(url)) return false;
  let u;
  try { u = new URL(url); } catch { return false; }
  return u.protocol === 'https:' && u.hostname === PORTAAL_HOST && !u.search && !u.hash && !u.port
    && /^\/portaal\/[A-Za-z0-9_-]{16,64}$/.test(u.pathname);
}

const KLEUR = { navy: '#0D1B2A', goud: '#C9A227', tekst: '#1F2937', zacht: '#4B5563', grijs: '#9AA5B1', lijn: '#EEF0F2', achter: '#F1EFEA' };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const p = (t, extra = '') => `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.65;color:${KLEUR.zacht};${extra}">${t}</p>`;

// reviewUrl wordt bewust niet meer getoond (besluit 22-10-2026: geen extra link in de uitnodiging); de parameter blijft
// geaccepteerd zodat bestaande aanroepers ongewijzigd werken.
export function buildOfferteEmail({ klantNaam, projectnaam, portalUrl, afzenderNaam: _afzenderNaam, bedrijfNaam: _bedrijfNaam, reviewUrl: _reviewUrl, notitie }) {
  const naam = esc(klantNaam || 'klant');
  const project = esc(projectnaam || 'uw project');
  const url = esc(portalUrl);
  const noot = notitie ? esc(notitie) : null;

  const subject = `Uw offerte staat klaar`;

  const html = `<!doctype html>
<html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>Uw offerte staat klaar</title></head>
<body style="margin:0;padding:0;background:${KLEUR.achter};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${KLEUR.achter};"><tr><td align="center" style="padding:28px 12px;">
    <!--[if mso]><table role="presentation" width="580" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:16px;border-collapse:separate;">
      <tr><td style="background:${KLEUR.navy};border-radius:16px 16px 0 0;padding:22px 32px;">
        <span style="font-family:${FONT};color:#ffffff;font-size:17px;font-weight:800;letter-spacing:0.08em;">STRK<span style="color:${KLEUR.goud};">BOUW</span></span>
        <span style="float:right;font-family:${FONT};color:${KLEUR.goud};font-size:11px;font-weight:700;letter-spacing:0.12em;line-height:24px;">UW BOUWVOORSTEL</span>
      </td></tr>
      <tr><td style="padding:34px 32px 6px;">
        ${p(`Beste ${naam},`, `color:${KLEUR.tekst};`)}
        ${p('Bedankt dat u STRKBOUW heeft betrokken bij uw bouwplannen.')}
        ${p('Een verbouwing of renovatie is een belangrijke investering. Daarom vinden wij het belangrijk dat u vooraf precies weet wat u van ons kunt verwachten.')}
        ${p(`We hebben voor <strong style="color:${KLEUR.tekst};">${project}</strong> een persoonlijk voorstel opgesteld waarin u de werkzaamheden, kosten en gemaakte afspraken overzichtelijk kunt bekijken.`)}
        ${p('<strong>Uw persoonlijke offerte staat voor u klaar.</strong>', `color:${KLEUR.tekst};font-size:16px;`)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 10px;"><tr>
          <td align="center" bgcolor="${KLEUR.navy}" style="background:${KLEUR.navy};border-radius:10px;">
            <a href="${url}" target="_blank" style="display:block;padding:15px 22px;font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">Bekijk uw bouwvoorstel &rarr;</a>
          </td></tr></table>
        ${p(`<span style="font-size:12px;color:${KLEUR.grijs};">Werkt de knop niet? Kopieer dan deze link in uw browser:<br>${url}</span>`, 'margin:0 0 22px;word-break:break-all;')}
        ${p('U kunt het voorstel rustig doornemen en bekijken welke vervolgstappen mogelijk zijn.')}
        ${p('Heeft u vragen of wilt u iets bespreken voordat u een beslissing neemt? Dan helpen wij u graag verder.')}
        ${noot ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr><td style="background:#FAFAF8;border-left:3px solid ${KLEUR.goud};border-radius:6px;padding:14px 16px;font-family:${FONT};font-size:14px;line-height:1.6;color:${KLEUR.zacht};">${noot}</td></tr></table>` : ''}
        ${p('Met vriendelijke groet,', 'margin:8px 0 4px;')}
        ${p(`<strong style="color:${KLEUR.tekst};">Team STRKBOUW</strong><br>STRKBOUW B.V.`, 'margin:0 0 26px;')}
      </td></tr>
      <tr><td style="padding:18px 32px;border-top:1px solid ${KLEUR.lijn};">
        <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.6;color:${KLEUR.grijs};">STRKBOUW B.V. &middot; Annie Westlandstraat 30, 8923 BD Leeuwarden &middot; KvK 42068733</p>
      </td></tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->
  </td></tr></table>
</body>
</html>`;

  const text = [
    `Beste ${klantNaam || 'klant'},`, '',
    'Bedankt dat u STRKBOUW heeft betrokken bij uw bouwplannen.', '',
    'Een verbouwing of renovatie is een belangrijke investering. Daarom vinden wij het belangrijk dat u vooraf precies weet wat u van ons kunt verwachten.', '',
    `We hebben voor ${projectnaam || 'uw project'} een persoonlijk voorstel opgesteld waarin u de werkzaamheden, kosten en gemaakte afspraken overzichtelijk kunt bekijken.`, '',
    'Uw persoonlijke offerte staat voor u klaar.', '',
    `Bekijk uw bouwvoorstel: ${portalUrl}`, '',
    'U kunt het voorstel rustig doornemen en bekijken welke vervolgstappen mogelijk zijn.', '',
    'Heeft u vragen of wilt u iets bespreken voordat u een beslissing neemt? Dan helpen wij u graag verder.', '',
    ...(notitie ? [notitie, ''] : []),
    'Met vriendelijke groet,', '', 'Team STRKBOUW', 'STRKBOUW B.V.', '',
    'STRKBOUW B.V. · Annie Westlandstraat 30, 8923 BD Leeuwarden · KvK 42068733',
  ].join('\n');

  return { subject, html, text };
}
