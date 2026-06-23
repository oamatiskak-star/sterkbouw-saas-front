// pages/bouwkosten-quickscan/index.js
// STRKBOUW — Bouwkosten Quickscan landingspagina (publiek, conversiegericht).
// Zelfstandig gestyled met styled-jsx (geen conflict met Tabler/antd/MUI).
// 8 secties: hero · probleem · verborgen kosten · quickscan-uitleg · cases · FAQ · formulier · slot-CTA.
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

const VERBORGEN_KOSTEN = [
  ['Constructief herstel', 'Funderingen, scheuren, draagmuren — pas zichtbaar na sloop.'],
  ['Installaties', 'Verouderde elektra, gas naar all-electric, ventilatie en netverzwaring.'],
  ['Asbest & milieu', 'Sanering die verplicht is vóór er één muur valt.'],
  ['Vergunningen & leges', 'Bestemmingsplan, constructieberekening, welstand — geld én tijd.'],
  ['Afwerking onderschat', 'Het verschil tussen casco en opleverniveau is groter dan gedacht.'],
  ['Bouwkostenindexatie', 'Materiaal- en loonstijging tussen plan en uitvoering.'],
];

const CASES = [
  {
    tag: 'Belegger · appartementencomplex',
    quote: 'Stond op het punt te tekenen. De quickscan legde €78.000 aan verborgen kosten bloot.',
    result: 'Onderhandeld over de prijs — of weggelopen vóór de fout.',
  },
  {
    tag: 'Ontwikkelaar · transformatie kantoor',
    quote: 'Haalbaarheid leek krap. Werkelijke bouwkosten maakten het verschil tussen go en no-go.',
    result: 'Investeringsbesluit in dagen i.p.v. weken.',
  },
  {
    tag: 'Particulier · aanbouw + verbouwing',
    quote: 'De aannemersofferte bleek €40.000 onder de realistische kostprijs.',
    result: 'Betere onderhandelingspositie met cijfers in de hand.',
  },
];

const FAQS = [
  ['Wat kost de quickscan?', 'Niets. De Bouwkosten Quickscan is gratis en vrijblijvend. Het is onze manier om u te laten zien hoe wij naar werkelijke bouwkosten kijken.'],
  ['Wat heb ik nodig om aan te vragen?', 'Een Funda-link, brochure, plattegrond of korte projectinformatie volstaat. Hoe meer u aanlevert, hoe scherper de inschatting.'],
  ['Hoe snel ontvang ik resultaat?', 'Binnen 24 uur ontvangt u indicatieve bouwkosten, de grootste risico’s, de belangrijkste kostenposten en een eerste haalbaarheidsinschatting.'],
  ['Is dit een volledige calculatie?', 'Nee. De quickscan is een indicatie om snel een beslissing te onderbouwen. Een volledige STABU-bouwcalculatie of haalbaarheidsanalyse is de vervolgstap als u zekerheid wilt vastleggen.'],
  ['Voor wie is dit bedoeld?', 'Vastgoedbeleggers, projectontwikkelaars, ondernemers en particulieren die vóór aankoop, ontwikkeling of verbouwing willen weten wat het écht gaat kosten.'],
];

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

export default function BouwkostenQuickscan() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [err, setErr] = useState(null);
  const formRef = useRef(null);
  const utmRef = useRef({});

  useEffect(() => {
    utmRef.current = captureUtm();
    // visit-tracking (faalt stil, breekt nooit de UX)
    fetch('/api/quickscan/track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(utmRef.current),
    }).catch(() => {});
  }, []);

  const onFiles = (e) => {
    const list = Array.from(e.target.files || []).slice(0, 8);
    setFiles(list);
  };

  const scrollToForm = () => {
    document.getElementById('quickscan-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    const fd = new FormData(form);
    const naam = String(fd.get('naam') || '').trim();
    const email = String(fd.get('email') || '').trim();
    if (!naam) { setErr('Vul uw naam in.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Vul een geldig e-mailadres in.'); return; }

    setStatus('loading'); setErr(null);
    fd.set('utm', JSON.stringify(utmRef.current?.utm || {}));
    fd.set('bron', 'landing');
    try {
      const res = await fetch('/api/quickscan/submit', { method: 'POST', body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || 'Versturen mislukt');
      setStatus('done');
      window.scrollTo({ top: document.getElementById('quickscan-form').offsetTop - 40, behavior: 'smooth' });
    } catch (e2) {
      setStatus('error');
      setErr(e2?.message === 'Versturen mislukt' ? e2.message : 'Er ging iets mis. Probeer het opnieuw of mail ons direct.');
    }
  };

  return (
    <div className="qs">
      <Head>
        <title>Bouwkosten Quickscan — voorkom dat u te veel betaalt | STRKBOUW</title>
        <meta name="description" content="Ontvang binnen 24 uur inzicht in de werkelijke bouwkosten van uw vastgoedproject. Gratis Bouwkosten Quickscan: indicatieve kosten, risico's en haalbaarheid — vóór u koopt, ontwikkelt of verbouwt." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ── 1. HERO ─────────────────────────────────────────── */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="brand">STRK<span className="brand-b">BOUW</span></span>
            <span className="eyebrow">Bouwkosten-intelligence vóór de aankoop</span>
            <h1>Voorkom dat u <span className="hl">&euro;50.000 te veel</span> betaalt voor uw volgende vastgoedproject.</h1>
            <p className="sub">Ontvang binnen 24 uur inzicht in de werkelijke bouwkosten van uw project — de risico&apos;s, de grootste kostenposten en een eerste haalbaarheidsinschatting.</p>
            <div className="hero-cta">
              <button className="btn btn-gold" onClick={scrollToForm}>Vraag gratis bouwkosten quickscan aan</button>
              <span className="trust">Gratis &middot; vrijblijvend &middot; binnen 24 uur</span>
            </div>
            <ul className="hero-points">
              <li>Inzicht in verborgen kosten</li>
              <li>Sterkere onderhandelingspositie</li>
              <li>Sneller investeringsbesluit</li>
            </ul>
          </div>
          <aside className="hero-card">
            <div className="hc-row"><span>Aankoopprijs pand</span><strong>&euro; 480.000</strong></div>
            <div className="hc-row"><span>Geschatte verbouwing (aanname)</span><strong>&euro; 120.000</strong></div>
            <div className="hc-divider" />
            <div className="hc-row danger"><span>Werkelijke bouwkosten</span><strong>&euro; 198.000</strong></div>
            <div className="hc-flag">+ &euro; 78.000 niet ingecalculeerd</div>
            <p className="hc-note">Illustratief voorbeeld. Precies dit verschil onderzoekt de quickscan vóór u tekent.</p>
          </aside>
        </div>
      </header>

      {/* ── 2. PROBLEEM ─────────────────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <span className="kicker">Het probleem</span>
          <h2>De meeste verliezen worden geleden vóór de eerste steen.</h2>
          <p className="lead">Een te optimistische verbouwinschatting, een onderschatte kostenpost of een aannemersofferte zonder onderbouwing — en uw rendement verdampt nog voordat het project begint. Niet de bouw maakt projecten verliesgevend, maar de aannames eromheen.</p>
          <div className="cols-3">
            <div className="mini"><h3>U koopt op gevoel</h3><p>Zonder werkelijke bouwkosten beslist u op een onderbuik in plaats van op cijfers.</p></div>
            <div className="mini"><h3>De aannemer rekent het project</h3><p>U mist een onafhankelijke kostenwaarheid om de offerte tegen af te zetten.</p></div>
            <div className="mini"><h3>Tegenvallers komen te laat</h3><p>Wat na de sloop opduikt, kunt u niet meer wegonderhandelen.</p></div>
          </div>
        </div>
      </section>

      {/* ── 3. VERBORGEN KOSTEN ─────────────────────────────── */}
      <section className="sec sec-dark">
        <div className="wrap">
          <span className="kicker kicker-light">Verborgen kosten</span>
          <h2 className="on-dark">Dit zijn de posten waar projecten op stuklopen.</h2>
          <p className="lead lead-light">Stuk voor stuk kosten die zelden in de eerste inschatting staan — en samen het verschil maken tussen winst en verlies.</p>
          <div className="hidden-grid">
            {VERBORGEN_KOSTEN.map(([t, d]) => (
              <div className="hidden-item" key={t}>
                <span className="hi-mark" aria-hidden>!</span>
                <div><h3>{t}</h3><p>{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. QUICKSCAN-UITLEG ─────────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <span className="kicker">Zo werkt de Bouwkosten Quickscan</span>
          <h2>Van projectinfo naar inzicht — binnen 24 uur.</h2>
          <div className="steps">
            <div className="step"><span className="step-n">1</span><h3>U levert aan</h3><p>Funda-link, brochure, plattegrond of korte projectinformatie. Wat u heeft, is genoeg om te starten.</p></div>
            <div className="step"><span className="step-n">2</span><h3>Wij analyseren</h3><p>We toetsen uw project aan werkelijke bouwkosten, kostenposten en risico&apos;s — niet aan een onderbuikgevoel.</p></div>
            <div className="step"><span className="step-n">3</span><h3>U ontvangt binnen 24 uur</h3><p>Indicatieve bouwkosten, grootste risico&apos;s, belangrijkste kostenposten en een eerste haalbaarheidsinschatting.</p></div>
          </div>
          <div className="center"><button className="btn btn-gold" onClick={scrollToForm}>Vraag gratis bouwkosten quickscan aan</button></div>
        </div>
      </section>

      {/* ── 5. REFERENTIECASES ──────────────────────────────── */}
      <section className="sec sec-soft">
        <div className="wrap">
          <span className="kicker">Referentiecases</span>
          <h2>Wat een scherpe blik vooraf oplevert.</h2>
          <div className="cols-3">
            {CASES.map((c) => (
              <article className="case" key={c.tag}>
                <span className="case-tag">{c.tag}</span>
                <blockquote>&ldquo;{c.quote}&rdquo;</blockquote>
                <p className="case-res">{c.result}</p>
              </article>
            ))}
          </div>
          <p className="disclaimer">Cases zijn illustratief en geanonimiseerd; bedragen dienen ter illustratie van het type inzicht, niet als geverifieerde uitkomst.</p>
        </div>
      </section>

      {/* ── 6. FAQ ──────────────────────────────────────────── */}
      <section className="sec">
        <div className="wrap wrap-narrow">
          <span className="kicker">Veelgestelde vragen</span>
          <h2>Goed om te weten.</h2>
          <div className="faq">
            {FAQS.map(([q, a]) => (
              <details className="faq-item" key={q}>
                <summary>{q}<span className="faq-plus" aria-hidden>+</span></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FORMULIER ────────────────────────────────────── */}
      <section className="sec sec-form" id="quickscan-form">
        <div className="wrap wrap-narrow">
          {status === 'done' ? (
            <div className="thanks">
              <div className="thanks-mark" aria-hidden>&#10003;</div>
              <h2>Bedankt — uw aanvraag staat klaar.</h2>
              <p>U ontvangt binnen 24 uur uw Bouwkosten Quickscan: indicatieve kosten, risico&apos;s, kostenposten en een eerste haalbaarheidsinschatting. Wij nemen contact op via het opgegeven e-mailadres.</p>
            </div>
          ) : (
            <>
              <span className="kicker">Gratis aanvragen</span>
              <h2>Vraag uw Bouwkosten Quickscan aan</h2>
              <p className="lead">Lever aan wat u heeft. Hoe completer, hoe scherper de inschatting — maar één Funda-link volstaat om te starten.</p>
              <form ref={formRef} className="form" onSubmit={submit} noValidate>
                <div className="grid-2">
                  <label className="field"><span>Naam *</span><input name="naam" type="text" autoComplete="name" required /></label>
                  <label className="field"><span>E-mailadres *</span><input name="email" type="email" autoComplete="email" required /></label>
                  <label className="field"><span>Telefoonnummer</span><input name="telefoon" type="tel" autoComplete="tel" /></label>
                  <label className="field"><span>Projectadres</span><input name="projectadres" type="text" placeholder="Straat, plaats" /></label>
                </div>
                <label className="field"><span>Funda-link of brochure-URL</span><input name="funda_url" type="url" placeholder="https://www.funda.nl/..." /></label>
                <label className="field"><span>Projectinformatie</span><textarea name="bericht" rows={4} placeholder="Type project, plannen, vragen of context..." /></label>
                <label className="field">
                  <span>Bestanden uploaden (plattegrond, brochure, PDF)</span>
                  <input name="bestanden" type="file" multiple onChange={onFiles}
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx" />
                  {files.length > 0 && (
                    <ul className="filelist">{files.map((f, i) => <li key={i}>{f.name} <em>({Math.round((f.size || 0) / 1024)} kB)</em></li>)}</ul>
                  )}
                </label>
                {err && <p className="form-err">{err}</p>}
                <button className="btn btn-gold btn-lg" type="submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Versturen…' : 'Vraag gratis bouwkosten quickscan aan'}
                </button>
                <p className="form-fine">Gratis &middot; vrijblijvend &middot; uw gegevens worden uitsluitend gebruikt om uw quickscan op te stellen.</p>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ── 8. SLOT-CTA ─────────────────────────────────────── */}
      <footer className="closer">
        <div className="wrap center">
          <h2>Beslis op werkelijke bouwkosten — niet op aannames.</h2>
          <p>Wij helpen vastgoedbeleggers, ontwikkelaars en ondernemers betere beslissingen nemen vóórdat er wordt gekocht, ontwikkeld of verbouwd.</p>
          <button className="btn btn-gold btn-lg" onClick={scrollToForm}>Start mijn gratis quickscan</button>
          <span className="brand brand-foot">STRK<span className="brand-b">BOUW</span></span>
        </div>
      </footer>

      <style jsx>{`
        .qs { --navy:#0D1B2A; --navy2:#13263b; --ink:#16222f; --muted:#5a6b7a;
              --gold:#C9A24B; --gold-d:#b08c39; --line:#e5e9ee; --soft:#f5f7f9; --white:#fff;
              --ok:#1f9d6b; --danger:#cf4b3a;
              font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
              color: var(--ink); background: var(--white); line-height: 1.55; }
        .qs *, .qs *::before, .qs *::after { box-sizing: border-box; }
        .qs h1,.qs h2,.qs h3,.qs p,.qs ul,.qs blockquote { margin: 0; }
        .wrap { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
        .wrap-narrow { max-width: 760px; }
        .center { text-align: center; }
        .kicker { display:inline-block; font-size:12px; font-weight:700; letter-spacing:.14em;
                  text-transform:uppercase; color:var(--gold-d); margin-bottom:14px; }
        .kicker-light { color:var(--gold); }
        .sec { padding: 88px 0; }
        .sec h2 { font-size: clamp(26px, 3.4vw, 40px); font-weight:800; letter-spacing:-.02em; max-width:780px; }
        .lead { font-size: clamp(16px,1.6vw,19px); color:var(--muted); max-width:680px; margin-top:16px; }
        .lead-light { color:#aab8c4; }
        .on-dark { color:#fff; }

        /* Brand */
        .brand { font-weight:900; letter-spacing:.02em; font-size:20px; color:#fff; }
        .brand-b { color: var(--gold); }
        .brand-foot { display:block; margin-top:28px; color:var(--navy); }
        .brand-foot .brand-b { color: var(--gold-d); }

        /* Buttons */
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px;
               border:none; border-radius:12px; padding:15px 26px; font-size:16px; font-weight:700;
               cursor:pointer; transition: transform .15s ease, box-shadow .15s ease, background .15s ease; }
        .btn-gold { background: var(--gold); color:#1a1305; box-shadow: 0 10px 26px rgba(201,162,75,.32); }
        .btn-gold:hover { background: var(--gold-d); transform: translateY(-2px); box-shadow:0 14px 32px rgba(201,162,75,.4); }
        .btn-gold:disabled { opacity:.6; cursor:default; transform:none; box-shadow:none; }
        .btn-lg { padding:17px 30px; font-size:17px; width:100%; }

        /* 1. HERO */
        .hero { background: radial-gradient(120% 120% at 80% 0%, #1a3a5c 0%, transparent 60%), linear-gradient(160deg,#0c1a29 0%, #102a42 100%); color:#dfe7ee; padding: 76px 0 88px; position:relative; overflow:hidden; }
        .hero::after { content:''; position:absolute; inset:0; background:
          radial-gradient(60% 80% at 90% 10%, rgba(201,162,75,.16), transparent 60%); pointer-events:none; }
        .hero-grid { display:grid; grid-template-columns: 1.25fr .85fr; gap:56px; align-items:center; position:relative; z-index:1; }
        .eyebrow { display:block; margin:18px 0 14px; font-size:13px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); }
        .hero h1 { font-size: clamp(32px,4.6vw,56px); line-height:1.05; font-weight:900; letter-spacing:-.025em; color:#fff; }
        .hero .hl { color: var(--gold); }
        .hero .sub { margin-top:20px; font-size: clamp(16px,1.7vw,20px); color:#b9c6d2; max-width:560px; }
        .hero-cta { margin-top:30px; display:flex; align-items:center; gap:18px; flex-wrap:wrap; }
        .trust { font-size:13px; color:#90a2b1; }
        .hero-points { list-style:none; padding:0; margin:30px 0 0; display:flex; gap:26px; flex-wrap:wrap; }
        .hero-points li { position:relative; padding-left:24px; font-size:14.5px; color:#cdd8e1; }
        .hero-points li::before { content:'\\2713'; position:absolute; left:0; color:var(--gold); font-weight:800; }
        .hero-card { background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1);
                     border-radius:18px; padding:26px; backdrop-filter: blur(4px); box-shadow:0 30px 60px rgba(0,0,0,.35); }
        .hc-row { display:flex; justify-content:space-between; align-items:baseline; gap:12px; padding:11px 0; font-size:14.5px; color:#aebcc8; }
        .hc-row strong { color:#fff; font-size:17px; font-weight:700; }
        .hc-row.danger strong { color: var(--gold); }
        .hc-divider { height:1px; background:rgba(255,255,255,.12); margin:6px 0; }
        .hc-flag { margin-top:14px; background: rgba(201,162,75,.14); color:var(--gold);
                   border:1px solid rgba(201,162,75,.35); border-radius:10px; padding:10px 14px; font-weight:700; font-size:15px; text-align:center; }
        .hc-note { margin-top:14px; font-size:12.5px; color:#8595a3; }

        /* 2 / generic cols */
        .cols-3 { display:grid; grid-template-columns: repeat(3,1fr); gap:24px; margin-top:40px; }
        .mini { background:var(--white); border:1px solid var(--line); border-radius:14px; padding:26px; }
        .mini h3 { font-size:18px; font-weight:750; margin-bottom:8px; }
        .mini p { color:var(--muted); font-size:15px; }

        /* 3. HIDDEN COSTS (dark) */
        .sec-dark { background: var(--navy); }
        .hidden-grid { display:grid; grid-template-columns: repeat(2,1fr); gap:18px; margin-top:40px; }
        .hidden-item { display:flex; gap:16px; background: rgba(255,255,255,.03);
                       border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:22px; }
        .hi-mark { flex:none; width:34px; height:34px; border-radius:9px; background:rgba(201,162,75,.16);
                   color:var(--gold); font-weight:900; display:flex; align-items:center; justify-content:center; font-size:18px; }
        .hidden-item h3 { color:#fff; font-size:16.5px; font-weight:700; margin-bottom:5px; }
        .hidden-item p { color:#9fb0bd; font-size:14.5px; }

        /* 4. STEPS */
        .steps { display:grid; grid-template-columns: repeat(3,1fr); gap:24px; margin:42px 0 40px; }
        .step { position:relative; padding:30px 24px; border:1px solid var(--line); border-radius:16px; background:var(--white); }
        .step-n { display:inline-flex; align-items:center; justify-content:center; width:42px; height:42px;
                  border-radius:50%; background:var(--navy); color:var(--gold); font-weight:800; font-size:18px; margin-bottom:16px; }
        .step h3 { font-size:18px; font-weight:750; margin-bottom:8px; }
        .step p { color:var(--muted); font-size:15px; }

        /* 5. CASES */
        .sec-soft { background: var(--soft); }
        .case { background:var(--white); border:1px solid var(--line); border-radius:16px; padding:28px;
                display:flex; flex-direction:column; gap:14px; }
        .case-tag { font-size:12px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--gold-d); }
        .case blockquote { font-size:18px; font-weight:600; line-height:1.5; color:var(--ink); }
        .case-res { color:var(--muted); font-size:14.5px; margin-top:auto; }
        .disclaimer { margin-top:26px; font-size:12.5px; color:#90a0ad; max-width:720px; }

        /* 6. FAQ */
        .faq { margin-top:34px; border-top:1px solid var(--line); }
        .faq-item { border-bottom:1px solid var(--line); }
        .faq-item summary { list-style:none; cursor:pointer; padding:20px 0; font-size:17px; font-weight:650;
                            display:flex; justify-content:space-between; align-items:center; gap:16px; }
        .faq-item summary::-webkit-details-marker { display:none; }
        .faq-plus { color:var(--gold-d); font-weight:800; font-size:22px; transition: transform .2s ease; }
        .faq-item[open] .faq-plus { transform: rotate(45deg); }
        .faq-item p { padding:0 0 22px; color:var(--muted); font-size:15.5px; max-width:680px; }

        /* 7. FORM */
        .sec-form { background: linear-gradient(180deg,#fff 0%, var(--soft) 100%); }
        .form { margin-top:30px; background:var(--white); border:1px solid var(--line);
                border-radius:18px; padding:30px; box-shadow:0 20px 50px rgba(13,27,42,.07); }
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .field { display:block; margin-bottom:16px; }
        .field > span { display:block; font-size:13.5px; font-weight:650; color:#41525f; margin-bottom:7px; }
        .field input, .field textarea {
          width:100%; border:1px solid #d6dde4; border-radius:10px; padding:12px 14px; font-size:15px;
          font-family:inherit; color:var(--ink); background:#fff; transition:border-color .15s ease, box-shadow .15s ease; }
        .field input:focus, .field textarea:focus { outline:none; border-color:var(--gold); box-shadow:0 0 0 3px rgba(201,162,75,.18); }
        .field textarea { resize:vertical; }
        .filelist { list-style:none; padding:0; margin:10px 0 0; display:flex; flex-direction:column; gap:5px; }
        .filelist li { font-size:13px; color:#41525f; background:var(--soft); border-radius:8px; padding:7px 11px; }
        .filelist em { color:#90a0ad; font-style:normal; }
        .form-err { color:var(--danger); font-size:14px; margin:0 0 14px; font-weight:600; }
        .form-fine { margin-top:14px; font-size:12.5px; color:#90a0ad; text-align:center; }

        /* thanks */
        .thanks { text-align:center; padding:30px 0; }
        .thanks-mark { width:64px; height:64px; border-radius:50%; background:rgba(31,157,107,.12); color:var(--ok);
                       font-size:30px; display:flex; align-items:center; justify-content:center; margin:0 auto 22px; }
        .thanks h2 { margin-bottom:14px; }
        .thanks p { color:var(--muted); max-width:560px; margin:0 auto; }

        /* 8. CLOSER */
        .closer { background: var(--navy); color:#dfe7ee; padding:88px 0; }
        .closer h2 { color:#fff; font-size:clamp(26px,3.4vw,40px); font-weight:800; max-width:720px; margin:0 auto; letter-spacing:-.02em; }
        .closer p { color:#a9b8c4; max-width:600px; margin:18px auto 30px; font-size:17px; }

        @media (max-width: 920px) {
          .hero-grid { grid-template-columns:1fr; gap:38px; }
          .cols-3, .steps, .hidden-grid { grid-template-columns:1fr; }
          .grid-2 { grid-template-columns:1fr; }
          .sec { padding:64px 0; }
        }
      `}</style>
    </div>
  );
}
