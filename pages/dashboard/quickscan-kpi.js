// pages/dashboard/quickscan-kpi.js
// STRKBOUW Quickscan KPI-dashboard (intern). Toont funnel + omzet uit v_quickscan_kpi.
import { useEffect, useState } from 'react';
import Head from 'next/head';

const euro = (n) => (n == null ? '—' : `€ ${Number(n).toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`);
const pct = (n) => (n == null ? '—' : `${Number(n).toLocaleString('nl-NL')}%`);
const num = (n) => (n == null ? '0' : Number(n).toLocaleString('nl-NL'));

const STATUS_LABEL = {
  new: 'Nieuw', quickscan_sent: 'Quickscan verstuurd', call: 'Gesprek',
  quote: 'Offerte', won: 'Opdracht', lost: 'Verloren',
};

export default function QuickscanKpi() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetch('/api/quickscan/kpi')
      .then((r) => r.json())
      .then((j) => (j.error ? setErr(j.error) : setData(j)))
      .catch((e) => setErr(String(e?.message || e)));
  }, []);

  const k = data?.kpi || {};
  const funnel = [
    { label: 'Bezoekers', value: num(k.visitors), sub: `${num(k.visitors_30d)} laatste 30d` },
    { label: 'Leads', value: num(k.leads), sub: `${num(k.leads_30d)} laatste 30d` },
    { label: 'Quickscans', value: num(k.quickscans) },
    { label: 'Gesprekken', value: num(k.gesprekken) },
    { label: 'Offertes', value: num(k.offertes) },
    { label: 'Opdrachten', value: num(k.opdrachten) },
  ];
  const money = [
    { label: 'Omzet', value: euro(k.omzet_eur) },
    { label: 'Ad-spend', value: euro(k.spend_eur), sub: `${euro(k.spend_30d_eur)} laatste 30d` },
    { label: 'Cost per lead', value: euro(k.cost_per_lead_eur), sub: `${euro(k.cost_per_lead_30d_eur)} (30d)` },
    { label: 'Bezoeker → lead', value: pct(k.visitor_naar_lead_pct) },
    { label: 'Lead → opdracht', value: pct(k.lead_naar_opdracht_pct) },
  ];

  return (
    <div className="qkpi">
      <Head><title>Quickscan KPI — STRKBOUW</title></Head>
      <header className="head">
        <div>
          <h1>Bouwkosten Quickscan — KPI</h1>
          <p>Funnel, conversie en omzet van de leadmachine. Bron: <code>v_quickscan_kpi</code>.</p>
        </div>
        <a className="link" href="/bouwkosten-quickscan" target="_blank" rel="noreferrer">Landingspagina ↗</a>
      </header>

      {err && <div className="err">Kon KPI niet laden: {err}</div>}
      {!data && !err && <div className="loading">Laden…</div>}

      {data && (
        <>
          <h2 className="sub">Funnel</h2>
          <div className="cards">
            {funnel.map((c, i) => (
              <div className="card" key={c.label}>
                <span className="c-label">{c.label}</span>
                <span className="c-value">{c.value}</span>
                {c.sub && <span className="c-sub">{c.sub}</span>}
                {i < funnel.length - 1 && <span className="c-arrow" aria-hidden>→</span>}
              </div>
            ))}
          </div>

          <h2 className="sub">Geld & conversie</h2>
          <div className="cards cards-money">
            {money.map((c) => (
              <div className="card" key={c.label}>
                <span className="c-label">{c.label}</span>
                <span className="c-value">{c.value}</span>
                {c.sub && <span className="c-sub">{c.sub}</span>}
              </div>
            ))}
          </div>

          <h2 className="sub">Recente leads</h2>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Datum</th><th>Naam</th><th>E-mail</th><th>Project</th><th>Status</th><th>Waarde</th><th>Bron</th></tr></thead>
              <tbody>
                {data.leads.length === 0 && <tr><td colSpan={7} className="empty">Nog geen leads — zodra het formulier binnenkomt verschijnt hier de eerste.</td></tr>}
                {data.leads.map((l) => (
                  <tr key={l.id}>
                    <td>{new Date(l.created_at).toLocaleDateString('nl-NL')}</td>
                    <td>{l.naam}</td>
                    <td>{l.email}</td>
                    <td>{l.projectadres || '—'}</td>
                    <td><span className={`pill pill-${l.status}`}>{STATUS_LABEL[l.status] || l.status}</span></td>
                    <td>{l.waarde_eur ? euro(l.waarde_eur) : '—'}</td>
                    <td>{l.bron}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style jsx>{`
        .qkpi { font-family: Inter, system-ui, sans-serif; color:#16222f; padding:28px; max-width:1180px; margin:0 auto; }
        .qkpi *, .qkpi *::before, .qkpi *::after { box-sizing:border-box; }
        .head { display:flex; justify-content:space-between; align-items:flex-start; gap:20px; margin-bottom:26px; }
        .head h1 { font-size:26px; font-weight:800; margin:0 0 6px; letter-spacing:-.02em; }
        .head p { margin:0; color:#5a6b7a; font-size:14px; }
        .head code { background:#eef1f4; padding:1px 6px; border-radius:5px; font-size:12.5px; }
        .link { color:#b08c39; font-weight:650; text-decoration:none; font-size:14px; white-space:nowrap; }
        .err { background:#fdecea; color:#cf4b3a; border:1px solid #f5c6c0; border-radius:10px; padding:14px; }
        .loading { color:#5a6b7a; padding:20px 0; }
        .sub { font-size:13px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#90a0ad; margin:30px 0 14px; }
        .cards { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; }
        .cards-money { grid-template-columns:repeat(5,1fr); }
        .card { position:relative; background:#fff; border:1px solid #e5e9ee; border-radius:13px; padding:18px; display:flex; flex-direction:column; gap:5px; }
        .c-label { font-size:12.5px; color:#5a6b7a; font-weight:600; }
        .c-value { font-size:24px; font-weight:800; letter-spacing:-.02em; color:#0D1B2A; }
        .c-sub { font-size:11.5px; color:#90a0ad; }
        .c-arrow { position:absolute; right:-10px; top:50%; transform:translateY(-50%); color:#cbd4dc; font-size:18px; z-index:1; }
        .tbl-wrap { overflow-x:auto; border:1px solid #e5e9ee; border-radius:13px; }
        .tbl { width:100%; border-collapse:collapse; font-size:13.5px; background:#fff; }
        .tbl th { text-align:left; padding:12px 14px; background:#f6f8fa; color:#5a6b7a; font-weight:650; border-bottom:1px solid #e5e9ee; white-space:nowrap; }
        .tbl td { padding:12px 14px; border-bottom:1px solid #eef1f4; }
        .empty { text-align:center; color:#90a0ad; padding:26px; }
        .pill { font-size:12px; font-weight:650; padding:3px 9px; border-radius:20px; background:#eef1f4; color:#41525f; }
        .pill-won { background:#e3f5ec; color:#1f9d6b; }
        .pill-lost { background:#fdecea; color:#cf4b3a; }
        .pill-quote, .pill-call { background:#fbf2dd; color:#b08c39; }
        @media (max-width: 900px) { .cards, .cards-money { grid-template-columns:repeat(2,1fr); } .c-arrow { display:none; } }
      `}</style>
    </div>
  );
}
