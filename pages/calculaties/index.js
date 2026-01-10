'use client';
import { useState } from 'react';

export default function CalculatiesPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

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
    phone: ''
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

  async function request(path, body) {
    setError('');
    setStatus('');

    const response = await fetch(`${backendUrl}${path}`, {
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
      const payload = await request('/api/customer/create', customer);
      setProjectId(payload.project_id);
      setStatus('Klant aangemaakt');
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
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStartAnalysis() {
    try {
      const payload = await request('/api/analysis/start', { project_id: projectId });
      setAnalysisStarted(true);
      setStatus(`Analyse gestart (${payload.task_id})`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirmStabu() {
    try {
      await request('/api/stabu/confirm', { project_id: projectId });
      setStabuConfirmed(true);
      setStatus('STABU bevestigd');
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
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRiskAnalysis() {
    try {
      const payload = await request('/api/risk/analyse', { project_id: projectId });
      setStatus(`Risico analyse gestart (${payload.task_id})`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePlanning() {
    try {
      const payload = await request('/api/planning/generate', { project_id: projectId });
      setStatus(`Termijnschema gestart (${payload.task_id})`);
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

      const response = await fetch(`${backendUrl}/api/files/upload`, {
        method: 'POST',
        body: formData
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'UPLOAD_FAILED');
      }

      setFilesUploaded(true);
      setStatus('Bestanden geupload');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  const canCreateProject = projectId && project.name && projectType && budgetType;
  const canSaveSettings = projectId && projectType && budgetType;
  const canUploadFiles = projectId && selectedFiles.length > 0 && !isUploading;
  const canStartAnalysis = projectId && filesUploaded;
  const canConfirmStabu = projectId && analysisStarted;
  const canStartCalculation = projectId && stabuConfirmed;
  const canPlan = projectId;
  const canOffer = projectId;
  const canDownloadPdf = projectId && pdfUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">SterkCalc Calculatie Flow</h1>
          <p className="text-slate-600">Alle acties zijn expliciet en starten alleen via knoppen.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {status && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {status}
          </div>
        )}

        <div className="grid gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">1. Klant aanmaken</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input className="rounded border border-slate-300 px-3 py-2" placeholder="Naam opdrachtgever" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
              <input className="rounded border border-slate-300 px-3 py-2" placeholder="E-mail" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
              <input className="rounded border border-slate-300 px-3 py-2" placeholder="Telefoon" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
              <input className="rounded border border-slate-300 px-3 py-2" placeholder="Adres" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
              <input className="rounded border border-slate-300 px-3 py-2" placeholder="Postcode" value={customer.postcode} onChange={(e) => setCustomer({ ...customer, postcode: e.target.value })} />
              <input className="rounded border border-slate-300 px-3 py-2" placeholder="Plaats" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} />
            </div>
            <button className="mt-4 rounded bg-slate-900 px-4 py-2 text-white" onClick={handleCreateCustomer}>Klant aanmaken</button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">2. Maak project aan</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input className="rounded border border-slate-300 px-3 py-2" placeholder="Project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
              <input className="rounded border border-slate-300 px-3 py-2" placeholder="Projectnaam" value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} />
            </div>
            <button className="mt-4 rounded bg-slate-900 px-4 py-2 text-white" onClick={handleCreateProject} disabled={!canCreateProject}>Maak project aan</button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">3. Projectinstellingen</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <select className="rounded border border-slate-300 px-3 py-2" value={projectType} onChange={(e) => handleProjectTypeChange(e.target.value)}>
                <option value="">Projecttype</option>
                <option value="Nieuwbouw">Nieuwbouw</option>
                <option value="Transformatie">Transformatie</option>
                <option value="Uitbreiding">Uitbreiding</option>
                <option value="Verduurzaming">Verduurzaming</option>
              </select>
              <select className="rounded border border-slate-300 px-3 py-2" value={budgetType} onChange={(e) => handleBudgetTypeChange(e.target.value)}>
                <option value="">Soort begroting</option>
                <option value="Open begroting">Open begroting</option>
                <option value="Gesloten begroting">Gesloten begroting</option>
              </select>
              <input className="rounded border border-slate-300 px-3 py-2" placeholder="Scenario naam" value={settings.scenario_name} onChange={(e) => setSettings({ ...settings, scenario_name: e.target.value })} />
              <input className="rounded border border-slate-300 px-3 py-2" placeholder="Fixed price" value={settings.fixed_price} onChange={(e) => setSettings({ ...settings, fixed_price: e.target.value })} />
            </div>
            <button className="mt-4 rounded bg-slate-900 px-4 py-2 text-white" onClick={handleSaveSettings} disabled={!canSaveSettings}>Projectinstellingen opslaan</button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">4. Upload bestanden</h2>
            <div className="mt-4 grid gap-3">
              <input type="file" multiple onChange={handleFileChange} />
              <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={handleUploadFiles} disabled={!canUploadFiles}>{isUploading ? 'Uploaden...' : 'Upload bestanden'}</button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">5. Haal data op</h2>
            <button className="mt-2 rounded bg-slate-900 px-4 py-2 text-white" onClick={handleStartAnalysis} disabled={!canStartAnalysis}>Haal data op</button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">6. OK per STABU hoofdstuk / subhoofdstuk</h2>
            <button className="mt-2 rounded bg-slate-900 px-4 py-2 text-white" onClick={handleConfirmStabu} disabled={!canConfirmStabu}>STABU bevestigen</button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">7. Start calculatie</h2>
            <button className="mt-2 rounded bg-slate-900 px-4 py-2 text-white" onClick={handleRunCalculation} disabled={!canStartCalculation}>Start calculatie</button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">8. Risico analyse</h2>
            <button className="mt-2 rounded bg-slate-900 px-4 py-2 text-white" onClick={handleRiskAnalysis} disabled={!projectId}>Risico analyse</button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">9. Maak planning</h2>
            <button className="mt-2 rounded bg-slate-900 px-4 py-2 text-white" onClick={handlePlanning} disabled={!canPlan}>Maak planning</button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">10. Deel calculatie</h2>
            <input className="mt-3 w-full rounded border border-slate-300 px-3 py-2" placeholder="Split request" value={splitRequest} onChange={(e) => setSplitRequest(e.target.value)} />
            <button className="mt-3 rounded bg-slate-900 px-4 py-2 text-white" onClick={handleSplitCalculation} disabled={!projectId || !splitRequest}>Deel calculatie</button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">11. Fixed price toepassen</h2>
            <button className="mt-2 rounded bg-slate-900 px-4 py-2 text-white" onClick={handleFixedPrice} disabled={!projectId || !settings.fixed_price}>Fixed price toepassen</button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">12. Maak offerte</h2>
            <button className="mt-2 rounded bg-slate-900 px-4 py-2 text-white" onClick={handleOfferGenerate} disabled={!canOffer}>Maak offerte</button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">13. Download PDF</h2>
            {pdfUrl && <p className="mt-2 text-sm text-slate-600">{pdfUrl}</p>}
            <button className="mt-2 rounded bg-slate-900 px-4 py-2 text-white" onClick={handleDownloadPdf} disabled={!canDownloadPdf}>Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
