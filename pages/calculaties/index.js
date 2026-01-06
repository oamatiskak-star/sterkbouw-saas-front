'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, FileText, Calculator, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function CalculatiesPage() {
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [calculationId, setCalculationId] = useState(null);
  const [uiStep, setUiStep] = useState('start');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [startingCalculation, setStartingCalculation] = useState(false);
  const [projectType, setProjectType] = useState('');
  const [calculationLevel, setCalculationLevel] = useState('');
  const [nawData, setNawData] = useState({
    project_name: '',
    client_name: '',
    client_address: '',
    client_postcode: '',
    client_city: '',
    client_country: 'Nederland',
    billing_name: '',
    billing_address: '',
    billing_postcode: '',
    billing_city: '',
    billing_country: 'Nederland',
  });
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [settings, setSettings] = useState({
    scenario_name: '',
    fixed_price: '',
    ak_percentage: 10,
    abk_percentage: 5,
    risk_percentage: 3,
    profit_percentage: 7,
  });
  const [calculationStatus, setCalculationStatus] = useState(null);
  const [results, setResults] = useState(null);

  const CALCULATION_MODELS = {
    nieuwbouw: { ak: 6, abk: 5, risk: 4, profit: 6 },
    transformatie: { ak: 7, abk: 6, risk: 6, profit: 6 },
    renovatie: { ak: 8, abk: 6, risk: 7, profit: 5 },
    uitbreiding: { ak: 7, abk: 5, risk: 6, profit: 6 },
    verduurzaming: { ak: 6, abk: 4, risk: 3, profit: 5 },
  };

  const loadDocuments = async (projectId) => {
    if (!projectId) return;
    try {
      const { data, error: docsError } = await supabase
        .from('document_sources')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (docsError) throw docsError;
      setDocuments(data || []);
    } catch (err) {
      setError(err.message || 'Kon documenten niet laden');
    }
  };

  useEffect(() => {
    if (activeProjectId) {
      const channel = supabase
        .channel(`project_calculations_${activeProjectId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'calculation_runs', filter: `project_id=eq.${activeProjectId}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setCalculationId(payload.new.id);
              setCalculationStatus(payload.new.status);
              setCurrentStep(payload.new.current_step);
            } else if (payload.eventType === 'UPDATE') {
              setCalculationStatus(payload.new.status);
              setCurrentStep(payload.new.current_step);
              if (payload.new.status === 'completed') {
                // load results and then request server-side PDF generation (if not exists)
                loadResults();
                // trigger server-side PDF generation
                (async () => {
                  try {
                    await fetch('/api/generate-pdf', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ calculation_id: payload.new.id }),
                    });
                    const { data: calc } = await supabase.from('calculation_runs').select('*').eq('id', payload.new.id).maybeSingle();
                    if (calc?.pdf_url) setPdfUrl(calc.pdf_url);
                  } catch (e) {
                    console.error('PDF generation trigger failed', e);
                  }
                })();
              }
            }
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (activeProjectId) {
      loadDocuments(activeProjectId);
    }
  }, [activeProjectId]);

  const loadResults = async () => {
    try {
      const { data: versions } = await supabase
        .from('calculation_versions')
        .select('*')
        .eq('calculation_id', calculationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (versions) {
        const { data: rows } = await supabase
          .from('calculation_rows')
          .select('*')
          .eq('calculation_version_id', versions.id)
          .order('fase', { ascending: true });
        setResults({ version: versions, rows: rows || [] });
        setUiStep('result');
      }
    } catch (err) {
      setError(err.message || 'Fout bij laden resultaten');
    }
  };

  const handleGoToNAW = () => {
    setUiStep('naw');
    setError(null);
  };

  const handleSaveNAW = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({ ...nawData, status: 'input' })
        .select()
        .single();
      if (insertError) throw insertError;
      setActiveProjectId(data.id);
      await loadDocuments(data.id);
      setUiStep('documents');
    } catch (err) {
      setError(err.message || 'Kon project niet opslaan');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (files, documentType) => {
    if (!files || files.length === 0 || !documentType) return;
    setUploadingDoc(true);
    setError(null);
    try {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        const filePath = `${activeProjectId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('sterkcalc').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { error: insertError } = await supabase.from('document_sources').insert([
          {
            project_id: activeProjectId,
            document_type: documentType,
            file_name: filePath,
            confidence_level: 'medium',
          },
        ]);
        if (insertError) throw insertError;
      }
      await loadDocuments(activeProjectId);
    } catch (err) {
      setError(err.message || 'Upload mislukt');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleContinueToSettings = () => {
    const requiredTypes = ['drawing', 'permit'];
    const uploadedTypes = documents.map((d) => d.document_type);
    const hasRequired = requiredTypes.every((type) => uploadedTypes.includes(type));
    if (!hasRequired) {
      setError('Upload minimaal een tekening en vergunning');
      return;
    }
    setUiStep('settings');
    setError(null);
  };

  async function handleStartCalculation() {
    console.log('START CALCULATION CLICKED');
    setError(null);

    const scenarioName = settings.scenario_name;
    const fixedPrice = settings.fixed_price;

    console.log({
      activeProjectId,
      scenarioName,
      projectType,
      calculationLevel,
      fixedPrice,
    });

    if (!activeProjectId) {
      setError('Geen actief project geselecteerd');
      return;
    }
    if (!scenarioName) {
      setError('Scenario naam ontbreekt');
      return;
    }
    if (!projectType) {
      setError('Kies een projecttype');
      return;
    }
    if (!calculationLevel) {
      setError('Kies een rekenniveau');
      return;
    }

    setStartingCalculation(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AO_CORE_URL}/api/executor/start-calculation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            project_id: activeProjectId,
            scenario_name: scenarioName,
            calculation_type: projectType,
            calculation_level: calculationLevel,
            fixed_price: fixedPrice || null,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Executor start mislukt');
      }

      setCalculationStatus('queued');
      setUiStep('running');
    } catch (err) {
      console.error('Executor start error', err);
      setError(err.message || 'Kon executor niet starten');
    } finally {
      setStartingCalculation(false);
    }
  }

  // Auto-start when requirements are met: at least one drawing uploaded, settings filled and model chosen
  // No automatic starts: user must click the Start button to enqueue a run.

  const groupRowsByFase = (rows) => {
    const phases = ['voorbereiding', 'sloop', 'ruwbouw', 'afbouw', 'installaties', 'oplevering'];
    const grouped = {};
    phases.forEach((phase) => {
      grouped[phase] = rows.filter((r) => r.fase === phase);
    });
    return grouped;
  };

  const calculatePhaseTotal = (rows) => {
    return rows.reduce((sum, row) => sum + (parseFloat(row.regel_totaal) || 0), 0);
  };

  const calculateGrandTotal = (rows) => {
    return rows.reduce((sum, row) => sum + (parseFloat(row.regel_totaal) || 0), 0);
  };

  const handleDownloadPdf = async () => {
    try {
      if (!pdfUrl) {
        const { data: calc } = await supabase.from('calculation_runs').select('*').eq('id', calculationId).maybeSingle();
        if (calc?.pdf_url) setPdfUrl(calc.pdf_url);
        else throw new Error('Geen PDF beschikbaar');
      }
      const { data } = supabase.storage.from('sterkcalc').getPublicUrl(pdfUrl || '');
      if (data?.publicURL) {
        window.open(data.publicURL, '_blank');
      } else {
        throw new Error('Kon PDF niet ophalen');
      }
    } catch (e) {
      setError(e.message || 'Download mislukt');
    }
  };

  useEffect(() => {
    if (calculationStatus === 'completed' && calculationId) {
      (async () => {
        const { data: calc } = await supabase.from('calculation_runs').select('*').eq('id', calculationId).maybeSingle();
        if (calc?.pdf_url) setPdfUrl(calc.pdf_url);
      })();
    }
  }, [calculationStatus, calculationId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">SterkCalc AI Calculatie</h1>
          <p className="mt-2 text-slate-600">Centrale calculatiepagina met AI-analyse</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Fout</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {uiStep === 'start' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
            <Calculator className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Welkom bij SterkCalc</h2>
            <p className="text-slate-600 mb-8">Start een nieuwe AI-calculatie voor uw bouwproject</p>
            <button onClick={handleGoToNAW} className="bg-slate-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors">
              Start nieuwe calculatie
            </button>
          </div>
        )}

        {uiStep === 'naw' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Projectgegevens & Facturatie</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Projectnaam</label>
                <input type="text" value={nawData.project_name} onChange={(e) => setNawData({ ...nawData, project_name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent" placeholder="Renovatie Hoofdstraat 123" />
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Klantgegevens</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Naam</label>
                    <input type="text" value={nawData.client_name} onChange={(e) => setNawData({ ...nawData, client_name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Adres</label>
                    <input type="text" value={nawData.client_address} onChange={(e) => setNawData({ ...nawData, client_address: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Postcode</label>
                    <input type="text" value={nawData.client_postcode} onChange={(e) => setNawData({ ...nawData, client_postcode: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Plaats</label>
                    <input type="text" value={nawData.client_city} onChange={(e) => setNawData({ ...nawData, client_city: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Land</label>
                    <input type="text" value={nawData.client_country} onChange={(e) => setNawData({ ...nawData, client_country: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Facturatieadres</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Naam</label>
                    <input type="text" value={nawData.billing_name} onChange={(e) => setNawData({ ...nawData, billing_name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Adres</label>
                    <input type="text" value={nawData.billing_address} onChange={(e) => setNawData({ ...nawData, billing_address: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Postcode</label>
                    <input type="text" value={nawData.billing_postcode} onChange={(e) => setNawData({ ...nawData, billing_postcode: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Plaats</label>
                    <input type="text" value={nawData.billing_city} onChange={(e) => setNawData({ ...nawData, billing_city: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Land</label>
                    <input type="text" value={nawData.billing_country} onChange={(e) => setNawData({ ...nawData, billing_country: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={handleSaveNAW} disabled={loading || !nawData.project_name || !nawData.client_name} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Opslaan & verder
              </button>
            </div>
          </div>
        )}

        {uiStep === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Documenten uploaden</h2>
            <div className="space-y-4 mb-6">
              {[
                { type: 'drawing', label: 'Tekeningen (verplicht)', accept: '.pdf,.dwg,.jpg,.png', required: true },
                { type: 'permit', label: 'Vergunningen (optioneel)', accept: '.pdf', required: false },
                { type: 'photo', label: 'Foto’s (optioneel)', accept: '.jpg,.jpeg,.png', required: false },
                { type: 'demolition', label: 'Slooprapporten (optioneel)', accept: '.pdf', required: false },
                { type: 'sanering', label: 'Saneringsrapporten (optioneel)', accept: '.pdf', required: false },
              ].map(({ type, label, accept, required }) => {
                const uploadedCount = documents.filter((d) => d.document_type === type).length;
                return (
                  <div key={type} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-700">{label}</label>
                      {uploadedCount > 0 && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> {uploadedCount} bestand{uploadedCount > 1 ? 'en' : ''}
                        </span>
                      )}
                    </div>

                    <input type="file" multiple accept={accept} onChange={(e) => handleUploadDocument(e.target.files, type)} disabled={uploadingDoc} className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 disabled:opacity-50" />

                    {required && uploadedCount === 0 && <p className="text-xs text-slate-500 mt-1">Minimaal één bestand vereist</p>}
                  </div>
                );
              })}
            </div>

            {uploadingDoc && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Document uploaden...
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={handleContinueToSettings} disabled={uploadingDoc} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Verder naar instellingen
              </button>
            </div>
          </div>
        )}

        {uiStep === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Instellingen & Type Calculatie</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Scenario naam</label>
                        <input type="text" value={settings.scenario_name} onChange={(e) => setSettings({ ...settings, scenario_name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent" placeholder="Basis scenario" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Projecttype</label>
                        <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent">
                          <option value="">-- Kies projecttype --</option>
                          <option value="nieuwbouw">Nieuwbouw</option>
                          <option value="transformatie">Transformatie</option>
                          <option value="renovatie">Renovatie</option>
                          <option value="uitbreiding">Uitbreiding</option>
                          <option value="verduurzaming">Verduurzaming</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Rekenniveau</label>
                        <select value={calculationLevel} onChange={(e) => setCalculationLevel(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent">
                          <option value="">-- Kies rekenniveau --</option>
                          <option value="indicatief">Indicatief</option>
                          <option value="begroting">Begroting</option>
                          <option value="contract">Contract</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Vaste prijs (optioneel)</label>
                        <input type="number" value={settings.fixed_price} onChange={(e) => setSettings({ ...settings, fixed_price: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent" placeholder="€ 0.00" />
                      </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Opslagen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">AK %</label>
                    <input type="number" value={settings.ak_percentage} onChange={(e) => setSettings({ ...settings, ak_percentage: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ABK %</label>
                    <input type="number" value={settings.abk_percentage} onChange={(e) => setSettings({ ...settings, abk_percentage: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Risico %</label>
                    <input type="number" value={settings.risk_percentage} onChange={(e) => setSettings({ ...settings, risk_percentage: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Winst %</label>
                    <input type="number" value={settings.profit_percentage} onChange={(e) => setSettings({ ...settings, profit_percentage: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleStartCalculation}
                disabled={startingCalculation}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {startingCalculation && <Loader2 className="w-4 h-4 animate-spin" />} Start AI calculatie
              </button>
            </div>
          </div>
        )}

        {uiStep === 'running' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">AI Calculatie loopt</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${calculationStatus === 'queued' ? 'bg-slate-200' : 'bg-green-100'}`}>
                  {calculationStatus === 'queued' ? <Loader2 className="w-4 h-4 animate-spin text-slate-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <span className="text-slate-700">In wachtrij</span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${calculationStatus === 'running' ? 'bg-slate-200' : calculationStatus === 'completed' ? 'bg-green-100' : 'bg-slate-100'}`}>
                  {calculationStatus === 'running' ? <Loader2 className="w-4 h-4 animate-spin text-slate-600" /> : calculationStatus === 'completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
                </div>
                <span className="text-slate-700">Documenten analyseren</span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${calculationStatus === 'running' ? 'bg-slate-200' : calculationStatus === 'completed' ? 'bg-green-100' : 'bg-slate-100'}`}>
                  {calculationStatus === 'running' ? <Loader2 className="w-4 h-4 animate-spin text-slate-600" /> : calculationStatus === 'completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
                </div>
                <span className="text-slate-700">STABU mapping</span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${calculationStatus === 'running' ? 'bg-slate-200' : calculationStatus === 'completed' ? 'bg-green-100' : 'bg-slate-100'}`}>
                  {calculationStatus === 'running' ? <Loader2 className="w-4 h-4 animate-spin text-slate-600" /> : calculationStatus === 'completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
                </div>
                <span className="text-slate-700">Berekenen</span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${calculationStatus === 'running' ? 'bg-slate-200' : calculationStatus === 'completed' ? 'bg-green-100' : 'bg-slate-100'}`}>
                  {calculationStatus === 'running' ? <Loader2 className="w-4 h-4 animate-spin text-slate-600" /> : calculationStatus === 'completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
                </div>
                <span className="text-slate-700">Opslagen toepassen</span>
              </div>

              {settings.fixed_price && (
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${calculationStatus === 'completed' ? 'bg-green-100' : 'bg-slate-100'}`}>
                    {calculationStatus === 'completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
                  </div>
                  <span className="text-slate-700">Vaste prijs correctie</span>
                </div>
              )}
            </div>

            {calculationStatus === 'completed' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">Calculatie voltooid! Resultaten worden geladen...</p>
              </div>
            )}
          </div>
        )}

        {uiStep === 'result' && results && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Resultaten</h2>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Totaalbedrag</p>
                  <p className="text-2xl font-bold text-slate-900"> € {results.version.total_amount?.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                {calculationStatus === 'completed' && (
                  <div className="flex items-center gap-2">
                    <button onClick={handleDownloadPdf} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm">Download 2jours PDF</button>
                  </div>
                )}
              </div>

              {Object.entries(groupRowsByFase(results.rows)).map(([fase, rows]) => {
                if (rows.length === 0) return null;
                const phaseTotal = calculatePhaseTotal(rows);
                return (
                  <div key={fase} className="mb-8">
                    <div className="bg-slate-100 px-4 py-2 rounded-t-lg border-b-2 border-slate-300">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase">{fase}</h3>
                        <span className="text-sm font-semibold text-slate-900"> € {phaseTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">STABU</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">Omschrijving</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">Hoeveelheid</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">Inkoop</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">AK</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">ABK</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">Risico</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">Winst</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">Totaal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-4 py-2 text-sm text-slate-600">{row.stabu_code}</td>
                              <td className="px-4 py-2 text-sm text-slate-900">{row.omschrijving}</td>
                              <td className="px-4 py-2 text-sm text-slate-600 text-right">{row.hoeveelheid}</td>
                              <td className="px-4 py-2 text-sm text-slate-600 text-right"> € {parseFloat(row.inkoop).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-2 text-sm text-slate-600 text-right"> € {parseFloat(row.ak).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-2 text-sm text-slate-600 text-right"> € {parseFloat(row.abk).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-2 text-sm text-slate-600 text-right"> € {parseFloat(row.risk).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-2 text-sm text-slate-600 text-right"> € {parseFloat(row.profit).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-2 text-sm font-medium text-slate-900 text-right"> € {parseFloat(row.regel_totaal).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              <div className="border-t-2 border-slate-300 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">Totaal</span>
                  <span className="text-2xl font-bold text-slate-900"> € {calculateGrandTotal(results.rows).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
