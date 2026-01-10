'use client';
import { useState } from 'react';

export default function CalculatiesPage() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

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
  });

  const [project, setProject] = useState({ name: '' });

  const [settings, setSettings] = useState({
    calculation_type: '',
    calculation_level: '',
    fixed_price: '',
  });

  const [projectType, setProjectType] = useState('');
  const [budgetType, setBudgetType] = useState('');
  const [splitRequest, setSplitRequest] = useState('');

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [stabuConfirmed, setStabuConfirmed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  async function request(path, body) {
    setError('');
    setStatus('');

    const response = await fetch(`${backendUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
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
      setStatus('Klant aangemaakt, project automatisch gestart');
      setCurrentStep(3);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveSettings() {
    try {
      const payload = await request('/api/project/settings', {
        project_id: projectId,
        calculation_type: projectType,
        calculation_level: budgetType,
        fixed_price: settings.fixed_price || null,
      });
      setStatus(`Instellingen opgeslagen (${payload.calculation_type})`);
      setCurrentStep(4);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUploadFiles() {
    if (!projectId || selectedFiles.length === 0) {
      setError('Selecteer eerst bestanden');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      selectedFiles.forEach((file) =>
        formData.append('files[]', file)
      );

      const response = await fetch(`${backendUrl}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'UPLOAD_FAILED');

      setFilesUploaded(true);
      setStatus('Bestanden succesvol geüpload');
      setCurrentStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleStartAnalysis() {
    try {
      const payload = await request('/api/analysis/start', {
        project_id: projectId,
      });
      setAnalysisStarted(true);
      setStatus(`Analyse gestart (${payload.task_id})`);
      setCurrentStep(6);
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
        calculation_type: projectType,
        calculation_level: budgetType,
        fixed_price: settings.fixed_price || null,
      });
      setStatus(`Calculatie gestart (${payload.task_id})`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSplitCalculation() {
    try {
      await request('/api/calculation/split', {
        project_id: projectId,
        split_request: splitRequest,
      });
      setStatus('Calculatie gesplitst');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRiskAnalysis() {
    try {
      const payload = await request('/api/risk/analyse', {
        project_id: projectId,
      });
      setStatus(`Risicoanalyse gestart (${payload.task_id})`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePlanning() {
    try {
      const payload = await request('/api/planning/generate', {
        project_id: projectId,
      });
      setStatus(`Planning gestart (${payload.task_id})`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleOfferGenerate() {
    try {
      const payload = await request('/api/offer/generate', {
        project_id: projectId,
      });
      if (payload.pdf_url) setPdfUrl(payload.pdf_url);
      setStatus('Offerte gegenereerd');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDownloadPdf() {
    if (!pdfUrl) {
      setError('PDF nog niet beschikbaar');
      return;
    }
    window.open(pdfUrl, '_blank');
  }

  function handleProjectTypeChange(v) {
    setProjectType(v);
    setSettings({ ...settings, calculation_type: v });
  }

  function handleBudgetTypeChange(v) {
    setBudgetType(v);
    setSettings({ ...settings, calculation_level: v });
  }

  function handleFileChange(e) {
    setSelectedFiles(Array.from(e.target.files || []));
    setFilesUploaded(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">
          SterkCalc – Calculatie Flow
        </h1>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-800">
            {error}
          </div>
        )}

        {status && (
          <div className="mb-4 rounded border border-emerald-300 bg-emerald-50 p-3 text-emerald-800">
            {status}
          </div>
        )}

        {/* Stap 1 */}
        <section className="mb-6 rounded border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Stap 1 – Klant</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="border p-2" placeholder="Naam" value={customer.name} onChange={(e)=>setCustomer({...customer,name:e.target.value})}/>
            <input className="border p-2" placeholder="Email" value={customer.email} onChange={(e)=>setCustomer({...customer,email:e.target.value})}/>
            <input className="border p-2" placeholder="Telefoon" value={customer.phone} onChange={(e)=>setCustomer({...customer,phone:e.target.value})}/>
            <input className="border p-2" placeholder="Adres" value={customer.address} onChange={(e)=>setCustomer({...customer,address:e.target.value})}/>
            <input className="border p-2" placeholder="Postcode" value={customer.postcode} onChange={(e)=>setCustomer({...customer,postcode:e.target.value})}/>
            <input className="border p-2" placeholder="Plaats" value={customer.city} onChange={(e)=>setCustomer({...customer,city:e.target.value})}/>
          </div>
          <button className="mt-4 bg-black px-4 py-2 text-white" onClick={handleCreateCustomer}>
            Klant aanmaken
          </button>
        </section>

        {/* Stap 3 */}
        <section className="mb-6 rounded border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Stap 3 – Projectinstellingen</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <select className="border p-2" value={projectType} onChange={(e)=>handleProjectTypeChange(e.target.value)}>
              <option value="">Projecttype</option>
              <option>Nieuwbouw</option>
              <option>Transformatie</option>
              <option>Uitbreiding</option>
              <option>Verduurzaming</option>
            </select>
            <select className="border p-2" value={budgetType} onChange={(e)=>handleBudgetTypeChange(e.target.value)}>
              <option value="">Soort begroting</option>
              <option>Open begroting</option>
              <option>Gesloten begroting</option>
            </select>
          </div>
          <button className="mt-4 bg-black px-4 py-2 text-white" onClick={handleSaveSettings}>
            Instellingen opslaan
          </button>
        </section>

        {/* Stap 4 */}
        <section className="mb-6 rounded border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Stap 4 – Upload bestanden</h2>
          <input type="file" multiple onChange={handleFileChange}/>
          <button className="mt-4 bg-black px-4 py-2 text-white" onClick={handleUploadFiles}>
            Upload
          </button>
        </section>

        {/* Acties */}
        <section className="rounded border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Acties</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleStartAnalysis}>Analyse</button>
            <button onClick={handleConfirmStabu}>STABU OK</button>
            <button onClick={handleRunCalculation}>Calculeren</button>
            <button onClick={handleRiskAnalysis}>Risico</button>
            <button onClick={handlePlanning}>Planning</button>
            <button onClick={handleOfferGenerate}>Offerte</button>
            <button onClick={handleDownloadPdf}>PDF</button>
          </div>
        </section>
      </div>
    </div>
  );
}
