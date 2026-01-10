'use client';
import { useState } from 'react';

export default function CalculatiesPage() {
  const backendBase =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const api = (path) => `${backendBase}${path}`;

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
  const [currentStep, setCurrentStep] = useState(1);

  async function request(path, body) {
    setError('');
    setStatus('');

    const response = await fetch(api(path), {
      method: 'POST',
      headers: body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      body: body instanceof FormData ? body : JSON.stringify(body || {})
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

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      selectedFiles.forEach((file) => formData.append('files[]', file));

      await request('/api/files/upload', formData);

      setFilesUploaded(true);
      setStatus('Bestanden geupload');
      setCurrentStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleStartAnalysis() {
    try {
      const payload = await request('/api/analysis/start', { project_id: projectId });
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

  async function handleOfferGenerate() {
    try {
      const payload = await request('/api/offer/generate', { project_id: projectId });
      if (payload.pdf_url) setPdfUrl(payload.pdf_url);
      setStatus(`Offerte taak gestart (${payload.task_id || 'ready'})`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDownloadPdf() {
    try {
      if (!pdfUrl) {
        setError('PDF is nog niet beschikbaar');
        return;
      }
      window.open(pdfUrl, '_blank');
    } catch (err) {
      setError(err.message);
    }
  }

  function getStepClasses(step) {
    return `rounded-xl border p-6 transition ${
      currentStep === step
        ? 'border-slate-900 bg-slate-50 shadow-sm'
        : 'border-slate-200 bg-white'
    }`;
  }

  function getStepNumberClasses(step) {
    return `flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
      currentStep === step
        ? 'bg-slate-900 text-white'
        : 'bg-slate-200 text-slate-700'
    }`;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <h1 className="text-3xl font-bold mb-6">SterkCalc Calculatie Flow</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {status && <div className="mb-4 text-green-600">{status}</div>}

      <section className={getStepClasses(1)}>
        <div className="flex gap-4">
          <div className={getStepNumberClasses(1)}>1</div>
          <div className="flex-1">
            <h2 className="font-semibold mb-2">Klant aanmaken</h2>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Naam opdrachtgever"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <button className="bg-black text-white px-4 py-2" onClick={handleCreateCustomer}>
              Klant aanmaken
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
