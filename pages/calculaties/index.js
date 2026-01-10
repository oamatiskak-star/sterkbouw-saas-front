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

  const [project, setProject] = useState({
    name: '',
    address: '',
    postcode: '',
    city: '',
    email: '',
    phone: '',
  });

  const [settings, setSettings] = useState({
    scenario_name: '',
    calculation_type: '',
    calculation_level: '',
    fixed_price: '',
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
        fixed_price: settings.fixed_price || null,
      });
      setStatus(`Instellingen opgeslagen (${payload.calculation_type})`);
      setCurrentStep(4);
    } catch (err) {
      setError(err.message);
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
        scenario_name: project.name || settings.scenario_name,
        calculation_type: projectType,
        calculation_level: budgetType,
        fixed_price: settings.fixed_price || null,
      });
      setStatus(`Calculatie gestart (${payload.task_id})`);
      setCurrentStep(7);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRiskAnalysis() {
    try {
      const payload = await request('/api/risk/analyse', {
        project_id: projectId,
      });
      setStatus(`Risico analyse gestart (${payload.task_id})`);
      setCurrentStep(9);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePlanning() {
    try {
      const payload = await request('/api/planning/generate', {
        project_id: projectId,
      });
      setStatus(`Termijnschema gestart (${payload.task_id})`);
      setCurrentStep(10);
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
      setStatus('Calculatie split opgeslagen');
      setCurrentStep(11);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleOfferGenerate() {
    try {
      const payload = await request('/api/offer/generate', {
        project_id: projectId,
      });
      if (payload.pdf_url) {
        setPdfUrl(payload.pdf_url);
      }
      setStatus(
        `Offerte taak gestart (${payload.task_id || 'direct gereed'})`
      );
      setCurrentStep(13);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDownloadPdf() {
    try {
      const payload = await request('/api/offer/generate', {
        project_id: projectId,
      });
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

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      selectedFiles.forEach((file) => {
        formData.append('files[]', file);
      });

      const response = await fetch(`${backendUrl}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'UPLOAD_FAILED');
      }

      setFilesUploaded(true);
      setStatus('Bestanden geüpload');
      setCurrentStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-4 text-3xl font-bold">SterkCalc Calculatie Flow</h1>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {status && (
          <div className="mb-4 rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
            {status}
          </div>
        )}

        {/* UI blijft verder ongewijzigd */}
      </div>
    </div>
  );
}
