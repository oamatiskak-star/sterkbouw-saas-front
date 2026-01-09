'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, FileText, Calculator, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const CALCULATION_MODEL_DEFAULTS = {
  nieuwbouw: {
    label: 'Nieuwbouw',
    description: 'Calculatie voor volledig nieuwe bouwprojecten, startend vanaf de fundering.',
    ak_percentage: 7,
    abk_percentage: 6,
    risk_percentage: 2,
    profit_percentage: 5,
    calculation_flow: [
      'fundering',
      'casco',
      'schil',
      'installaties',
      'afbouw'
    ],
    forced_rules: {
      must_include: ['fundering', 'casco', 'schil', 'installaties', 'afbouw'],
      may_include: [],
      must_exclude: ['bestaande_constructie_analyse', 'gedeeltelijke_sloop']
    },
    logic_constraints: {
      allow_overlap_existing_new: false,
      allow_partial_demolition: false,
      require_existing_structure_analysis: false
    },
    default_assumptions: {
      reuse_percentage: 0,
      demolition_separate: true,
      installaties_volledig_vervangen: true
    }
  },
  transformatie: {
    label: 'Transformatie',
    description: 'Herbestemming of ingrijpende wijziging van een bestaand gebouw, inclusief aanpassing en nieuwe toevoegingen.',
    ak_percentage: 8,
    abk_percentage: 7,
    risk_percentage: 8,
    profit_percentage: 6,
    calculation_flow: [
      'bestaande_constructie_analyse',
      'fundering', // Can include new foundation if structural changes
      'casco',
      'schil',
      'installaties',
      'afbouw'
    ],
    forced_rules: {
      must_include: ['bestaande_constructie_analyse'],
      may_include: ['gedeeltelijke_sloop'],
      must_exclude: []
    },
    logic_constraints: {
      allow_overlap_existing_new: true,
      allow_partial_demolition: true,
      require_existing_structure_analysis: true
    },
    default_assumptions: {
      reuse_percentage: null,
      demolition_separate: false,
      installaties_volledig_vervangen: false
    }
  },
  renovatie: {
    label: 'Renovatie',
    description: 'Vernieuwing of verbetering van een bestaand gebouw met maximaal behoud van de bestaande structuur.',
    ak_percentage: 9,
    abk_percentage: 7,
    risk_percentage: 10,
    profit_percentage: 6,
    calculation_flow: [
      'bestaande_constructie_analyse',
      'schil',
      'installaties',
      'afbouw'
    ],
    forced_rules: {
      must_include: [],
      may_include: ['maximaal_hergebruik'],
      must_exclude: ['nieuwe_fundering_totaal']
    },
    logic_constraints: {
      allow_overlap_existing_new: true,
      allow_partial_demolition: true,
      require_existing_structure_analysis: true
    },
    default_assumptions: {
      reuse_percentage: null,
      demolition_separate: false,
      installaties_volledig_vervangen: false
    }
  },
  uitbreiding: {
    label: 'Uitbreiding',
    description: 'Toevoeging van nieuwe bouwdelen aan een bestaand gebouw, met focus op koppeling.',
    ak_percentage: 8,
    abk_percentage: 6,
    risk_percentage: 6,
    profit_percentage: 5,
    calculation_flow: [
      'bestaand_nieuw_koppeling',
      'fundering', // specific for extension
      'casco',    // specific for extension
      'schil',    // specific for extension
      'installaties', // specific for extension
      'afbouw'    // specific for extension
    ],
    forced_rules: {
      must_include: ['bestaand_nieuw_koppeling'],
      may_include: [],
      must_exclude: ['sloop_bestaand_gebouw_totaal']
    },
    logic_constraints: {
      allow_overlap_existing_new: true,
      allow_partial_demolition: false, // only for connection point, not general
      require_existing_structure_analysis: true
    },
    default_assumptions: {
      reuse_percentage: 0,
      demolition_separate: false,
      installaties_volledig_vervangen: false
    }
  },
  verduurzaming: {
    label: 'Verduurzaming',
    description: 'Maatregelen gericht op energiebesparing en duurzaamheid van een bestaand gebouw.',
    ak_percentage: 6,
    abk_percentage: 5,
    risk_percentage: 4,
    profit_percentage: 5,
    calculation_flow: [
      'schil',
      'installaties',
      'energie_maatregelen'
    ],
    forced_rules: {
      must_include: ['schil', 'installaties', 'energie_maatregelen'],
      may_include: [],
      must_exclude: ['fundering', 'casco']
    },
    logic_constraints: {
      allow_overlap_existing_new: false,
      allow_partial_demolition: false,
      require_existing_structure_analysis: true
    },
    default_assumptions: {
      reuse_percentage: null,
      demolition_separate: false,
      installaties_volledig_vervangen: false
    }
  },
  default: {
    label: 'Standaard (Generiek)',
    description: 'Generieke rekenmethode toegepast bij gebrek aan specifiek type.',
    ak_percentage: 8,
    abk_percentage: 6,
    risk_percentage: 3,
    profit_percentage: 5,
    calculation_flow: [
      'fundering',
      'casco',
      'schil',
      'installaties',
      'afbouw'
    ],
    forced_rules: {
      must_include: [],
      may_include: [],
      must_exclude: []
    },
    logic_constraints: {
      allow_overlap_existing_new: true,
      allow_partial_demolition: true,
      require_existing_structure_analysis: true
    },
    default_assumptions: {
      reuse_percentage: null,
      demolition_separate: false,
      installaties_volledig_vervangen: false
    }
  }
};

const BASE_ELEMENT_CATALOG = [
  { key: 'binnenwand_metalstud', naam: 'Binnenwand (metalstud)', parameter_unit: 'm2', groep: 'Binnenwanden' },
  { key: 'plat_dak_balklaag', naam: 'Plat dak (balklaag)', parameter_unit: 'm2', groep: 'Daken' },
  { key: 'plat_dak_dakelementen', naam: 'Plat dak (dakelementen)', parameter_unit: 'm2', groep: 'Daken' },
  { key: 'vloer_hout_beton', naam: 'Vloer (hout / beton)', parameter_unit: 'm2', groep: 'Vloeren' },
  { key: 'buitenwand', naam: 'Buitenwand', parameter_unit: 'm2', groep: 'Gevels' },
  { key: 'kozijn_binnen_buiten', naam: 'Kozijn (binnen / buiten)', parameter_unit: 'st', groep: 'Kozijnen' }
];

const STABU_SOURCE_TABLE = 'stabu_prices';

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
    fixed_price: '',
    selectedModel: CALCULATION_MODEL_DEFAULTS.default, // Initialize with default model
  });
  const [calculationStatus, setCalculationStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [stabuTree, setStabuTree] = useState([]);
  const [stabuSelections, setStabuSelections] = useState({});
  const [stabuLoading, setStabuLoading] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [middelen, setMiddelen] = useState([]);
  const [groepen, setGroepen] = useState([]);
  const [elementen, setElementen] = useState([]);
  const [elementRegels, setElementRegels] = useState([]);
  const [libraryTab, setLibraryTab] = useState('elementen');
  const [aiProposals, setAiProposals] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [calculatieElements, setCalculatieElements] = useState([]);
  const [deddoError, setDeddoError] = useState(null);
  useEffect(() => {
    console.log('🔄 Calculatie pagina geladen - resetting state');
    
    // Reset alle state
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
      fixed_price: '',
      selectedModel: CALCULATION_MODEL_DEFAULTS.default,
    });
    setCalculationStatus(null);
    setResults(null);
  }, []); // Alleen runnen bij mount

  useEffect(() => {
    let isActive = true;

    const loadStabuTree = async () => {
      setStabuLoading(true);
      setDeddoError(null);
      try {
        const { data, error: stabuError } = await supabase
          .from(STABU_SOURCE_TABLE)
          .select('category, subcategory')
          .order('category', { ascending: true });

        if (stabuError) throw stabuError;
        const rows = Array.isArray(data) ? data : [];
        const chapterMap = new Map();

        rows.forEach((row) => {
          const chapter = row?.category || 'Onbekend';
          const subchapter = row?.subcategory || null;
          if (!chapterMap.has(chapter)) {
            chapterMap.set(chapter, new Set());
          }
          if (subchapter) {
            chapterMap.get(chapter).add(subchapter);
          }
        });

        const tree = Array.from(chapterMap.entries()).map(([chapter, subs]) => ({
          id: chapter,
          label: chapter,
          subchapters: Array.from(subs).sort()
        }));

        if (!isActive) return;
        setStabuTree(tree);
        setStabuSelections((prev) => {
          const next = { ...prev };
          tree.forEach((chapter) => {
            if (!next[chapter.id]) {
              next[chapter.id] = {
                selected: false,
                subs: chapter.subchapters.reduce((acc, sub) => {
                  acc[sub] = false;
                  return acc;
                }, {})
              };
            }
          });
          return next;
        });
      } catch (err) {
        if (!isActive) return;
        setDeddoError(err.message || 'Kon STABU structuur niet laden');
      } finally {
        if (isActive) setStabuLoading(false);
      }
    };

    const loadLibrary = async () => {
      setLibraryLoading(true);
      setDeddoError(null);
      try {
        // SUGGESTIE: als tabelnamen afwijken, koppel hier aan de juiste tabellen.
        const [middelenRes, groepenRes, elementenRes, regelsRes] = await Promise.all([
          supabase.from('middelen').select('*'),
          supabase.from('groepen').select('*'),
          supabase.from('elementen').select('*'),
          supabase.from('element_regels').select('*')
        ]);

        if (middelenRes.error) throw middelenRes.error;
        if (groepenRes.error) throw groepenRes.error;
        if (elementenRes.error) throw elementenRes.error;
        if (regelsRes.error) throw regelsRes.error;

        if (!isActive) return;
        setMiddelen(middelenRes.data || []);
        setGroepen(groepenRes.data || []);
        setElementen(elementenRes.data || []);
        setElementRegels(regelsRes.data || []);
      } catch (err) {
        if (!isActive) return;
        setDeddoError(err.message || 'Kon bibliotheek niet laden');
      } finally {
        if (isActive) setLibraryLoading(false);
      }
    };

    loadStabuTree();
    loadLibrary();

    return () => {
      isActive = false;
    };
  }, []);

  // DIRECTE STATUS CHECK - Toegevoegd als extra laag
  useEffect(() => {
    // ... bestaande code blijft hier
  }, [activeProjectId, uiStep]);
  // DIRECTE STATUS CHECK - Toegevoegd als extra laag
useEffect(() => {
  if (!activeProjectId || uiStep !== 'running') return;
}, [activeProjectId, uiStep]);

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
              if (payload.new.confidence_score !== null && payload.new.confidence_score !== undefined) {
                setConfidenceScore(payload.new.confidence_score);
              }
            } else if (payload.eventType === 'UPDATE') {
              setCalculationStatus(payload.new.status);
              if (payload.new.confidence_score !== null && payload.new.confidence_score !== undefined) {
                setConfidenceScore(payload.new.confidence_score);
              }
              if (payload.new.status === 'completed') {
                // load results and then request server-side PDF generation (if not exists)
                loadResults();
                if (payload.new.pdf_url) {
                  setPdfUrl(payload.new.pdf_url);
                } else {
                  (async () => {
                    try {
                      const { data: calc } = await supabase.from('calculation_runs').select('*').eq('id', payload.new.id).maybeSingle();
                      if (calc?.pdf_url) setPdfUrl(calc.pdf_url);
                      if (calc?.confidence_score !== null && calc?.confidence_score !== undefined) {
                        setConfidenceScore(calc.confidence_score);
                      }
                    } catch (e) {
                      console.error('PDF fetch failed', e);
                    }
                  })();
                }
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
  useEffect(() => {
    let isActive = true;

    const extractProposalsFromAnalysis = (record) => {
      const analysisData = record?.analysis_data || {};
      const collections = [];

      if (Array.isArray(analysisData.calculatie_elementen)) {
        collections.push(analysisData.calculatie_elementen);
      }
      if (Array.isArray(analysisData.stabu_elementen)) {
        collections.push(analysisData.stabu_elementen);
      }
      if (Array.isArray(analysisData.elements)) {
        collections.push(analysisData.elements);
      }
      if (Array.isArray(analysisData.elementen)) {
        collections.push(analysisData.elementen);
      }

      const proposals = [];
      collections.forEach((items) => {
        items.forEach((item, index) => {
          const elementName = item?.element || item?.naam || item?.name || item?.omschrijving || '';
          if (!elementName) return;
          proposals.push({
            id: item?.id || item?.element_id || item?.uuid || `${record.id}-${index}`,
            element_name: elementName,
            stabu_hoofdstuk: item?.stabu_hoofdstuk || item?.hoofdstuk || item?.chapter || item?.stabu_chapter || null,
            stabu_subhoofdstuk: item?.stabu_subhoofdstuk || item?.subhoofdstuk || item?.subchapter || item?.stabu_subchapter || null,
            parameter_unit: item?.parameter || item?.parameter_unit || item?.unit || null,
            parameter_value: item?.parameterwaarde ?? item?.parameter_value ?? item?.hoeveelheid ?? item?.value ?? '',
            motivatie: item?.motivatie || item?.reason || item?.toelichting || '',
            source_analysis_id: record?.id || null
          });
        });
      });

      return proposals;
    };

    const loadAiProposals = async () => {
      if (!activeProjectId) {
        setAiProposals([]);
        return;
      }

      setAiLoading(true);
      setAiError(null);
      try {
        const { data, error: analysisError } = await supabase
          .from('document_analyses')
          .select('*')
          .eq('project_id', activeProjectId)
          .order('created_at', { ascending: false });

        if (analysisError) throw analysisError;
        const proposals = (data || []).flatMap(extractProposalsFromAnalysis);
        const seen = new Set();
        const uniqueProposals = proposals.filter((proposal) => {
          if (!proposal.id) return false;
          if (seen.has(proposal.id)) return false;
          seen.add(proposal.id);
          return true;
        });

        if (!isActive) return;
        setAiProposals(uniqueProposals);
      } catch (err) {
        if (!isActive) return;
        setAiError(err.message || 'Kon AI voorstellen niet laden');
      } finally {
        if (isActive) setAiLoading(false);
      }
    };

    loadAiProposals();

    return () => {
      isActive = false;
    };
  }, [activeProjectId]);

  useEffect(() => {
    if (!aiProposals.length) return;
    setCalculatieElements((prev) => {
      const byId = new Map(prev.map((item) => [item.id, item]));
      aiProposals.forEach((proposal) => {
        const existing = byId.get(proposal.id);
        if (existing) {
          byId.set(proposal.id, {
            ...existing,
            ...proposal,
            status: existing.status || 'proposed'
          });
        } else {
          byId.set(proposal.id, {
            ...proposal,
            status: 'proposed'
          });
        }
      });
      return Array.from(byId.values());
    });
  }, [aiProposals]);
  useEffect(() => {
  const restoreLastProjectWithPdf = async () => {
    try {
      if (activeProjectId) return;

      const { data: lastTask, error: taskError } = await supabase
        .from('executor_tasks')
        .select('project_id, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (taskError) throw taskError;
      if (!lastTask?.project_id) return;

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('pdf_url, status')
        .eq('id', lastTask.project_id)
        .maybeSingle();

      if (projectError) throw projectError;
      if (project?.pdf_url && project?.status === 'completed') {
        setActiveProjectId(lastTask.project_id);
        setPdfUrl(project.pdf_url);
        setCalculationStatus('completed');
        setUiStep('result');
      }
    } catch (err) {
      console.error('Failed to restore last project:', err.message);
      setError('Fout bij herstellen laatste project: ' + err.message);
    }
  };

  restoreLastProjectWithPdf();
}, []);
  
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
        setUiStep('result');
      } else {
        setResults({}); // Set to empty object if no versions found, to stop infinite loop
      }
    } catch (err) {
      setError(err.message || 'Fout bij laden resultaten');
      setResults({}); // Set to empty object on error, to stop infinite loop
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
      .insert({ 
        ...nawData, 
        status: 'input',
        pdf_url: null  // Zorg dat er geen oude pdf_url is voor nieuw project
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
        const bucketName = 'sterkcalc';
        const filePath = `${activeProjectId}/${file.name}`;
        if (!filePath) {
          throw new Error('UPLOAD_STORAGE_PATH_MISSING');
        }
        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
        if (uploadError) throw uploadError;
        const { error: insertError } = await supabase.from('document_sources').insert([
          {
            project_id: activeProjectId,
            document_type: documentType,
            storage_path: filePath,
            file_name: file.name,
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
  if (startingCalculation) {
    console.log('[START_CALCULATION] skipped — already running');
    return;
  }
  
  // Reset pdfUrl voor een nieuwe berekening
  setPdfUrl(null);
  setResults(null);

    const scenarioName = settings.selectedModel.label; // Derived from selectedModel
    const fixedPrice = settings.fixed_price;

    console.log({
      activeProjectId,
      scenarioName, // Now derived
      projectType,
      calculationLevel,
      fixedPrice,
    });

    if (!activeProjectId) {
      setError('Geen actief project geselecteerd');
      return;
    }

    const activeStatuses = [
      'queued',
      'running',
      'scanning',
      'calculating',
      'analysing_documents',
      'generating_stabu',
      'scan_completed',
    ];
    const { data: existingRun } = await supabase
      .from('calculation_runs')
      .select('id, status')
      .eq('project_id', activeProjectId)
      .in('status', activeStatuses)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingRun?.id) {
      setError('CALCULATION_RUN_ALREADY_ACTIVE');
      return;
    }
    // No longer need scenarioName validation as it's derived from projectType
    if (!projectType) { // projectType validation implicitly covers scenarioName
      setError('Kies een projecttype');
      return;
    }
    if (!calculationLevel) {
      setError('Kies een rekenniveau');
      return;
    }

    setStartingCalculation(true);

    const response = await fetch('/api/executor/start-calculation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: activeProjectId,
        scenario_name: scenarioName,
        calculation_type: projectType,
        calculation_level: calculationLevel,
        fixed_price: fixedPrice || null,
        ak_percentage: settings.selectedModel.ak_percentage,
        abk_percentage: settings.selectedModel.abk_percentage,
        risk_percentage: settings.selectedModel.risk_percentage,
        profit_percentage: settings.selectedModel.profit_percentage,
      }),
    });

    const responseBody = await response.json();
    console.log('START_CALCULATION_RESPONSE', responseBody);

    if (!response.ok) {
      console.error('START_CALCULATION_API_ERROR', responseBody);
      setError(responseBody?.error || 'Start calculatie mislukt');
      setStartingCalculation(false);
      return;
    }

    setCalculationStatus('queued');
    setUiStep('running');
    setStartingCalculation(false);
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

  const toNumber = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  };

  const normalizeMiddel = (middel) => ({
    id: middel?.id ?? middel?.middel_id ?? middel?.code ?? null,
    omschrijving: middel?.omschrijving ?? middel?.name ?? middel?.description ?? '',
    eenheid: middel?.eenheid ?? middel?.unit ?? '',
    inkoopprijs: toNumber(middel?.inkoopprijs ?? middel?.purchase_price ?? middel?.inkoop ?? 0),
    opslag: toNumber(middel?.opslag ?? middel?.markup ?? 0),
    verkoopprijs: toNumber(middel?.verkoopprijs ?? middel?.sale_price ?? middel?.verkoop ?? 0),
    btw: toNumber(middel?.btw ?? middel?.tax ?? 0),
  });

  const resolveVerkoopPrijs = (middel) => {
    const verkoopprijs = toNumber(middel?.verkoopprijs);
    if (verkoopprijs > 0) return verkoopprijs;
    return toNumber(middel?.inkoopprijs);
  };

  const normalizeElement = (element) => ({
    id: element?.id ?? element?.element_id ?? element?.code ?? null,
    naam: element?.naam ?? element?.name ?? element?.omschrijving ?? '',
    groep_id: element?.groep_id ?? element?.group_id ?? null,
    parameters: element?.parameters ?? element?.parameter ?? element?.parameter_unit ?? null,
  });

  const normalizeRegel = (regel) => ({
    id: regel?.id ?? `${regel?.element_id}-${regel?.middel_id}-${regel?.parameter || 'regel'}`,
    element_id: regel?.element_id ?? regel?.element ?? null,
    middel_id: regel?.middel_id ?? regel?.middel ?? regel?.resource_id ?? null,
    factor: toNumber(regel?.factor ?? regel?.norm_factor ?? regel?.waarde ?? 0),
    type: regel?.type ?? regel?.categorie ?? '',
    parameter: regel?.parameter ?? regel?.parameter_key ?? regel?.unit ?? null,
  });

  const normalizedMiddelen = middelen.map(normalizeMiddel).filter((middel) => middel.id);
  const middelenById = new Map(normalizedMiddelen.map((middel) => [middel.id, middel]));
  const normalizedElementen = elementen.map(normalizeElement).filter((element) => element.id);
  const elementenById = new Map(normalizedElementen.map((element) => [element.id, element]));
  const elementenByNaam = new Map(
    normalizedElementen
      .filter((element) => element.naam)
      .map((element) => [element.naam.toLowerCase(), element])
  );
  const regelsByElementId = elementRegels.reduce((acc, regel) => {
    const normalized = normalizeRegel(regel);
    if (!normalized.element_id) return acc;
    if (!acc[normalized.element_id]) acc[normalized.element_id] = [];
    acc[normalized.element_id].push(normalized);
    return acc;
  }, {});

  const buildElementCatalog = () => {
    const catalog = [...normalizedElementen];
    const knownNames = new Set(
      catalog
        .map((element) => (element.naam || '').toLowerCase())
        .filter((name) => name.length > 0)
    );

    BASE_ELEMENT_CATALOG.forEach((base) => {
      if (knownNames.has(base.naam.toLowerCase())) return;
      catalog.push({
        id: `basis-${base.key}`,
        naam: base.naam,
        groep_id: null,
        parameters: base.parameter_unit,
        basis: true,
        groep_naam: base.groep
      });
    });

    return catalog;
  };

  const elementCatalog = buildElementCatalog();

  const isProposalInScope = (proposal) => {
    if (!proposal?.stabu_hoofdstuk) return false;
    const chapterState = stabuSelections[proposal.stabu_hoofdstuk];
    if (!chapterState?.selected) return false;
    if (!proposal.stabu_subhoofdstuk) return true;
    return !!chapterState.subs?.[proposal.stabu_subhoofdstuk];
  };

  const handleToggleChapter = (chapterId) => {
    setStabuSelections((prev) => {
      const current = prev[chapterId] || { selected: false, subs: {} };
      const nextSelected = !current.selected;
      const nextSubs = Object.keys(current.subs || {}).reduce((acc, sub) => {
        acc[sub] = nextSelected;
        return acc;
      }, {});
      return {
        ...prev,
        [chapterId]: {
          selected: nextSelected,
          subs: nextSubs
        }
      };
    });
  };

  const handleToggleSubchapter = (chapterId, subchapter) => {
    setStabuSelections((prev) => {
      const current = prev[chapterId] || { selected: false, subs: {} };
      const nextSubs = {
        ...current.subs,
        [subchapter]: !current.subs?.[subchapter]
      };
      const hasAnySelected = Object.values(nextSubs).some(Boolean);
      return {
        ...prev,
        [chapterId]: {
          selected: hasAnySelected,
          subs: nextSubs
        }
      };
    });
  };

  const handleProposalParameterChange = (proposalId, value) => {
    setCalculatieElements((prev) =>
      prev.map((item) => {
        if (item.id !== proposalId) return item;
        return {
          ...item,
          parameter_value: value,
          status: item.status === 'approved' ? 'proposed' : item.status
        };
      })
    );
  };

  const handleApproveProposal = (proposalId) => {
    setCalculatieElements((prev) =>
      prev.map((item) => {
        if (item.id !== proposalId) return item;
        return {
          ...item,
          status: 'approved'
        };
      })
    );
  };

  const handleResetProposal = (proposalId) => {
    setCalculatieElements((prev) =>
      prev.map((item) => {
        if (item.id !== proposalId) return item;
        return {
          ...item,
          status: 'proposed'
        };
      })
    );
  };

  const resolveElementForEntry = (entry) => {
    if (entry?.element_id && elementenById.has(entry.element_id)) {
      return elementenById.get(entry.element_id);
    }
    if (entry?.element_name) {
      const match = elementenByNaam.get(entry.element_name.toLowerCase());
      if (match) return match;
    }
    return null;
  };

  const buildCalculationSnapshot = () => {
    const approvedEntries = calculatieElements.filter((item) => item.status === 'approved');
    const elementSummaries = approvedEntries.map((entry) => {
      const elementRecord = resolveElementForEntry(entry);
      const regels = elementRecord ? regelsByElementId[elementRecord.id] || [] : [];
      const parameterValue = toNumber(entry.parameter_value);
      const computedRegels = regels.map((regel) => {
        const middel = middelenById.get(regel.middel_id) || null;
        const hoeveelheid = regel.factor * parameterValue;
        const inkoop = middel ? hoeveelheid * toNumber(middel.inkoopprijs) : 0;
        const verkoop = middel ? hoeveelheid * resolveVerkoopPrijs(middel) : 0;
        const btw = middel ? verkoop * (toNumber(middel.btw) / 100) : 0;
        return {
          id: `${entry.id}-${regel.id}`,
          middel: middel?.omschrijving || 'Onbekend middel',
          type: regel.type || 'onbekend',
          hoeveelheid,
          inkoop,
          verkoop,
          btw
        };
      });

      return {
        ...entry,
        element: elementRecord,
        parameter_value: parameterValue,
        regels: computedRegels
      };
    });

    const totals = elementSummaries.reduce(
      (acc, element) => {
        element.regels.forEach((regel) => {
          acc.inkoop += regel.inkoop;
          acc.verkoop += regel.verkoop;
          acc.btw += regel.btw;
        });
        return acc;
      },
      { inkoop: 0, verkoop: 0, btw: 0 }
    );

    return { elementSummaries, totals };
  };

  const calculationSnapshot = buildCalculationSnapshot();

const handleDownloadPdf = () => {
    if (!pdfUrl) {
      setError('Geen PDF beschikbaar om te downloaden.');
      return;
    }
    window.open(pdfUrl, '_blank');
  };
  useEffect(() => {
    if (calculationStatus === 'completed' && calculationId) {
      (async () => {
        const { data: calc } = await supabase.from('calculation_runs').select('*').eq('id', calculationId).maybeSingle();
        if (!calc?.pdf_url) {
          setError('PDF_URL_MISSING');
          return;
        }
        setPdfUrl(calc.pdf_url);
        if (calc?.confidence_score !== null && calc?.confidence_score !== undefined) {
          setConfidenceScore(calc.confidence_score);
        }
      })();
    }
  }, [calculationStatus, calculationId]);

  const confidenceLabel =
    confidenceScore === null || confidenceScore === undefined
      ? null
      : confidenceScore >= 80
        ? 'Hoge betrouwbaarheid'
        : confidenceScore >= 60
          ? 'Gemiddelde betrouwbaarheid'
          : 'Indicatief';

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
                        <label className="block text-sm font-medium text-slate-700 mb-2">Projecttype</label>
                        <select value={projectType} onChange={(e) => {
                          const selectedType = e.target.value;
                          setProjectType(selectedType);
                          setSettings(prevSettings => ({
                            ...prevSettings,
                            selectedModel: CALCULATION_MODEL_DEFAULTS[selectedType] || CALCULATION_MODEL_DEFAULTS.default,
                          }));
                        }} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent">
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
                    <input type="number" value={settings.selectedModel.ak_percentage} readOnly className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ABK %</label>
                    <input type="number" value={settings.selectedModel.abk_percentage} readOnly className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Risico %</label>
                    <input type="number" value={settings.selectedModel.risk_percentage} readOnly className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Winst %</label>
                    <input type="number" value={settings.selectedModel.profit_percentage} readOnly className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus;border-transparent" />
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
              {calculationStatus === 'completed' && pdfUrl && (
                <button
                  onClick={handleDownloadPdf}
                  className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-4"
                >
                  <FileText className="w-4 h-4" /> Download 2jours PDF
                </button>
              )}
            </div>
          </div>
        )}



       {uiStep === 'result' && (
  <div className="space-y-6">



    {results && (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Resultaten</h2>

          <div className="text-right">
            <p className="text-sm text-slate-600">Totaalbedrag</p>
            <p className="text-2xl font-bold text-slate-900">
              € {results.version?.total_amount?.toLocaleString('nl-NL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            {confidenceLabel && (
              <p className="text-sm text-slate-600 mt-1">
                {confidenceLabel}
              </p>
            )}
          </div>


        </div>

        {Object.entries(groupRowsByFase(results.rows)).map(([fase, rows]) => {
          if (!rows.length) return null;
          const phaseTotal = calculatePhaseTotal(rows);

          return (
            <div key={fase} className="mb-8">
              <div className="bg-slate-100 px-4 py-2 rounded-t-lg border-b-2 border-slate-300 flex justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase">{fase}</h3>
                <span className="text-sm font-semibold">
                  € {phaseTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Tabel voor deze fase */}
              <div className="overflow-x-auto mb-4">
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

              {/* Fase totaal (optioneel - je hebt het al in de header) */}
              <div className="flex justify-end mb-6">
                <div className="text-right">
                  <span className="text-sm text-slate-600 mr-4">Subtotaal {fase}:</span>
                  <span className="text-lg font-semibold text-slate-900">
                    € {phaseTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Grand total na alle fases */}
        <div className="border-t-2 border-slate-300 pt-4 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900">Totaal offerte</span>
            <span className="text-2xl font-bold text-slate-900">
              € {calculateGrandTotal(results.rows).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
)}

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Calculatie DEDDO</h2>
              <p className="text-sm text-slate-600">Middelen, groepen en elementen met handmatige OK-bevestiging</p>
            </div>
            {aiLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin" /> AI voorstellen laden...
              </div>
            )}
          </div>

          {deddoError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">DEDDO fout</p>
                <p className="text-sm text-red-700 mt-1">{deddoError}</p>
              </div>
            </div>
          )}

          {aiError && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">AI waarschuwing</p>
                <p className="text-sm text-amber-700 mt-1">{aiError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">STABU scope</h3>
                  {stabuLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-500" />}
                </div>
                <div className="max-h-[520px] overflow-y-auto pr-2 space-y-3">
                  {stabuTree.length === 0 ? (
                    <p className="text-sm text-slate-500">Geen STABU hoofdstukken geladen.</p>
                  ) : (
                    stabuTree.map((chapter) => (
                      <div key={chapter.id} className="border border-slate-200 rounded-lg p-3">
                        <label className="flex items-center gap-2 text-sm text-slate-800 font-medium">
                          <input
                            type="checkbox"
                            checked={!!stabuSelections[chapter.id]?.selected}
                            onChange={() => handleToggleChapter(chapter.id)}
                            className="rounded border-slate-300 text-slate-900"
                          />
                          {chapter.label}
                        </label>
                        {chapter.subchapters.length > 0 && (
                          <div className="mt-3 space-y-2 ml-5">
                            {chapter.subchapters.map((sub) => (
                              <label key={sub} className="flex items-center gap-2 text-xs text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={!!stabuSelections[chapter.id]?.subs?.[sub]}
                                  onChange={() => handleToggleSubchapter(chapter.id, sub)}
                                  className="rounded border-slate-300 text-slate-900"
                                />
                                {sub}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="border-b border-slate-200 flex">
                  {['middelen', 'groepen', 'elementen'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setLibraryTab(tab)}
                      className={`flex-1 px-4 py-3 text-sm font-medium ${
                        libraryTab === tab ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="p-4">
                  {libraryLoading && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <Loader2 className="w-4 h-4 animate-spin" /> Bibliotheek laden...
                    </div>
                  )}

                  {libraryTab === 'middelen' && (
                    <div className="space-y-3">
                      {normalizedMiddelen.length === 0 ? (
                        <p className="text-sm text-slate-500">Geen middelen beschikbaar.</p>
                      ) : (
                        normalizedMiddelen.map((middel) => (
                          <div key={middel.id} className="border border-slate-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium text-slate-900">{middel.omschrijving}</p>
                                <p className="text-xs text-slate-500">Eenheid: {middel.eenheid || 'onbekend'}</p>
                              </div>
                              <div className="text-right text-xs text-slate-600 space-y-1">
                                <div>Inkoop: € {middel.inkoopprijs.toFixed(2)}</div>
                                <div>Opslag: {middel.opslag.toFixed(2)}%</div>
                                <div>Verkoop: € {resolveVerkoopPrijs(middel).toFixed(2)}</div>
                                <div>BTW: {middel.btw.toFixed(2)}%</div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {libraryTab === 'groepen' && (
                    <div className="space-y-3">
                      {groepen.length === 0 ? (
                        <p className="text-sm text-slate-500">Geen groepen beschikbaar.</p>
                      ) : (
                        groepen.map((groep) => (
                          <div key={groep.id || groep.naam} className="border border-slate-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-slate-900">{groep.naam || groep.name}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {libraryTab === 'elementen' && (
                    <div className="space-y-3">
                      {elementCatalog.length === 0 ? (
                        <p className="text-sm text-slate-500">Geen elementen beschikbaar.</p>
                      ) : (
                        elementCatalog.map((element) => {
                          const groepNaam =
                            element.groep_naam ||
                            groepen.find((groep) => groep.id === element.groep_id)?.naam ||
                            groepen.find((groep) => groep.id === element.groep_id)?.name ||
                            'Onbekende groep';
                          const regelCount = element.id ? (regelsByElementId[element.id] || []).length : 0;
                          return (
                            <div key={element.id || element.naam} className="border border-slate-200 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{element.naam}</p>
                                  <p className="text-xs text-slate-500">Groep: {groepNaam}</p>
                                  <p className="text-xs text-slate-500">
                                    Parameter: {element.parameters || 'onbekend'}
                                  </p>
                                  <p className="text-xs text-slate-500">Regels: {regelCount}</p>
                                </div>
                                {element.basis && (
                                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Basis</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">AI voorstellen</h3>
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                  {calculatieElements.length === 0 ? (
                    <p className="text-sm text-slate-500">Geen AI voorstellen gevonden.</p>
                  ) : (
                    calculatieElements.map((proposal) => {
                      const inScope = isProposalInScope(proposal);
                      const matchedElement = resolveElementForEntry(proposal);
                      const parameterValue = proposal.parameter_value ?? '';
                      const hasRules = matchedElement ? (regelsByElementId[matchedElement.id] || []).length > 0 : false;
                      const canApprove = inScope && matchedElement && hasRules && `${parameterValue}`.length > 0;

                      return (
                        <div key={proposal.id} className="border border-slate-200 rounded-lg p-3 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{proposal.element_name}</p>
                              <p className="text-xs text-slate-500">
                                STABU: {proposal.stabu_hoofdstuk || 'onbekend'} {proposal.stabu_subhoofdstuk ? `- ${proposal.stabu_subhoofdstuk}` : ''}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                proposal.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {proposal.status === 'approved' ? 'approved' : 'proposed'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={parameterValue}
                              onChange={(e) => handleProposalParameterChange(proposal.id, e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            />
                            <span className="text-xs text-slate-500">{proposal.parameter_unit || 'unit'}</span>
                          </div>

                          {proposal.motivatie && (
                            <p className="text-xs text-slate-600">{proposal.motivatie}</p>
                          )}

                          {!inScope && (
                            <p className="text-xs text-red-500">Buiten geselecteerde STABU scope.</p>
                          )}
                          {inScope && !matchedElement && (
                            <p className="text-xs text-red-500">Element niet gevonden in bibliotheek.</p>
                          )}
                          {inScope && matchedElement && !hasRules && (
                            <p className="text-xs text-red-500">Normregels ontbreken voor dit element.</p>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApproveProposal(proposal.id)}
                              disabled={!canApprove}
                              className="flex-1 bg-slate-900 text-white text-sm py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              OK bevestigen
                            </button>
                            <button
                              onClick={() => handleResetProposal(proposal.id)}
                              className="flex-1 border border-slate-300 text-slate-600 text-sm py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Actuele calculatie</h3>
                <div className="space-y-3">
                  {calculationSnapshot.elementSummaries.length === 0 ? (
                    <p className="text-sm text-slate-500">Nog geen goedgekeurde elementen.</p>
                  ) : (
                    calculationSnapshot.elementSummaries.map((entry) => (
                      <div key={entry.id} className="border border-slate-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-slate-900">{entry.element_name}</p>
                        <p className="text-xs text-slate-500">Parameter: {entry.parameter_value}</p>
                        <div className="mt-2 space-y-1 text-xs text-slate-600">
                          {entry.regels.length === 0 ? (
                            <p>Geen berekende regels beschikbaar.</p>
                          ) : (
                            entry.regels.map((regel) => (
                              <div key={regel.id} className="flex items-center justify-between">
                                <span>{regel.middel}</span>
                                <span>€ {regel.verkoop.toFixed(2)}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-200 mt-4 pt-4 space-y-1 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Totaal inkoop</span>
                    <span>€ {calculationSnapshot.totals.inkoop.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Totaal verkoop</span>
                    <span>€ {calculationSnapshot.totals.verkoop.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>BTW</span>
                    <span>€ {calculationSnapshot.totals.btw.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
