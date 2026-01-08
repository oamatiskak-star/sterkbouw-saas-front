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

  useEffect(() => {
    console.log('🔄 Calculatie pagina geladen - resetting state');
    
    setActiveProjectId(null);
    setCalculationId(null);
    setUiStep('start');
    setLoading(false);
    setError(null);
    setPdfUrl(null);
    setStartingCalculation(false);
    setProjectType('');
    setCalculationLevel('');
    setNawData({
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
    setDocuments([]);
    setUploadingDoc(false);
    setSettings({
      scenario_name: '',
      fixed_price: '',
      ak_percentage: 10,
      abk_percentage: 5,
      risk_percentage: 3,
      profit_percentage: 7,
    });
    setCalculationStatus(null);
    setResults(null);
  }, []);

  // Polling logic for calculation status
  useEffect(() => {
    if (!activeProjectId || uiStep !== 'running') return;

    console.log('🔄 Directe status polling gestart voor project:', activeProjectId);

    const checkStatusDirectly = async () => {
      try {
        const { data: calc } = await supabase
          .from('calculation_runs')
          .select('id, status, pdf_url')
          .eq('project_id', activeProjectId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (calc?.status === 'completed') {
          console.log('✅ Calculation is completed via direct check! Switching to result view.');
          setCalculationStatus('completed');
          setCalculationId(calc.id);

          if (calc.pdf_url) {
            setPdfUrl(calc.pdf_url);
          }
          
          setUiStep('result');
          return true; // Stop polling
        }
        
        if (calc?.status === 'failed' || calc?.status === 'completed_indicative') {
            setError(calc.error || 'De calculatie kon niet worden voltooid.');
            setUiStep('settings'); // Go back to settings on failure
            return true; // Stop polling
        }

      } catch (error) {
        console.log('⚠️ Direct check error:', error.message);
      }
      return false;
    };

    checkStatusDirectly();
    
    const interval = setInterval(async () => {
      const completed = await checkStatusDirectly();
      if (completed) {
        clearInterval(interval);
        console.log('✅ Polling gestopt - calculatie is afgerond of gefaald.');
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      console.log('🧹 Directe polling cleanup');
      clearInterval(interval);
    };
  }, [activeProjectId, uiStep]);

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
            if (payload.new) {
              const newStatus = payload.new.status;
              setCalculationStatus(newStatus);
              if (newStatus === 'completed') {
                if (payload.new.pdf_url) setPdfUrl(payload.new.pdf_url);
                setCalculationId(payload.new.id);
                setUiStep('result');
              } else if (newStatus === 'failed' || newStatus === 'completed_indicative') {
                setError(payload.new.error || 'De calculatie kon niet worden voltooid.');
                setUiStep('settings');
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
    if(!calculationId) return;
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
      }
    } catch (err) {
      setError(err.message || 'Fout bij laden resultaten');
    }
  };

  // Effect to load detailed results when the result page is shown
  useEffect(() => {
    if (uiStep === 'result' && calculationId && !results) {
      loadResults();
    }
  }, [uiStep, calculationId, results]);

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
      .insert({ 
        ...nawData, 
        status: 'input',
        pdf_url: null
      })
      .select()
      .maybeSingle();
    if (insertError) throw insertError;
    if (!data) throw new Error('Could not create project.');
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
        const { error: uploadError } = await supabase.storage.from('project_input_files').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { error: insertError } = await supabase.from('document_sources').insert([
          {
            project_id: activeProjectId,
            document_type: documentType,
            storage_path: filePath,
            file_name: file.name
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
    const requiredTypes = ['drawing'];
    const uploadedTypes = documents.map((d) => d.document_type);
    const hasRequired = requiredTypes.every((type) => uploadedTypes.includes(type));
    if (!hasRequired) {
      setError('Upload minimaal een tekening');
      return;
    }
    setUiStep('settings');
    setError(null);
  };

  async function handleStartCalculation() {
    console.log('START CALCULATION CLICKED');
    setError(null);
    setPdfUrl(null);
    setResults(null);

    if (!activeProjectId || !settings.scenario_name || !projectType || !calculationLevel) {
      setError('Vul alle vereiste velden in: scenario naam, projecttype en rekenniveau.');
      return;
    }

    setStartingCalculation(true);

    const { error } = await supabase
      .from('executor_tasks')
      .insert({
        project_id: activeProjectId,
        action: 'start_calculation',
        assigned_to: 'executor',
        status: 'open',
        payload: {
          project_id: activeProjectId,
          scenario_name: settings.scenario_name,
          calculation_type: projectType,
          calculation_level: calculationLevel,
          fixed_price: settings.fixed_price || null,
        },
      });

    if (error) {
      console.error('EXECUTOR_TASK_INSERT_ERROR', error);
      setError(error.message);
      setStartingCalculation(false);
      return;
    }

    setCalculationStatus('queued');
    setUiStep('running');
    setStartingCalculation(false);
  }

  const groupRowsByFase = (rows) => {
    if(!rows) return {};
    const phases = ['voorbereiding', 'sloop', 'ruwbouw', 'afbouw', 'installaties', 'oplevering'];
    const grouped = {};
    phases.forEach((phase) => {
      const phaseRows = rows.filter((r) => r.fase === phase);
      if (phaseRows.length > 0) {
        grouped[phase] = phaseRows;
      }
    });
    return grouped;
  };

  const calculatePhaseTotal = (rows) => {
    return rows.reduce((sum, row) => sum + (parseFloat(row.regel_totaal) || 0), 0);
  };

  const calculateGrandTotal = (rows) => {
    return rows.reduce((sum, row) => sum + (parseFloat(row.regel_totaal) || 0), 0);
  };

  const handleDownloadPdf = () => {
    if (!pdfUrl) {
      setError('Geen PDF beschikbaar om te downloaden.');
      return;
    }
    window.open(pdfUrl, '_blank');
  };

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
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={handleSaveNAW} disabled={loading || !nawData.project_name} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
              <button onClick={handleContinueToSettings} disabled={uploadingDoc || documents.filter(d => d.document_type === 'drawing').length === 0} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleStartCalculation}
                disabled={startingCalculation || !settings.scenario_name || !projectType || !calculationLevel}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {startingCalculation && <Loader2 className="w-4 h-4 animate-spin" />} Start AI calculatie
              </button>
            </div>
          </div>
        )}

        {uiStep === 'running' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">AI calculatie loopt...</h2>
            <Loader2 className="w-12 h-12 text-slate-700 mx-auto animate-spin mb-4" />
            <p className="text-slate-600">Dit kan enkele momenten duren. De pagina ververst automatisch.</p>
          </div>
        )}

       {uiStep === 'result' && (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{settings.scenario_name || 'Calculatie Resultaat'}</h2>
                <p className="text-slate-600">Project: {nawData.project_name || 'N/A'}</p>
              </div>
              <button
                onClick={handleDownloadPdf}
                disabled={!pdfUrl}
                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Download 2jours PDF
              </button>
            </div>

            {!results ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-slate-500 mx-auto animate-spin mb-4" />
                    <p className="text-slate-600">Resultaten worden geladen...</p>
                </div>
            ) : (
                <>
                <div className="text-right mb-4">
                    <p className="text-sm text-slate-600">Totaalbedrag</p>
                    <p className="text-3xl font-bold text-slate-900">
                    € {results.version?.total_amount?.toLocaleString('nl-NL', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                    </p>
                </div>

                {Object.entries(groupRowsByFase(results.rows)).map(([fase, rows]) => {
                const phaseTotal = calculatePhaseTotal(rows);
                return (
                    <div key={fase} className="mb-8">
                    <div className="bg-slate-100 px-4 py-2 rounded-t-lg border-b-2 border-slate-300 flex justify-between mb-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider">{fase}</h3>
                        <span className="text-sm font-semibold">
                        € {phaseTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Omschrijving</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Hoeveelheid</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Totaal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {rows.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                                <td className="px-4 py-3 text-sm text-slate-800">{row.omschrijving}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 text-right">{row.hoeveelheid} {row.eenheid}</td>
                                <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right"> € {parseFloat(row.regel_totaal).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    </div>
                );
                })}
                </>
            )}
            </div>
        </div>
        )}
      </div>
    </div>
  );
}
