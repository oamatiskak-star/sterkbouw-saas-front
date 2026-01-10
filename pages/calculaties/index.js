'use client';
import { useState } from 'react';

const API_BASE =
  `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_ROUTE}`;

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
    phone: ''
  });

  const [project, setProject] = useState({ name: '' });

  const [projectType, setProjectType] = useState('');
  const [budgetType, setBudgetType] = useState('');

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [stabuConfirmed, setStabuConfirmed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [splitRequest, setSplitRequest] = useState('');

  async function request(path, body) {
    setError('');
    setStatus('');

    const response = await fetch(`${API_BASE}${path}`, {
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
      const payload = await request('/customer/create', customer);
      setProjectId(payload.project_id);
      setProject({ name: payload.project_name || '' });
      setStatus('Klant en project aangemaakt');
      setCurrentStep(3);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveSettings() {
    try {
      await request('/project/settings', {
        project_id: projectId,
        calculation_type: projectType,
        calculation_level: budgetType
      });
      setStatus('Projectinstellingen opgeslagen');
      setCurrentStep(4);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleFileChange(e) {
    setSelectedFiles(Array.from(e.target.files || []));
  }

  async function handleUploadFiles() {
    if (!projectId || selectedFiles.length === 0) {
      setError('Selecteer bestanden');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      selectedFiles.forEach(f => formData.append('files[]', f));

      const res = await fetch(`${API_BASE}/files/upload`, {
        method: 'POST',
        body: formData
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'UPLOAD_FAILED');

      setFilesUploaded(true);
      setStatus('Bestanden geüpload');
      setCurrentStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleStartAnalysis() {
    try {
      const payload = await request('/analysis/start', { project_id: projectId });
      setAnalysisStarted(true);
      setStatus(`Analyse gestart (${payload.task_id})`);
      setCurrentStep(6);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirmStabu() {
    try {
      await request('/stabu/confirm', { project_id: projectId });
      setStabuConfirmed(true);
      setStatus('STABU bevestigd');
      setCurrentStep(7);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRunCalculation() {
    try {
      const payload = await request('/calculation/run', {
        project_id: projectId,
        calculation_type: projectType,
        calculation_level: budgetType
      });
      setStatus(`Calculatie gestart (${payload.task_id})`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSplitCalculation() {
    try {
      await request('/calculation/split', {
        project_id: projectId,
        split_request: splitRequest
      });
      setStatus('Calculatie gesplitst');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleOfferGenerate() {
    try {
      const payload = await request('/offer/generate', { project_id: projectId });
      if (payload.pdf_url) setPdfUrl(payload.pdf_url);
      setStatus('Offerte gegenereerd');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDownloadPdf() {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank');
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="mb-6 text-3xl font-bold">SterkCalc – Calculatie</h1>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-800">{error}</div>}
      {status && <div className="mb-4 rounded bg-green-100 p-3 text-green-800">{status}</div>}

      {/* Stap 1 */}
      <section className="mb-6 rounded bg-white p-6">
        <h2 className="mb-4 font-semibold">Stap 1 – Klant</h2>
        <div className="grid grid-cols-2 gap-3">
          <input className="border p-2" placeholder="Naam" value={customer.name}
            onChange={e => setCustomer({ ...customer, name: e.target.value })} />
          <input className="border p-2" placeholder="Email" value={customer.email}
            onChange={e => setCustomer({ ...customer, email: e.target.value })} />
        </div>
        <button className="mt-4 bg-black px-4 py-2 text-white"
          onClick={handleCreateCustomer}>
          Klant aanmaken
        </button>
      </section>

      {/* Stap 3 */}
      <section className="mb-6 rounded bg-white p-6">
        <h2 className="mb-4 font-semibold">Stap 3 – Instellingen</h2>
        <div className="grid grid-cols-2 gap-3">
          <select className="border p-2" value={projectType}
            onChange={e => setProjectType(e.target.value)}>
            <option value="">Projecttype</option>
            <option value="Nieuwbouw">Nieuwbouw</option>
            <option value="Transformatie">Transformatie</option>
          </select>
          <select className="border p-2" value={budgetType}
            onChange={e => setBudgetType(e.target.value)}>
            <option value="">Begroting</option>
            <option value="Open">Open</option>
            <option value="Gesloten">Gesloten</option>
          </select>
        </div>
        <button className="mt-4 bg-black px-4 py-2 text-white"
          onClick={handleSaveSettings}
          disabled={!projectId || !projectType || !budgetType}>
          Opslaan
        </button>
      </section>

      {/* Upload */}
      <section className="mb-6 rounded bg-white p-6">
        <h2 className="mb-4 font-semibold">Stap 4 – Upload bestanden</h2>
        <input type="file" multiple onChange={handleFileChange} />
        <button className="mt-4 bg-black px-4 py-2 text-white"
          onClick={handleUploadFiles}
          disabled={isUploading}>
          Upload
        </button>
      </section>

      {/* Analyse & calculatie */}
      <section className="rounded bg-white p-6">
        <button className="mr-3 bg-black px-4 py-2 text-white"
          onClick={handleStartAnalysis}
          disabled={!filesUploaded}>
          Start analyse
        </button>
        <button className="mr-3 bg-black px-4 py-2 text-white"
          onClick={handleConfirmStabu}
          disabled={!analysisStarted}>
          Bevestig STABU
        </button>
        <button className="bg-black px-4 py-2 text-white"
          onClick={handleRunCalculation}
          disabled={!stabuConfirmed}>
          Start calculatie
        </button>
      </section>

      {/* Optioneel */}
      <section className="mt-6 rounded bg-white p-6">
        <h2 className="mb-3 font-semibold">Opties</h2>
        <input className="mb-3 w-full border p-2"
          placeholder="Split verzoek"
          value={splitRequest}
          onChange={e => setSplitRequest(e.target.value)} />
        <button className="mr-3 bg-black px-4 py-2 text-white"
          onClick={handleSplitCalculation}>
          Splits calculatie
        </button>
        <button className="mr-3 bg-black px-4 py-2 text-white"
          onClick={handleOfferGenerate}>
          Maak offerte
        </button>
        <button className="bg-black px-4 py-2 text-white"
          onClick={handleDownloadPdf}
          disabled={!pdfUrl}>
          Download PDF
        </button>
      </section>
    </div>
  );
}
