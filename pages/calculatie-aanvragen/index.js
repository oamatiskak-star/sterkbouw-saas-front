// pages/calculatie-aanvragen/index.js
// STRKBOUW — Calculatie-aanvraag funnel (publiek, Google-Ads landing).
// 3-staps wizard → hergebruikt bestaande quickscan-backend (submit + track).
// Zelfstandig gestyled met styled-jsx (geen conflict met Tabler/antd/MUI).
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

const GADS_ID = process.env.NEXT_PUBLIC_GADS_CONVERSION_ID;
const GADS_LABEL = process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL;

const PROJECTTYPES = [
  ['nieuwbouw', 'Nieuwbouw', 'Complete nieuwbouw van woning of bedrijfspand.'],
  ['verbouw', 'Verbouw', 'Ingrijpende verbouwing van een bestaand pand.'],
  ['herstel', 'Herstel', 'Herstelwerk na schade, gebreken of achterstallig onderhoud.'],
  ['renovatie', 'Renovatie', 'Renovatie en modernisering naar hedendaags niveau.'],
  ['transformatie', 'Transformatie', 'Kantoor, winkel of ander vastgoed omzetten naar wonen.'],
  ['aanbouw', 'Aanbouw', 'Aanbouw, opbouw of uitbreiding van uw woning.'],
];

const OMVANG_OPTIES = ['< 100 m²', '100–250 m²', '250–500 m²', '> 500 m²', 'Weet ik nog niet'];
const URGENTIE_OPTIES = ['Zo snel mogelijk', 'Binnen 1–3 maanden', 'Binnen 6 maanden', 'Oriënterend'];

function captureUtm() {
  if (typeof window === 'undefined') return {};
  try {
    const p = new URLSearchParams(window.location.search);
    const utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach((k) => {
      const v = p.get(k); if (v) utm[k] = v;
    });
    return { utm, ref: document.referrer || null };
  } catch { return {}; }
}

export default function CalculatieAanvragen() {
  const [step, setStep] = useState(1);
  const [projecttype, setProjecttype] = useState(null);
  const [projectadres, setProjectadres] = useState('');
  const [fundaUrl, setFundaUrl] = useState('');
  const [omvang, setOmvang] = useState(OMVANG_OPTIES[0]);
  const [urgentie, setUrgentie] = useState(URGENTIE_OPTIES[0]);
  const [bericht, setBericht] = useState('');
  const [naam, setNaam] = useState('');
  const [email, setEmail] = useState('');
  const [telefoon, setTelefoon] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [err, setErr] = useState(null);
  const utmRef = useRef({});

  useEffect(() => {
    utmRef.current = captureUtm();
    // visit-tracking (faalt stil, breekt nooit de UX)
    fetch('/api/quickscan/track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/calculatie-aanvragen', ...utmRef.current }),
    }).catch(() => {});
  }, []);

  const scrollToWizard = () => {
    document.getElementById('calc-wizard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const kiesType = (key) => {
    setProjecttype(key);
    setErr(null);
    setStep(2);
  };

  const onFiles = (e) => {
    const list = Array.from(e.target.files || []).slice(0, 8);
    setFiles(list);
  };

  const fireConversion = () => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'generate_lead', form: 'calculatie_aanvraag' });
      if (GADS_ID && GADS_LABEL && window.gtag) {
        window.gtag('event', 'conversion', { send_to: `${GADS_ID}/${GADS_LABEL}` });
      }
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!naam.trim()) { setErr('Vul uw naam in.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErr('Vul een geldig e-mailadres in.'); return; }

    setStatus('loading'); setErr(null);
    const samengesteldBericht =
      `Omvang: ${omvang} · Urgentie: ${urgentie}${bericht.trim() ? `\n\n${bericht.trim()}` : ''}`;

    const fd = new FormData();
    fd.set('naam', naam.trim());
    fd.set('email', email.trim());
    fd.set('telefoon', telefoon.trim());
    fd.set('projectadres', projectadres.trim());
    fd.set('funda_url', fundaUrl.trim());
    fd.set('projecttype', projecttype || '');
    fd.set('bericht', samengesteldBericht);
    fd.set('bron', 'calculatie_aanvraag');
    fd.set('utm', JSON.stringify(utmRef.current?.utm || {}));
    files.forEach((f) => fd.append('files', f));

    try {
      const res = await fetch('/api/quickscan/submit', { method: 'POST', body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || 'Versturen mislukt');
      setStatus('done');
      fireConversion();
      scrollToWizard();
    } catch {
      setStatus('error');
      setErr('Er ging iets mis bij het versturen. Probeer het opnieuw of mail ons direct.');
    }
  };

  return (
    <div className="ca">
      <Head>
        <title>Gratis bouwcalculatie binnen 24 uur — vraag direct aan | STRKBOUW</title>
        <meta name="description" content="Vraag gratis een professionele bouwcalculatie aan. Binnen 24 uur een STABU-onderbouwde richtprijs voor nieuwbouw, verbouw, renovatie, transformatie of aanbouw. Vrijblijvend en zonder verplichtingen." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {GADS_ID ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GADS_ID}`} strategy="afterInteractive" />
          <Script id="gads-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GADS_ID}');`}
          </Script>
        </>
      ) : null}

      {/* ── A. HERO ─────────────────────────────────────────── */}
      <header className="hero">
        <div className="wrap">
          <span className="brand">STRK<span className="brand-b">BOUW</span></span>
          <h1>Gratis bouwcalculatie <span className="hl">binnen 24 uur</span></h1>
          <p className="sub">Ontvang een professionele, STABU-onderbouwde richtprijs voor uw bouwproject. Gratis, vrijblijvend en binnen 24 uur in uw mailbox.</p>
          <div className="trustbar" role="list">
            <span className="trust-item" role="listitem"><span className="t-ico" aria-hidden>&#10003;</span>STABU-calculatie</span>
            <span className="trust-item" role="listitem"><span className="t-ico" aria-hidden>&#10003;</span>Gratis &amp; vrijblijvend</span>
            <span className="trust-item" role="listitem"><span className="t-ico" aria-hidden>&#10003;</span>Reactie binnen 24 uur</span>
          </div>
          <button className="btn btn-gold btn-hero" onClick={scrollToWizard}>Start uw gratis calculatie</button>
        </div>
      </header>

      {/* ── C. WAT U ONTVANGT ───────────────────────────────── */}
      <section className="benefits" aria-labelledby="benefits-h">
        <div className="wrap">
          <h2 id="benefits-h">Wat u binnen 24 uur ontvangt</h2>
          <ul className="benefit-grid">
            <li><strong>Indicatieve bouwkosten</strong><span>Een realistische richtprijs op basis van werkelijke kostendata.</span></li>
            <li><strong>Grootste kostenposten</strong><span>Waar het budget écht naartoe gaat — per bouwdeel inzichtelijk.</span></li>
            <li><strong>Risico&apos;s &amp; verborgen kosten</strong><span>De posten die offertes vaak missen en budgetten laten ontsporen.</span></li>
            <li><strong>Eerste haalbaarheid</strong><span>Een onderbouwde inschatting of uw plan financieel haalbaar is.</span></li>
          </ul>
        </div>
      </section>

      {/* ── B. WIZARD ───────────────────────────────────────── */}
      <section className="wizard-sec" id="calc-wizard" aria-labelledby="wizard-h">
        <div className="wrap wrap-narrow">
          {status === 'done' ? (
            <div className="panel thanks">
              <div className="thanks-mark" aria-hidden>&#10003;</div>
              <h2>Aanvraag ontvangen</h2>
              <p>U ontvangt binnen 24 uur uw calculatie op <strong>{email.trim()}</strong>.</p>
              <p className="thanks-next">Onze calculator beoordeelt uw project en stelt de indicatieve bouwkosten, kostenposten en risico&apos;s voor u op. Heeft u aanvullende stukken? Beantwoord dan simpelweg onze e-mail.</p>
            </div>
          ) : (
            <div className="panel">
              <div className="progress" aria-live="polite">
                <span className="progress-label">Stap {step} van 3</span>
                <div className="progress-track" aria-hidden>
                  <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
                </div>
              </div>

              {step === 1 && (
                <div>
                  <h2 id="wizard-h">Wat voor project heeft u?</h2>
                  <p className="w-lead">Kies het type dat het best bij uw plan past.</p>
                  <div className="type-grid">
                    {PROJECTTYPES.map(([key, label, desc]) => (
                      <button
                        type="button" key={key}
                        className={`type-card${projecttype === key ? ' selected' : ''}`}
                        onClick={() => kiesType(key)}
                        aria-pressed={projecttype === key}
                      >
                        <span className="tc-head">
                          <strong>{label}</strong>
                          {projecttype === key && <span className="tc-check" aria-hidden>&#10003;</span>}
                        </span>
                        <span className="tc-desc">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 id="wizard-h">Project &amp; omvang</h2>
                  <p className="w-lead">Vertel ons waar en hoe groot. Hoe completer, hoe scherper de calculatie.</p>
                  <label className="field">
                    <span>Projectadres</span>
                    <input type="text" value={projectadres} onChange={(e) => setProjectadres(e.target.value)} placeholder="Straat, plaats" autoComplete="street-address" />
                  </label>
                  <label className="field">
                    <span>Funda-link of brochure-URL <em>(optioneel)</em></span>
                    <input type="url" value={fundaUrl} onChange={(e) => setFundaUrl(e.target.value)} placeholder="https://www.funda.nl/..." />
                  </label>
                  <div className="grid-2">
                    <label className="field">
                      <span>Omvang</span>
                      <select value={omvang} onChange={(e) => setOmvang(e.target.value)}>
                        {OMVANG_OPTIES.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </label>
                    <label className="field">
                      <span>Urgentie</span>
                      <select value={urgentie} onChange={(e) => setUrgentie(e.target.value)}>
                        {URGENTIE_OPTIES.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="field">
                    <span>Toelichting <em>(optioneel)</em></span>
                    <textarea rows={4} value={bericht} onChange={(e) => setBericht(e.target.value)} placeholder="Plannen, wensen, vragen of context..." />
                  </label>
                  <div className="nav-row">
                    <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Terug</button>
                    <button type="button" className="btn btn-gold" onClick={() => setStep(3)}>Volgende</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <form onSubmit={submit} noValidate>
                  <h2 id="wizard-h">Contact &amp; documenten</h2>
                  <p className="w-lead">Waar mogen we de calculatie naartoe sturen?</p>
                  <div className="grid-2">
                    <label className="field">
                      <span>Naam *</span>
                      <input type="text" value={naam} onChange={(e) => setNaam(e.target.value)} autoComplete="name" required />
                    </label>
                    <label className="field">
                      <span>E-mailadres *</span>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                    </label>
                  </div>
                  <label className="field">
                    <span>Telefoonnummer <em>(optioneel)</em></span>
                    <input type="tel" value={telefoon} onChange={(e) => setTelefoon(e.target.value)} autoComplete="tel" />
                  </label>
                  <label className="field">
                    <span>Tekeningen, foto&apos;s of plattegrond <em>(optioneel)</em></span>
                    <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={onFiles} />
                    {files.length > 0 && (
                      <ul className="filelist">{files.map((f, i) => <li key={i}>{f.name} <em>({Math.round((f.size || 0) / 1024)} kB)</em></li>)}</ul>
                    )}
                  </label>
                  {err && <p className="form-err" role="alert">{err}</p>}
                  <div className="nav-row">
                    <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>Terug</button>
                    <button className="btn btn-gold btn-submit" type="submit" disabled={status === 'loading'}>
                      {status === 'loading' ? 'Versturen…' : 'Vraag gratis calculatie aan'}
                    </button>
                  </div>
                  <p className="form-fine">Gratis &middot; vrijblijvend &middot; uw gegevens worden uitsluitend gebruikt om uw calculatie op te stellen.</p>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── SLOT ────────────────────────────────────────────── */}
      <footer className="closer">
        <div className="wrap center">
          <h2>Beslis op cijfers — niet op aannames.</h2>
          <p>STRKBOUW rekent bouwprojecten door voor beleggers, ontwikkelaars, ondernemers en particulieren. Vóór u tekent.</p>
          {status !== 'done' && (
            <button className="btn btn-gold btn-hero" onClick={scrollToWizard}>Start uw gratis calculatie</button>
          )}
          <span className="brand brand-foot">STRK<span className="brand-b">BOUW</span></span>
        </div>
      </footer>

      <style jsx>{`
        .ca { --navy:#0D1B2A; --navy2:#13263b; --ink:#16222f; --muted:#5a6b7a;
              --gold:#C9A24B; --gold-d:#b08c39; --line:#e5e9ee; --soft:#f5f7f9; --white:#fff;
              --ok:#1f9d6b; --danger:#cf4b3a;
              font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
              color: var(--ink); background: var(--white); line-height: 1.55; }
        .ca *, .ca *::before, .ca *::after { box-sizing: border-box; }
        .ca h1,.ca h2,.ca h3,.ca p,.ca ul { margin: 0; }
        .wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
        .wrap-narrow { max-width: 760px; }
        .center { text-align: center; }

        /* Brand */
        .brand { font-weight:900; letter-spacing:.02em; font-size:20px; color:#fff; }
        .brand-b { color: var(--gold); }
        .brand-foot { display:block; margin-top:28px; color:#fff; }

        /* Buttons */
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px;
               border:none; border-radius:12px; padding:15px 26px; font-size:16px; font-weight:700;
               font-family:inherit; cursor:pointer;
               transition: transform .15s ease, box-shadow .15s ease, background .15s ease; }
        .btn:focus-visible { outline:3px solid var(--gold-d); outline-offset:2px; }
        .btn-gold { background: var(--gold); color:#1a1305; box-shadow: 0 10px 26px rgba(201,162,75,.32); }
        .btn-gold:hover { background: var(--gold-d); transform: translateY(-2px); box-shadow:0 14px 32px rgba(201,162,75,.4); }
        .btn-gold:disabled { opacity:.6; cursor:default; transform:none; box-shadow:none; }
        .btn-hero { padding:17px 34px; font-size:17px; }
        .btn-ghost { background:transparent; color:var(--muted); border:1px solid var(--line); }
        .btn-ghost:hover { border-color:#c3ced8; color:var(--ink); }
        .btn-submit { flex:1; }

        /* A. HERO */
        .hero { background: radial-gradient(120% 120% at 80% 0%, #1a3a5c 0%, transparent 60%),
                            linear-gradient(160deg,#0c1a29 0%, #102a42 100%);
                color:#dfe7ee; padding: 72px 0 80px; text-align:center; position:relative; overflow:hidden; }
        .hero::after { content:''; position:absolute; inset:0; pointer-events:none;
          background: radial-gradient(60% 80% at 90% 10%, rgba(201,162,75,.16), transparent 60%); }
        .hero .wrap { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:0; }
        .hero h1 { margin-top:26px; font-size: clamp(32px,5.2vw,58px); line-height:1.06; font-weight:900;
                   letter-spacing:-.025em; color:#fff; max-width:820px; }
        .hero .hl { color: var(--gold); }
        .hero .sub { margin-top:18px; font-size: clamp(16px,1.8vw,20px); color:#b9c6d2; max-width:640px; }
        .trustbar { margin-top:30px; display:flex; gap:14px 28px; flex-wrap:wrap; justify-content:center; }
        .trust-item { display:inline-flex; align-items:center; gap:9px; font-size:14.5px; font-weight:650; color:#cdd8e1; }
        .t-ico { display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px;
                 border-radius:7px; background:rgba(201,162,75,.16); color:var(--gold); font-weight:900; font-size:13px; }
        .hero .btn-hero { margin-top:34px; }

        /* C. BENEFITS */
        .benefits { background: var(--soft); padding: 64px 0; border-bottom:1px solid var(--line); }
        .benefits h2 { font-size: clamp(22px,2.8vw,32px); font-weight:800; letter-spacing:-.02em; text-align:center; }
        .benefit-grid { list-style:none; padding:0; margin:36px 0 0; display:grid;
                        grid-template-columns: repeat(4,1fr); gap:18px; }
        .benefit-grid li { background:var(--white); border:1px solid var(--line); border-radius:14px;
                           padding:22px; display:flex; flex-direction:column; gap:7px; position:relative; }
        .benefit-grid li::before { content:'\\2713'; display:inline-flex; align-items:center; justify-content:center;
          width:30px; height:30px; border-radius:9px; background:rgba(201,162,75,.14); color:var(--gold-d);
          font-weight:900; margin-bottom:6px; }
        .benefit-grid strong { font-size:16px; font-weight:750; }
        .benefit-grid span { color:var(--muted); font-size:14px; }

        /* B. WIZARD */
        .wizard-sec { padding: 80px 0 96px; background: linear-gradient(180deg,#fff 0%, var(--soft) 100%); }
        .panel { background:var(--white); border:1px solid var(--line); border-radius:18px;
                 padding: clamp(24px,4vw,40px); box-shadow:0 20px 50px rgba(13,27,42,.08); }
        .panel h2 { font-size: clamp(22px,2.8vw,30px); font-weight:800; letter-spacing:-.02em; }
        .w-lead { color:var(--muted); font-size:15.5px; margin:10px 0 26px; }

        .progress { margin-bottom:28px; }
        .progress-label { display:block; font-size:12.5px; font-weight:700; letter-spacing:.1em;
                          text-transform:uppercase; color:var(--gold-d); margin-bottom:9px; }
        .progress-track { height:6px; border-radius:99px; background:var(--soft); overflow:hidden; }
        .progress-fill { height:100%; border-radius:99px; background: linear-gradient(90deg, var(--gold-d), var(--gold));
                         transition: width .3s ease; }

        /* Stap 1: type-kaarten */
        .type-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:14px; }
        .type-card { text-align:left; background:var(--white); border:2px solid var(--line); border-radius:14px;
                     padding:18px; cursor:pointer; font-family:inherit; display:flex; flex-direction:column; gap:7px;
                     transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease; }
        .type-card:hover { border-color:var(--gold); transform: translateY(-2px); box-shadow:0 12px 26px rgba(13,27,42,.08); }
        .type-card:focus-visible { outline:3px solid var(--gold-d); outline-offset:2px; }
        .type-card.selected { border-color:var(--gold); box-shadow:0 0 0 3px rgba(201,162,75,.18); }
        .tc-head { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .tc-head strong { font-size:16px; font-weight:750; color:var(--ink); }
        .tc-check { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px;
                    border-radius:50%; background:var(--gold); color:#1a1305; font-size:12px; font-weight:900; flex:none; }
        .tc-desc { font-size:13.5px; color:var(--muted); line-height:1.45; }

        /* Velden */
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .field { display:block; margin-bottom:16px; }
        .field > span { display:block; font-size:13.5px; font-weight:650; color:#41525f; margin-bottom:7px; }
        .field > span em { font-style:normal; font-weight:500; color:#90a0ad; }
        .field input, .field textarea, .field select {
          width:100%; border:1px solid #d6dde4; border-radius:10px; padding:12px 14px; font-size:15px;
          font-family:inherit; color:var(--ink); background:#fff;
          transition:border-color .15s ease, box-shadow .15s ease; }
        .field input:focus-visible, .field textarea:focus-visible, .field select:focus-visible {
          outline:none; border-color:var(--gold); box-shadow:0 0 0 3px rgba(201,162,75,.18); }
        .field textarea { resize:vertical; }
        .field select { appearance:none; -webkit-appearance:none;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235a6b7a' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position: right 14px center; padding-right:38px; }
        .filelist { list-style:none; padding:0; margin:10px 0 0; display:flex; flex-direction:column; gap:5px; }
        .filelist li { font-size:13px; color:#41525f; background:var(--soft); border-radius:8px; padding:7px 11px; }
        .filelist em { color:#90a0ad; font-style:normal; }
        .form-err { color:var(--danger); font-size:14px; margin:0 0 14px; font-weight:600; }
        .form-fine { margin-top:16px; font-size:12.5px; color:#90a0ad; text-align:center; }
        .nav-row { display:flex; gap:12px; margin-top:8px; }
        .nav-row .btn-gold:not(.btn-submit) { margin-left:auto; }

        /* Bedank-stap */
        .thanks { text-align:center; }
        .thanks-mark { width:64px; height:64px; border-radius:50%; background:rgba(31,157,107,.12); color:var(--ok);
                       font-size:30px; display:flex; align-items:center; justify-content:center; margin:0 auto 22px; }
        .thanks h2 { margin-bottom:14px; }
        .thanks p { color:var(--muted); max-width:520px; margin:0 auto; }
        .thanks p strong { color:var(--ink); }
        .thanks-next { margin-top:14px !important; font-size:14.5px; }

        /* SLOT */
        .closer { background: var(--navy); color:#dfe7ee; padding:84px 0; }
        .closer h2 { color:#fff; font-size:clamp(24px,3.2vw,38px); font-weight:800; max-width:680px;
                     margin:0 auto; letter-spacing:-.02em; }
        .closer p { color:#a9b8c4; max-width:580px; margin:16px auto 28px; font-size:16.5px; }

        @media (max-width: 860px) {
          .benefit-grid { grid-template-columns: repeat(2,1fr); }
          .type-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 560px) {
          .benefit-grid { grid-template-columns: 1fr; }
          .type-grid { grid-template-columns: 1fr; }
          .grid-2 { grid-template-columns: 1fr; }
          .hero { padding: 56px 0 64px; }
          .wizard-sec { padding: 56px 0 72px; }
          .nav-row { flex-direction: column-reverse; }
          .nav-row .btn-gold:not(.btn-submit) { margin-left:0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ca .btn, .ca .type-card, .ca .progress-fill,
          .ca .field input, .ca .field textarea, .ca .field select { transition: none; }
          .ca .btn:hover, .ca .type-card:hover { transform: none; }
        }
      `}</style>
    </div>
  );
}
