'use client';
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_ROUTE = process.env.NEXT_PUBLIC_API_ROUTE;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

if (!API_ROUTE) {
  throw new Error('NEXT_PUBLIC_API_ROUTE is not defined');
}


export default function CalculatiesPage() {

  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const [customer, setCustomer] = useState({
    name: '',
    address: '',
    postcode: '',
    city: '',
    email: '',
    phone: '',
    billing_name: '',
    billing_address: '',
    billing_postcode: '',
    billing_city: '',
    billing_email: '',
    billing_phone: ''
  });

  const [project, setProject] = useState({
    name: ''
  });

  const [settings, setSettings] = useState({
    scenario_name: '',
    calculation_type: '',
    calculation_level: '',
    fixed_price: ''
  });

  const [splitRequest, setSplitRequest] = useState('');
  const [projectType, setProjectType] = useState('');
  const [budgetType, setBudgetType] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [stabuConfirmed, setStabuConfirmed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [overheads, setOverheads] = useState({
    ak: '',
    abk: '',
    risk: '',
    profit: '',
    opslag_plus: '',
    opslag_min: ''
  });
  const [termijnType, setTermijnType] = useState('');

  async function request(path, body) {
    setError('');
    setStatus('');

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'REQUEST_FAILED');
    }

    return payload;
  }

  async function handleCreateCustomer() {
  try {
    const payload = await request('/api/projects/create', {
      type: 'create_project',
      customer: customer
    });

    setProjectId(payload.project_id);
    setStatus('Klant aangemaakt');
    setCurrentStep(2);
  } catch (err) {
    setError(err.message);
  }
}


  async function handleCreateProject() {
    try {
      const payload = await request('/api/project/create', {
        project_id: projectId,
        name: project.name,
        project_type: projectType
      });
      setProjectId(payload.project_id);
      setStatus('Project aangemaakt');
      setCurrentStep(3);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveSettings() {
    try {
      const payload = await request('/api/project/settings', {
        project_id: projectId,
        scenario_name: project.name || settings.scenario_name,
        calculation_type: projectType,
        calculation_level: budgetType,
        fixed_price: settings.fixed_price || null
      });
      setStatus(`Instellingen opgeslagen (${payload.calculation_type})`);
      setCurrentStep(4);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStartAnalysis() {
    try {
      const payload = await request('/api/analysis/start', { project_id: projectId });
      setAnalysisStarted(true);
      setStatus(`Analyse gestart (${payload.task_id})`);
      setCurrentStep(5);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirmStabu() {
    try {
      await request('/api/stabu/confirm', { project_id: projectId });
      setStabuConfirmed(true);
      setStatus('STABU bevestigd');
      setCurrentStep(7);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRunCalculation() {
    try {
      const payload = await request('/api/calculation/run', {
        project_id: projectId,
        scenario_name: project.name || settings.scenario_name,
        calculation_type: projectType,
        calculation_level: budgetType,
        fixed_price: settings.fixed_price || null
      });
      setStatus(`Calculatie gestart (${payload.task_id})`);
      setCurrentStep(7);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRiskAnalysis() {
    try {
      const payload = await request('/api/risk/analyse', { project_id: projectId });
      setStatus(`Risico analyse gestart (${payload.task_id})`);
      setCurrentStep(7);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePlanning() {
    try {
      const payload = await request('/api/planning/generate', { project_id: projectId });
      setStatus(`Termijnschema gestart (${payload.task_id})`);
      setCurrentStep(7);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSplitCalculation() {
    try {
      await request('/api/calculation/split', {
        project_id: projectId,
        split_request: splitRequest
      });
      setStatus('Calculatie split opgeslagen');
      setCurrentStep(7);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleFixedPrice() {
    try {
      const payload = await request('/api/calculation/fixed-price', {
        project_id: projectId,
        fixed_price: settings.fixed_price
      });
      setStatus(`Fixed price toegepast (${payload.run_id})`);
      setCurrentStep(7);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleOfferGenerate() {
    try {
      const payload = await request('/api/offer/generate', { project_id: projectId });
      if (payload.pdf_url) {
        setPdfUrl(payload.pdf_url);
      }
      setStatus(`Offerte taak gestart (${payload.task_id || 'ready'})`);
      setCurrentStep(7);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDownloadPdf() {
    try {
      const payload = await request('/api/offer/generate', { project_id: projectId });
      if (!payload.pdf_url) {
        setError('PDF is nog niet beschikbaar');
        return;
      }
      setPdfUrl(payload.pdf_url);
      window.open(payload.pdf_url, '_blank');
      setCurrentStep(7);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleProjectTypeChange(value) {
    setProjectType(value);
    setSettings({ ...settings, calculation_type: value });
  }

  function handleBudgetTypeChange(value) {
    setBudgetType(value);
    setSettings({ ...settings, calculation_level: value });
  }

  function handleFileChange(event) {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setFilesUploaded(false);
  }

  async function handleUploadFiles() {
    if (!projectId || selectedFiles.length === 0) {
      setError('Selecteer bestanden en een project');
      return;
    }

    setError('');
    setStatus('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      selectedFiles.forEach((file) => {
        formData.append('files[]', file);
      });

      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        body: formData
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'UPLOAD_FAILED');
      }

      setFilesUploaded(true);
      setStatus('Bestanden geupload');
      setCurrentStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  const canSaveSettings = projectId && projectType && budgetType && overheads.ak && overheads.abk && overheads.risk && overheads.profit && overheads.opslag_plus && overheads.opslag_min;
  const canStartAnalysis = projectId;
  const canConfirmStabu = projectId && analysisStarted;
  const canStartCalculation = projectId && stabuConfirmed;
  const canDownloadPdf = projectId && pdfUrl;

  function getStepClasses(step) {
  if (step === 2) {
    return 'rounded-xl border border-slate-200 bg-white p-6';
  }
  return `rounded-xl border p-6 transition ${
    currentStep === step
      ? 'border-slate-900 bg-slate-50 shadow-sm'
      : 'border-slate-200 bg-white'
  }`;
}



  function getStepNumberClasses(step) {
    return `flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
      currentStep === step ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
    }`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">SterkCalc Calculatie Flow</h1>
          <p className="text-slate-600">Alle acties zijn expliciet en starten alleen via knoppen.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {status && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {status}
          </div>
        )}

        <div className="flex flex-col gap-6">
          <section className={getStepClasses(1)}>
            <div className="flex items-start gap-4">
              <div className={getStepNumberClasses(1)}>1</div>
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">Stap 1 - Klant aanmaken</h2>
                  <p className="text-sm text-slate-600">NAW- en facturatiegegevens.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Naam opdrachtgever" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="E-mail" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Telefoon" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Adres" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Postcode" value={customer.postcode} onChange={(e) => setCustomer({ ...customer, postcode: e.target.value })} />
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Plaats" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} />
                </div>
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <h3 className="text-base font-semibold text-slate-900">Facturatiegegevens</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Naam facturatie" value={customer.billing_name} onChange={(e) => setCustomer({ ...customer, billing_name: e.target.value })} />
                    <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Facturatie e-mail" value={customer.billing_email} onChange={(e) => setCustomer({ ...customer, billing_email: e.target.value })} />
                    <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Facturatie telefoon" value={customer.billing_phone} onChange={(e) => setCustomer({ ...customer, billing_phone: e.target.value })} />
                    <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Facturatie adres" value={customer.billing_address} onChange={(e) => setCustomer({ ...customer, billing_address: e.target.value })} />
                    <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Facturatie postcode" value={customer.billing_postcode} onChange={(e) => setCustomer({ ...customer, billing_postcode: e.target.value })} />
                    <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Facturatie plaats" value={customer.billing_city} onChange={(e) => setCustomer({ ...customer, billing_city: e.target.value })} />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="rounded bg-slate-900 px-5 py-2.5 text-white" onClick={handleCreateCustomer}>Klant aanmaken</button>
                </div>
              </div>
            </div>
          </section>

          <section className={getStepClasses(2)}>
            <div className="flex items-start gap-4">
              <div className={getStepNumberClasses(2)}>2</div>
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">Stap 2 - Project aangemaakt</h2>
                  <p className="text-sm text-slate-600">Projectnummer en projectnaam zijn automatisch toegekend.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="h-11 w-full rounded border border-slate-300 bg-slate-100 px-3" value={projectId} readOnly />
                  <input className="h-11 w-full rounded border border-slate-300 bg-slate-100 px-3" value={project.name} readOnly />
                </div>
              </div>
            </div>
          </section>

          <section className={getStepClasses(3)}>
            <div className="flex items-start gap-4">
              <div className={getStepNumberClasses(3)}>3</div>
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">Stap 3 - Calculatie instellingen</h2>
                  <p className="text-sm text-slate-600">Projecttype, begroting en opslagen.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <select className="h-11 w-full rounded border border-slate-300 px-3" value={projectType} onChange={(e) => handleProjectTypeChange(e.target.value)}>
                    <option value="">Projecttype</option>
                    <option value="Nieuwbouw">Nieuwbouw</option>
                    <option value="Transformatie">Transformatie</option>
                    <option value="Uitbreiding">Uitbreiding</option>
                    <option value="Verduurzaming">Verduurzaming</option>
                  </select>
                  <select className="h-11 w-full rounded border border-slate-300 px-3" value={budgetType} onChange={(e) => handleBudgetTypeChange(e.target.value)}>
                    <option value="">Soort begroting</option>
                    <option value="Open begroting">Open begroting</option>
                    <option value="Gesloten begroting">Gesloten begroting (alleen totalen)</option>
                  </select>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="A.K" value={overheads.ak} onChange={(e) => setOverheads({ ...overheads, ak: e.target.value })} />
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="A.B.K" value={overheads.abk} onChange={(e) => setOverheads({ ...overheads, abk: e.target.value })} />
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Risico" value={overheads.risk} onChange={(e) => setOverheads({ ...overheads, risk: e.target.value })} />
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Winst" value={overheads.profit} onChange={(e) => setOverheads({ ...overheads, profit: e.target.value })} />
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Opslag (+)" value={overheads.opslag_plus} onChange={(e) => setOverheads({ ...overheads, opslag_plus: e.target.value })} />
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Opslag (-)" value={overheads.opslag_min} onChange={(e) => setOverheads({ ...overheads, opslag_min: e.target.value })} />
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="rounded bg-slate-900 px-5 py-2.5 text-white" onClick={handleSaveSettings} disabled={!canSaveSettings}>Instellingen opslaan</button>
                </div>
              </div>
            </div>
          </section>

          <section className={getStepClasses(4)}>
            <div className="flex items-start gap-4">
              <div className={getStepNumberClasses(4)}>4</div>
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">Stap 4 - Haal data op</h2>
                  <p className="text-sm text-slate-600">AI genereert de STABU-structuur.</p>
                </div>
                <div className="mb-4 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-3 gap-0 border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                    <div className="px-3 py-2">Appartement / woning</div>
                    <div className="px-3 py-2">Ruimte</div>
                    <div className="px-3 py-2">Elementnummer</div>
                  </div>
                  <div className="px-3 py-4 text-sm text-slate-500">Nog geen regels beschikbaar.</div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="rounded bg-slate-900 px-5 py-2.5 text-white" onClick={handleStartAnalysis} disabled={!canStartAnalysis}>Haal data op</button>
                </div>
              </div>
            </div>
          </section>

          <section className={getStepClasses(5)}>
            <div className="flex items-start gap-4">
              <div className={getStepNumberClasses(5)}>5</div>
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">Stap 5 - Calculatie regels</h2>
                  <p className="text-sm text-slate-600">STABU-hoofdstukken met dynamische regels.</p>
                </div>
                <div className="rounded-lg border border-slate-200">
                  <div className="grid grid-cols-10 gap-0 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
                    <div className="px-2 py-2">Code</div>
                    <div className="px-2 py-2">Omschrijving</div>
                    <div className="px-2 py-2">Aantal</div>
                    <div className="px-2 py-2">Eenheid</div>
                    <div className="px-2 py-2">Norm</div>
                    <div className="px-2 py-2">Uren</div>
                    <div className="px-2 py-2">Loonkosten</div>
                    <div className="px-2 py-2">Materiaal</div>
                    <div className="px-2 py-2">Stelpost</div>
                    <div className="px-2 py-2">Totaal</div>
                  </div>
                  <div className="px-3 py-4 text-sm text-slate-500">Nog geen calculatieregels beschikbaar.</div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="rounded bg-slate-900 px-5 py-2.5 text-white" onClick={handleConfirmStabu} disabled={!canConfirmStabu}>OK per STABU hoofdstuk</button>
                </div>
              </div>
            </div>
          </section>

          <section className={getStepClasses(6)}>
            <div className="flex items-start gap-4">
              <div className={getStepNumberClasses(6)}>6</div>
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">Stap 6 - Staartblad / Totalen</h2>
                  <p className="text-sm text-slate-600">Kostprijs, opslagen en totalen.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="flex justify-between text-sm">
                      <span>Kostprijs</span>
                      <span>€ 0,00</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span>Opslagen (A.K / A.B.K / Risico / Winst / CAR)</span>
                      <span>€ 0,00</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span>Subtotaal</span>
                      <span>€ 0,00</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="flex justify-between text-sm">
                      <span>BTW 21%</span>
                      <span>€ 0,00</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span>BTW 9%</span>
                      <span>€ 0,00</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm font-semibold">
                      <span>Totaal incl. BTW</span>
                      <span>€ 0,00</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="rounded bg-slate-900 px-5 py-2.5 text-white" onClick={handleRunCalculation} disabled={!canStartCalculation}>Start calculatie</button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Actieknoppen</h2>
              <p className="text-sm text-slate-600">Optionele acties na de calculatie.</p>
            </div>
            <div className="grid gap-6">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">Download PDF</h3>
                <p className="mt-1 text-sm text-slate-600">Download de volledige calculatie.</p>
                <div className="mt-4 flex justify-end">
                  <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={handleDownloadPdf} disabled={!canDownloadPdf}>Download PDF</button>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">Maak planning</h3>
                <p className="mt-1 text-sm text-slate-600">Kies een termijnmodel en genereer een planning.</p>
                <div className="mt-3">
                  <select className="h-11 w-full rounded border border-slate-300 px-3" value={termijnType} onChange={(e) => setTermijnType(e.target.value)}>
                    <option value="">Termijnen</option>
                    <option value="Afbouwborg">Afbouwborg</option>
                    <option value="BouwGarant">BouwGarant</option>
                    <option value="Woningborg">Woningborg</option>
                    <option value="Geen">Geen</option>
                  </select>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={handlePlanning} disabled={!projectId}>Maak termijnschema</button>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">Risico analyse</h3>
                <p className="mt-1 text-sm text-slate-600">Analyseer projectrisico's.</p>
                <div className="mt-4 flex justify-end">
                  <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={handleRiskAnalysis} disabled={!projectId}>Risico analyse</button>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">Deel calculatie op</h3>
                <p className="mt-1 text-sm text-slate-600">Splits de calculatie in delen.</p>
                <div className="mt-3">
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Split request" value={splitRequest} onChange={(e) => setSplitRequest(e.target.value)} />
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={handleSplitCalculation} disabled={!projectId || !splitRequest}>Deel calculatie op</button>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">Fixed price</h3>
                <p className="mt-1 text-sm text-slate-600">Herbereken op inkoopniveau met fixed price.</p>
                <div className="mt-3">
                  <input className="h-11 w-full rounded border border-slate-300 px-3" placeholder="Fixed price" value={settings.fixed_price} onChange={(e) => setSettings({ ...settings, fixed_price: e.target.value })} />
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={handleFixedPrice} disabled={!projectId || !settings.fixed_price}>Fixed price toepassen</button>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-base font-semibold text-slate-900">Maak offerte</h3>
                <p className="mt-1 text-sm text-slate-600">Genereer offerte met 2jours voorblad en open begroting.</p>
                <div className="mt-4 flex justify-end">
                  <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={handleOfferGenerate} disabled={!projectId}>Maak offerte</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
