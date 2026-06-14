// pages/calculaties/instellingen.js — Globale instellingen (bron van defaults per nieuwe calculatie)
import { useEffect, useState } from 'react';
import { Loader2, Settings, Lock, Save } from 'lucide-react';
import { loadSettings, saveSettings } from '@/services/calcModules';

export default function Instellingen() {
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadSettings().then((d) => setS(d || {})).finally(() => setLoading(false)); }, []);
  const upd = (groep, key, val) => setS((cur) => ({ ...cur, [groep]: { ...(cur[groep] || {}), [key]: val } }));
  const bewaar = async () => { await saveSettings({ bedrijf: s.bedrijf, branding: s.branding, calculatie_defaults: s.calculatie_defaults, ai: s.ai, werktafel: s.werktafel, combi: s.combi }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;
  const cd = s.calculatie_defaults || {}, ai = s.ai || {}, wt = s.werktafel || {}, cb = s.combi || {}, bd = s.bedrijf || {};

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><Settings size={20} className="text-sterkcalc-blue" /> Instellingen</h1>
          <p className="text-sm text-gray-500">Globale defaults — worden gekopieerd naar elke nieuwe calculatie.</p>
        </div>
        <button onClick={bewaar} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-4 py-2 text-sm font-medium text-white hover:bg-sterkcalc-navy2">
          <Save size={15} /> {saved ? 'Opgeslagen' : 'Opslaan'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Kaart titel="Bedrijfsgegevens">
          <Veld label="Bedrijfsnaam"><input value={bd.naam || ''} onChange={(e) => upd('bedrijf', 'naam', e.target.value)} className={inp} /></Veld>
          <Veld label="KvK"><input value={bd.kvk || ''} onChange={(e) => upd('bedrijf', 'kvk', e.target.value)} className={inp} /></Veld>
          <Veld label="BTW"><input value={bd.btw || ''} onChange={(e) => upd('bedrijf', 'btw', e.target.value)} className={inp} /></Veld>
          <Veld label="Adres"><input value={bd.adres || ''} onChange={(e) => upd('bedrijf', 'adres', e.target.value)} className={inp} /></Veld>
        </Kaart>

        <Kaart titel="Calculatie-defaults">
          <div className="grid grid-cols-3 gap-2">
            {['ak', 'abk', 'risico', 'winst', 'btw'].map((k) => (
              <Veld key={k} label={`${k.toUpperCase()} %`}><input type="number" step="0.5" value={cd[k] ?? 0} onChange={(e) => upd('calculatie_defaults', k, Number(e.target.value))} className={inp} /></Veld>
            ))}
            <Veld label="Regiofactor"><input type="number" step="0.01" value={cd.regiofactor ?? 1} onChange={(e) => upd('calculatie_defaults', 'regiofactor', Number(e.target.value))} className={inp} /></Veld>
          </div>
        </Kaart>

        <Kaart titel="AI-gedrag">
          <Toggle label="Mag voorstellen doen" checked={ai.mag_voorstellen !== false} onChange={(v) => upd('ai', 'mag_voorstellen', v)} />
          <ToggleLocked label="Mag AK wijzigen" />
          <ToggleLocked label="Mag ABK wijzigen" />
          <ToggleLocked label="Mag Winst wijzigen" />
          <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400"><Lock size={11} /> AK/ABK/risico/winst zijn altijd vergrendeld voor AI.</p>
        </Kaart>

        <Kaart titel="Werktafel & combi">
          <Toggle label="Autosave" checked={wt.autosave !== false} onChange={(v) => upd('werktafel', 'autosave', v)} />
          <Veld label="Versies bewaren"><input type="number" value={wt.versies_bewaren ?? 100} onChange={(e) => upd('werktafel', 'versies_bewaren', Number(e.target.value))} className={inp} /></Veld>
          <Toggle label="Combi automatisch uitklappen" checked={cb.auto_uitklappen !== false} onChange={(v) => upd('combi', 'auto_uitklappen', v)} />
          <Toggle label="Relatie-engine" checked={cb.relatie_engine !== false} onChange={(v) => upd('combi', 'relatie_engine', v)} />
        </Kaart>
      </div>
    </div>
  );
}
const inp = 'w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-sterkcalc-blue';
function Kaart({ titel, children }) { return <div className="rounded-xl border border-gray-200 bg-white p-4"><div className="mb-2 text-sm font-semibold text-gray-900">{titel}</div><div className="space-y-2">{children}</div></div>; }
function Veld({ label, children }) { return <label className="block"><span className="mb-0.5 block text-[11px] text-gray-500">{label}</span>{children}</label>; }
function Toggle({ label, checked, onChange }) { return <label className="flex items-center justify-between text-sm text-gray-700"><span>{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /></label>; }
function ToggleLocked({ label }) { return <label className="flex items-center justify-between text-sm text-gray-400"><span>{label}</span><input type="checkbox" checked={false} disabled /></label>; }
