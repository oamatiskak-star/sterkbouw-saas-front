// lib/offerte/emailTemplate.js
// Premium STRKBOUW-offerte-mail (referentie: scherm "1. E-mail naar klant").
// Puur HTML-opmaak, geen logica — data komt van de aanroeper (pages/api/offerte/verstuur.js).

const esc = (s) => String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

export function buildOfferteEmail({ klantNaam, projectnaam, portalUrl, afzenderNaam, bedrijfNaam, reviewUrl }) {
  const naam = esc(klantNaam || 'klant');
  const project = esc(projectnaam || 'uw project');
  const afzender = esc(afzenderNaam || 'Het STRKBOUW-team');
  const bedrijf = esc(bedrijfNaam || 'STRKBOUW');
  const url = esc(portalUrl);
  const review = reviewUrl ? esc(reviewUrl) : null;

  const subject = `Uw offerte staat klaar`;

  const html = `<!doctype html>
<html lang="nl">
<body style="margin:0;padding:0;background:#F1EFEA;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1EFEA;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#0D1B2A;padding:22px 32px;">
          <span style="color:#ffffff;font-size:16px;font-weight:bold;letter-spacing:0.06em;">${bedrijf.toUpperCase()}</span>
        </td></tr>
        <tr><td style="padding:36px 32px 8px;">
          <h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;color:#111827;">Uw offerte staat klaar</h1>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;">Beste ${naam},</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">Goed nieuws! Uw persoonlijke offerte voor <strong>${project}</strong> staat klaar. We hebben alle wensen, planning en details voor u uitgewerkt.</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#0D1B2A;">
            <a href="${url}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:10px;">Bekijk uw offerte &rarr;</a>
          </td></tr></table>
          <p style="margin:32px 0 4px;font-size:15px;line-height:1.6;color:#374151;">Met vriendelijke groet,</p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#374151;">${afzender}</p>
        </td></tr>
        ${review ? `<tr><td style="padding:20px 32px;border-top:1px solid #EEF0F2;background:#FAFAF8;">
          <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#374151;">Was uw aanvraag tot nu toe prettig verlopen? We stellen een review erg op prijs.</p>
          <a href="${review}" style="font-size:13px;font-weight:bold;color:#0D1B2A;text-decoration:underline;">Laat een review achter &rarr;</a>
        </td></tr>` : ''}
        <tr><td style="padding:18px 32px;border-top:1px solid #EEF0F2;">
          <p style="margin:0;font-size:12px;color:#9AA5B1;">${bedrijf}<br/>Bouwen aan beter wonen.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Beste ${klantNaam || 'klant'},\n\nGoed nieuws! Uw persoonlijke offerte voor ${projectnaam || 'uw project'} staat klaar.\n\nBekijk uw offerte: ${portalUrl}\n\nMet vriendelijke groet,\n${afzenderNaam || 'Het STRKBOUW-team'}` +
    (reviewUrl ? `\n\nWas uw aanvraag tot nu toe prettig verlopen? Laat een review achter: ${reviewUrl}` : '');

  return { subject, html, text };
}
