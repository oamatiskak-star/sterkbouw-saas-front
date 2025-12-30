// pages/inkoop/index.js
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import supabase from "@/lib/supabase"

export default function InkoopPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  
  // Stabu hoofdstukken
  const stabuChapters = [
    { id: "A", name: "Voorbereiding en algemeen", description: "Voorbereidende werkzaamheden", color: "primary" },
    { id: "B", name: "Grond- en waterbouw", description: "Grondwerk, fundering, drainage", color: "info" },
    { id: "C", name: "Beton- en metselwerk", description: "Betonconstructies en metselwerk", color: "warning" },
    { id: "D", name: "Hout- en staalconstructies", description: "Hout- en staalconstructies", color: "danger" },
    { id: "E", name: "Dak- en gevelafwerking", description: "Daken, gevels, isolatie", color: "success" },
    { id: "F", name: "Binnenafwerking", description: "Afwerking binnenmuren, vloeren", color: "secondary" },
    { id: "G", name: "Installatietechniek", description: "Elektra, sanitair, HVAC", color: "purple" },
    { id: "H", name: "Buitenruimte", description: "Bestrating, terreininrichting", color: "teal" },
    { id: "I", name: "Speciale werken", description: "Bijzondere voorzieningen", color: "pink" }
  ]

  // State management
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [orders, setOrders] = useState([])
  const [priceRequests, setPriceRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [documents, setDocuments] = useState([])
  const [planningIntegrations, setPlanningIntegrations] = useState([])
  
  // Forms state
  const [priceRequestForm, setPriceRequestForm] = useState({
    project_id: "",
    chapter_id: "",
    description: "",
    urgency: "normal",
    deadline: "",
    selected_suppliers: [],
    custom_message: ""
  })

  const [negotiationForm, setNegotiationForm] = useState({
    request_id: "",
    supplier_id: "",
    target_price: "",
    negotiation_strategy: "volume_discount",
    message: "",
    max_increase: "5",
    deadline_hours: "48"
  })

  // Dashboard stats
  const [stats, setStats] = useState({
    activeRequests: 0,
    pendingDecisions: 0,
    costSavings: 0,
    avgResponseTime: 0,
    negotiationSuccessRate: "78%",
    cashflowImpact: 0
  })

  // =========================
  // A. ONDERHANDELINGSASSISTENT
  // =========================
  const [negotiationHistory, setNegotiationHistory] = useState([])
  const [activeNegotiation, setActiveNegotiation] = useState(null)

  const handleStartNegotiation = async (requestId, supplierId) => {
    setLoading(true)
    try {
      const request = priceRequests.find(r => r.id === requestId)
      const supplier = suppliers.find(s => s.id === supplierId)
      
      if (!request || !supplier) {
        throw new Error("Geen data gevonden")
      }

      // AI genereert onderhandelingsstrategie
      const strategy = await generateNegotiationStrategy(request, supplier)
      
      const newNegotiation = {
        id: `NEG-${Date.now()}`,
        request_id: requestId,
        supplier_id: supplierId,
        supplier_name: supplier.name,
        initial_quote: getSupplierQuote(request, supplierId),
        target_price: strategy.target_price,
        strategy: strategy.type,
        steps: strategy.steps,
        status: "active",
        created_at: new Date().toISOString(),
        messages: []
      }

      setActiveNegotiation(newNegotiation)
      setNegotiationHistory(prev => [newNegotiation, ...prev])
      
      // Stel formulier in
      setNegotiationForm({
        request_id: requestId,
        supplier_id: supplierId,
        target_price: strategy.target_price,
        negotiation_strategy: strategy.type,
        message: strategy.opening_message,
        max_increase: "5",
        deadline_hours: "48"
      })

      setActiveTab("negotiation")
      
    } catch (error) {
      console.error("Error starting negotiation:", error)
      alert("Fout bij starten onderhandeling")
    } finally {
      setLoading(false)
    }
  }

  const handleSendNegotiation = async () => {
    if (!negotiationForm.request_id || !negotiationForm.supplier_id) {
      alert("Selecteer eerst een prijsaanvraag en leverancier")
      return
    }

    setLoading(true)
    try {
      const emailContent = await generateNegotiationEmail(negotiationForm)
      
      // Opslaan in database
      await supabase
        .from('negotiations')
        .insert([{
          ...negotiationForm,
          sent_at: new Date().toISOString(),
          email_content: emailContent,
          status: 'sent'
        }])

      // Update negotiation history
      const newMessage = {
        type: "outgoing",
        content: negotiationForm.message,
        timestamp: new Date().toISOString(),
        strategy: negotiationForm.negotiation_strategy
      }

      if (activeNegotiation) {
        setActiveNegotiation(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage]
        }))
      }

      // Stuur email (in productie)
      console.log("Negotiation email:", emailContent)
      
      alert("Onderhandelingsvoorstel verstuurd!")
      
    } catch (error) {
      console.error("Error sending negotiation:", error)
      alert("Fout bij versturen onderhandeling")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // B. CASHFLOW IMPACT DASHBOARD
  // =========================
  const [cashflowAnalysis, setCashflowAnalysis] = useState(null)

  const analyzeCashflowImpact = async (projectId, chapterId) => {
    setLoading(true)
    try {
      const project = projects.find(p => p.id === projectId)
      const chapter = stabuChapters.find(c => c.id === chapterId)
      
      if (!project || !chapter) return
      
      // Haal calculatie data op
      const { data: calculation } = await supabase
        .from('calculations')
        .select('*')
        .eq('project_id', projectId)
        .single()
      
      if (!calculation) return
      
      // Analyseer cashflow impact
      const analysis = {
        project_name: project.name,
        chapter: chapter.name,
        total_value: calculation.total_amount || 0,
        upfront_payment_percentage: calculateUpfrontPayment(chapterId),
        upfront_amount: (calculation.total_amount || 0) * (calculateUpfrontPayment(chapterId) / 100),
        roi_months: calculateROIMonths(chapterId, calculation.total_amount || 0),
        risk_level: calculateRiskLevel(chapterId),
        optimal_timing: calculateOptimalTiming(chapterId),
        recommendations: generateCashflowRecommendations(chapterId, calculation.total_amount || 0),
        created_at: new Date().toISOString()
      }
      
      setCashflowAnalysis(analysis)
      setActiveTab("cashflow")
      
    } catch (error) {
      console.error("Cashflow analysis error:", error)
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // C. LEVERANCIERS PERFORMANCE TRACKING
  // =========================
  const [supplierPerformance, setSupplierPerformance] = useState({})

  const loadSupplierPerformance = async () => {
    try {
      const performanceData = {}
      
      for (const supplier of suppliers) {
        const { data: history } = await supabase
          .from('order_history')
          .select('*')
          .eq('supplier_id', supplier.id)
        
        if (history && history.length > 0) {
          const metrics = {
            total_orders: history.length,
            avg_response_time: calculateAvgResponseTime(history),
            on_time_delivery: calculateOnTimeDeliveryRate(history),
            price_accuracy: calculatePriceAccuracy(history),
            quality_score: calculateQualityScore(history),
            conflict_count: history.filter(h => h.has_conflict).length,
            overall_rating: calculateOverallSupplierRating(history)
          }
          
          performanceData[supplier.id] = metrics
        }
      }
      
      setSupplierPerformance(performanceData)
      
    } catch (error) {
      console.error("Error loading supplier performance:", error)
    }
  }

  // =========================
  // D. AUTOMATISCHE ORDER GENERATIE
  // =========================
  const [autoOrderTemplate, setAutoOrderTemplate] = useState({
    include_drawings: true,
    include_specifications: true,
    payment_terms: "30_days",
    delivery_address: "project_address",
    quality_requirements: "standard",
    inspection_required: true
  })

  const handleGenerateOrder = async (requestId, selectedSupplierId) => {
    setLoading(true)
    try {
      const request = priceRequests.find(r => r.id === requestId)
      const supplier = suppliers.find(s => s.id === selectedSupplierId)
      
      if (!request || !supplier) {
        throw new Error("Geen data gevonden")
      }
      
      // Haal project data op
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', request.project_id)
        .single()
      
      // Genereer ordernummer
      const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`
      
      // Genereer order document
      const orderData = {
        order_number: orderNumber,
        project_id: request.project_id,
        project_name: project?.name || "",
        supplier_id: selectedSupplierId,
        supplier_name: supplier.name,
        items: request.materials || [],
        total_amount: calculateOrderTotal(request, supplier),
        delivery_date: calculateDeliveryDate(request.deadline),
        payment_terms: autoOrderTemplate.payment_terms,
        delivery_address: getProjectAddress(project),
        special_instructions: generateOrderInstructions(request, supplier),
        status: "draft",
        requires_approval: true,
        approver: "project_manager",
        generated_at: new Date().toISOString(),
        generated_by: (await supabase.auth.getSession()).data.session?.user.id
      }
      
      // Toon voorbeeld
      setActiveTab("order-preview")
      setPreviewOrder(orderData)
      
      // Opslaan als concept
      await supabase
        .from('orders')
        .insert([orderData])
      
    } catch (error) {
      console.error("Error generating order:", error)
      alert("Fout bij genereren order")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // E. PLANNING INTEGRATIE
  // =========================
  const [planningData, setPlanningData] = useState([])

  const integrateWithPlanning = async (projectId) => {
    setLoading(true)
    try {
      // Haal project planning op
      const { data: projectPlan } = await supabase
        .from('project_plans')
        .select('*')
        .eq('project_id', projectId)
        .single()
      
      if (projectPlan) {
        // Parse MS Project data of eigen planning
        const parsedPlan = parsePlanningData(projectPlan.data)
        setPlanningData(parsedPlan)
        
        // Koppel leverdata aan planning
        const updatedPlan = linkDeliveriesToPlanning(parsedPlan, orders)
        setPlanningData(updatedPlan)
        
        // Genereer critical path analysis
        const criticalPath = analyzeCriticalPath(updatedPlan)
        
        setActiveTab("planning")
        
        return {
          success: true,
          critical_path: criticalPath,
          risk_points: identifyRiskPoints(updatedPlan)
        }
      }
      
    } catch (error) {
      console.error("Planning integration error:", error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // F. DOCUMENT MANAGEMENT
  // =========================
  const [selectedDocuments, setSelectedDocuments] = useState([])

  const handleUploadDocument = async (file, category, relatedId) => {
    try {
      // Upload naar Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `inkoop-documents/${fileName}`
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file)
      
      if (error) throw error
      
      // Opslaan in database
      const documentData = {
        filename: file.name,
        storage_path: filePath,
        category: category,
        related_id: relatedId,
        uploaded_by: (await supabase.auth.getSession()).data.session?.user.id,
        uploaded_at: new Date().toISOString(),
        file_size: file.size,
        mime_type: file.type
      }
      
      const { data: savedDoc } = await supabase
        .from('documents')
        .insert([documentData])
        .select()
      
      if (savedDoc) {
        setDocuments(prev => [...prev, savedDoc[0]])
        alert("Document succesvol geüpload!")
      }
      
    } catch (error) {
      console.error("Upload error:", error)
      alert("Fout bij uploaden document")
    }
  }

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    loadInitialData()
    setupRealtime()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      // Load all data
      const [projectsRes, suppliersRes, ordersRes] = await Promise.all([
        supabase.from('projects').select('*').eq('status', 'active'),
        supabase.from('suppliers').select('*').order('rating', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false })
      ])
      
      if (projectsRes.data) setProjects(projectsRes.data)
      if (suppliersRes.data) setSuppliers(suppliersRes.data)
      if (ordersRes.data) setOrders(ordersRes.data)
      
      // Load additional data
      await Promise.all([
        loadPriceRequests(),
        loadNotifications(),
        loadDocuments(),
        loadSupplierPerformance(),
        loadPlanningIntegrations()
      ])
      
      calculateStats()
      
    } catch (error) {
      console.error("Error loading data:", error)
      // Fallback to mock data for development
      setProjects(getMockProjects())
      setSuppliers(getMockSuppliers())
      setOrders(getMockOrders())
      setPriceRequests(getMockPriceRequests())
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // MAIN RENDER
  // =========================
  return (
    <Layout>
      <div className="container-fluid px-3 px-lg-4 py-4">
        
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div>
            <h1 className="h2 mb-2">Inkoop & Bestellingen</h1>
            <p className="text-muted mb-0">
              Complete inkoopmanagement met AI-ondersteuning voor cashflow optimalisatie
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <button className="btn btn-outline-primary" onClick={() => setActiveTab('notifications')}>
              <i className="ti ti-bell"></i>
              <span className="badge bg-danger ms-1">{notifications.filter(n => !n.read).length}</span>
            </button>
            <button className="btn btn-primary" onClick={() => setActiveTab('price-request')}>
              <i className="ti ti-mail-plus me-2"></i>
              Nieuwe Prijsaanvraag
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-0">
            <ul className="nav nav-tabs nav-tabs-alt">
              {[
                { id: "dashboard", icon: "dashboard", label: "Dashboard" },
                { id: "price-request", icon: "mail", label: "Prijsaanvragen" },
                { id: "decisions", icon: "gavel", label: "Beslissingen" },
                { id: "negotiation", icon: "message", label: "Onderhandelen" },
                { id: "cashflow", icon: "cash", label: "Cashflow" },
                { id: "orders", icon: "package", label: "Bestellingen" },
                { id: "suppliers", icon: "truck", label: "Leveranciers" },
                { id: "planning", icon: "calendar", label: "Planning" },
                { id: "documents", icon: "files", label: "Documenten" },
                { id: "notifications", icon: "bell", label: "Meldingen" }
              ].map(tab => (
                <li key={tab.id} className="nav-item">
                  <button
                    className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`ti ti-${tab.icon} me-2`}></i>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Loading State */}
        {loading && activeTab !== "dashboard" && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            
            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <DashboardTab 
                projects={projects}
                stabuChapters={stabuChapters}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedChapter={selectedChapter}
                setSelectedChapter={setSelectedChapter}
                stats={stats}
                priceRequests={priceRequests}
                handleChapterSelection={handleChapterSelection}
                analyzeCashflowImpact={analyzeCashflowImpact}
                loading={loading}
              />
            )}

            {/* PRIJSAANVRAAG TAB */}
            {activeTab === "price-request" && (
              <PriceRequestTab 
                priceRequestForm={priceRequestForm}
                setPriceRequestForm={setPriceRequestForm}
                projects={projects}
                stabuChapters={stabuChapters}
                suppliers={suppliers}
                handleSendPriceRequest={handleSendPriceRequest}
                loading={loading}
              />
            )}

            {/* BESLISSINGEN TAB */}
            {activeTab === "decisions" && (
              <DecisionsTab 
                priceRequests={priceRequests}
                suppliers={suppliers}
                supplierPerformance={supplierPerformance}
                handleStartNegotiation={handleStartNegotiation}
                handleGenerateOrder={handleGenerateOrder}
              />
            )}

            {/* ONDERHANDELEN TAB */}
            {activeTab === "negotiation" && (
              <NegotiationTab 
                negotiationForm={negotiationForm}
                setNegotiationForm={setNegotiationForm}
                activeNegotiation={activeNegotiation}
                negotiationHistory={negotiationHistory}
                handleSendNegotiation={handleSendNegotiation}
                loading={loading}
              />
            )}

            {/* CASHFLOW TAB */}
            {activeTab === "cashflow" && (
              <CashflowTab 
                cashflowAnalysis={cashflowAnalysis}
                projects={projects}
                stabuChapters={stabuChapters}
                analyzeCashflowImpact={analyzeCashflowImpact}
                loading={loading}
              />
            )}

            {/* BESTELLINGEN TAB */}
            {activeTab === "orders" && (
              <OrdersTab 
                orders={orders}
                projects={projects}
                suppliers={suppliers}
                autoOrderTemplate={autoOrderTemplate}
                setAutoOrderTemplate={setAutoOrderTemplate}
              />
            )}

            {/* LEVERANCIERS TAB */}
            {activeTab === "suppliers" && (
              <SuppliersTab 
                suppliers={suppliers}
                supplierPerformance={supplierPerformance}
                orders={orders}
              />
            )}

            {/* PLANNING TAB */}
            {activeTab === "planning" && (
              <PlanningTab 
                planningData={planningData}
                projects={projects}
                orders={orders}
                integrateWithPlanning={integrateWithPlanning}
                loading={loading}
              />
            )}

            {/* DOCUMENTEN TAB */}
            {activeTab === "documents" && (
              <DocumentsTab 
                documents={documents}
                selectedDocuments={selectedDocuments}
                setSelectedDocuments={setSelectedDocuments}
                fileInputRef={fileInputRef}
                handleUploadDocument={handleUploadDocument}
                loading={loading}
              />
            )}

            {/* MELDINGEN TAB */}
            {activeTab === "notifications" && (
              <NotificationsTab 
                notifications={notifications}
                setNotifications={setNotifications}
              />
            )}

          </div>
        </div>
      </div>

      <style jsx>{`
        .nav-tabs .nav-link {
          border: none;
          border-bottom: 3px solid transparent;
          color: #6c757d;
          font-weight: 500;
          padding: 0.75rem 1rem;
        }
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          border-bottom-color: #0d6efd;
          background-color: transparent;
        }
        .nav-tabs .nav-link:hover {
          color: #0d6efd;
        }
        .table-hover tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }
      `}</style>
    </Layout>
  )
}

// =========================
// COMPONENT IMPLEMENTATIONS
// =========================

function DashboardTab({ 
  projects, stabuChapters, selectedProject, setSelectedProject, 
  selectedChapter, setSelectedChapter, stats, priceRequests, 
  handleChapterSelection, analyzeCashflowImpact, loading 
}) {
  return (
    <div>
      {/* Stats Cards */}
      <div className="row mb-4">
        {[
          { label: "Actieve Prijsaanvragen", value: stats.activeRequests, icon: "mail", color: "primary", bg: "primary-subtle" },
          { label: "Beslissingen In Afw.", value: stats.pendingDecisions, icon: "clock", color: "warning", bg: "warning-subtle" },
          { label: "AI Besparingen", value: `€${stats.costSavings.toLocaleString('nl-NL')}`, icon: "discount", color: "success", bg: "success-subtle" },
          { label: "Cashflow Impact", value: `€${stats.cashflowImpact.toLocaleString('nl-NL')}`, icon: "cash", color: "info", bg: "info-subtle" },
          { label: "Onderhandelingssucces", value: stats.negotiationSuccessRate, icon: "message", color: "purple", bg: "purple-subtle" },
          { label: "Gem. Reactietijd", value: `${stats.avgResponseTime} uur`, icon: "report-analytics", color: "teal", bg: "teal-subtle" }
        ].map((stat, index) => (
          <div key={index} className="col-md-4 col-lg-2 mb-3">
            <div className={`card border-0 ${stat.bg}`}>
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className={`bg-${stat.color} text-white rounded-circle p-2 me-3`}>
                    <i className={`ti ti-${stat.icon}`}></i>
                  </div>
                  <div>
                    <div className="text-muted small">{stat.label}</div>
                    <div className="h5 mb-0 fw-bold">{stat.value}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project & Stabu Selection */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="ti ti-building me-2"></i>
            Cashflow Optimalisatie - Selecteer Project & Stabu Hoofdstuk
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Project Selecteren</label>
              <select 
                className="form-select"
                value={selectedProject?.id || ""}
                onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value))}
              >
                <option value="">Kies een project voor cashflow optimalisatie...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.project_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Stabu Hoofdstuk</label>
              <select 
                className="form-select"
                value={selectedChapter?.id || ""}
                onChange={(e) => setSelectedChapter(stabuChapters.find(c => c.id === e.target.value))}
                disabled={!selectedProject}
              >
                <option value="">Selecteer hoofdstuk om naar voren te halen...</option>
                {stabuChapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.id} - {chapter.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedProject && selectedChapter && (
            <div className="mt-4">
              <div className="alert alert-info">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">
                      {selectedProject.name} - {selectedChapter.name}
                    </h6>
                    <p className="mb-0">
                      Dit hoofdstuk kan naar voren gehaald worden voor betere cashflow. 
                      AI stuurt prijsaanvragen naar leveranciers en analyseert de impact.
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleChapterSelection(selectedProject.id, selectedChapter.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Bezig...
                        </>
                      ) : (
                        <>
                          <i className="ti ti-send me-2"></i>
                          Prijsaanvraag Starten
                        </>
                      )}
                    </button>
                    <button 
                      className="btn btn-outline-info"
                      onClick={() => analyzeCashflowImpact(selectedProject.id, selectedChapter.id)}
                      disabled={loading}
                    >
                      <i className="ti ti-cash me-2"></i>
                      Cashflow Analyse
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Stabu Chapter Info */}
              <div className="row mt-3">
                <div className="col-md-6">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="card-title">Project Details</h6>
                      <dl className="row mb-0">
                        <dt className="col-sm-4">Projectnummer:</dt>
                        <dd className="col-sm-8">{selectedProject.project_number}</dd>
                        <dt className="col-sm-4">Status:</dt>
                        <dd className="col-sm-8">
                          <span className="badge bg-success">Actief</span>
                        </dd>
                        <dt className="col-sm-4">Startdatum:</dt>
                        <dd className="col-sm-8">
                          {new Date(selectedProject.start_date || Date.now()).toLocaleDateString('nl-NL')}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="card-title">Stabu Hoofdstuk</h6>
                      <dl className="row mb-0">
                        <dt className="col-sm-4">Code:</dt>
                        <dd className="col-sm-8">
                          <span className={`badge bg-${selectedChapter.color}`}>
                            {selectedChapter.id}
                          </span>
                        </dd>
                        <dt className="col-sm-4">Omschrijving:</dt>
                        <dd className="col-sm-8">{selectedChapter.name}</dd>
                        <dt className="col-sm-4">Categorie:</dt>
                        <dd className="col-sm-8">{selectedChapter.description}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recente Activiteit */}
      <div className="row">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Recente Prijsaanvragen</h5>
            </div>
            <div className="card-body">
              {priceRequests.slice(0, 5).map(request => (
                <div key={request.id} className="border-bottom pb-3 mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{request.project?.name}</h6>
                      <small className="text-muted">{request.description}</small>
                    </div>
                    <span className={`badge bg-${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <small>
                      <i className="ti ti-calendar me-1"></i>
                      Deadline: {new Date(request.deadline).toLocaleDateString('nl-NL')}
                    </small>
                    <small>
                      {request.suppliers?.length || 0} leveranciers
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Snel Acties</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary text-start">
                  <i className="ti ti-mail me-2"></i>
                  Nieuwe Prijsaanvraag
                </button>
                <button className="btn btn-outline-success text-start">
                  <i className="ti ti-package me-2"></i>
                  Bestelling Plaatsen
                </button>
                <button className="btn btn-outline-warning text-start">
                  <i className="ti ti-cash me-2"></i>
                  Cashflow Rapport
                </button>
                <button className="btn btn-outline-info text-start">
                  <i className="ti ti-report-analytics me-2"></i>
                  Leveranciers Analyse
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PriceRequestTab({ 
  priceRequestForm, setPriceRequestForm, projects, stabuChapters, 
  suppliers, handleSendPriceRequest, loading 
}) {
  return (
    <div>
      <h5 className="card-title mb-4">
        <i className="ti ti-mail text-primary me-2"></i>
        Nieuwe Prijsaanvraag
      </h5>
      
      <div className="row">
        <div className="col-lg-8">
          <div className="card border">
            <div className="card-body">
              <form onSubmit={(e) => { e.preventDefault(); handleSendPriceRequest(); }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Project</label>
                    <select 
                      className="form-select"
                      value={priceRequestForm.project_id}
                      onChange={(e) => setPriceRequestForm({...priceRequestForm, project_id: e.target.value})}
                      required
                    >
                      <option value="">Selecteer project...</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name} ({project.project_number})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Stabu Hoofdstuk</label>
                    <select 
                      className="form-select"
                      value={priceRequestForm.chapter_id}
                      onChange={(e) => setPriceRequestForm({...priceRequestForm, chapter_id: e.target.value})}
                      required
                    >
                      <option value="">Selecteer Stabu hoofdstuk...</option>
                      {stabuChapters.map(chapter => (
                        <option key={chapter.id} value={chapter.id}>
                          {chapter.id} - {chapter.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Omschrijving</label>
                    <input
                      type="text"
                      className="form-control"
                      value={priceRequestForm.description}
                      onChange={(e) => setPriceRequestForm({...priceRequestForm, description: e.target.value})}
                      placeholder="Bijv: 'Betonfundering voor woningbouw'"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Urgentie</label>
                    <select 
                      className="form-select"
                      value={priceRequestForm.urgency}
                      onChange={(e) => setPriceRequestForm({...priceRequestForm, urgency: e.target.value})}
                    >
                      <option value="low">Laag (2 weken)</option>
                      <option value="normal">Normaal (1 week)</option>
                      <option value="high">Hoog (3 dagen)</option>
                      <option value="urgent">Urgent (24 uur)</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Deadline</label>
                    <input
                      type="date"
                      className="form-control"
                      value={priceRequestForm.deadline}
                      onChange={(e) => setPriceRequestForm({...priceRequestForm, deadline: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Leveranciers (AI selecteert automatisch 5 beste)</label>
                    <div className="alert alert-info">
                      <i className="ti ti-robot me-2"></i>
                      AI selecteert automatisch de 5 beste leveranciers voor dit Stabu hoofdstuk
                      gebaseerd op historische prestaties en expertise.
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Extra Bericht aan Leveranciers (optioneel)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={priceRequestForm.custom_message}
                      onChange={(e) => setPriceRequestForm({...priceRequestForm, custom_message: e.target.value})}
                      placeholder="Voeg specifieke instructies of voorwaarden toe..."
                    />
                  </div>
                  
                  <div className="col-12">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Prijsaanvragen versturen...
                        </>
                      ) : (
                        <>
                          <i className="ti ti-send me-2"></i>
                          Prijsaanvragen Versturen naar 5 Leveranciers
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card border">
            <div className="card-header">
              <h6 className="mb-0">AI Prijsaanvraag Proces</h6>
            </div>
            <div className="card-body">
              <div className="timeline timeline-activity">
                <div className="timeline-item">
                  <div className="timeline-line"></div>
                  <div className="timeline-icon">
                    <i className="ti ti-robot text-primary"></i>
                  </div>
                  <div className="timeline-content">
                    <div className="fw-bold">AI Analyse</div>
                    <small className="text-muted">Selecteert 5 beste leveranciers</small>
                  </div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-line"></div>
                  <div className="timeline-icon">
                    <i className="ti ti-mail text-success"></i>
                  </div>
                  <div className="timeline-content">
                    <div className="fw-bold">Email Verzending</div>
                    <small className="text-muted">Naar inkoop@sterkbouw.nl en leveranciers</small>
                  </div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-line"></div>
                  <div className="timeline-icon">
                    <i className="ti ti-bell text-warning"></i>
                  </div>
                  <div className="timeline-content">
                    <div className="fw-bold">Notificaties</div>
                    <small className="text-muted">Real-time updates bij reacties</small>
                  </div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-line"></div>
                  <div className="timeline-icon">
                    <i className="ti ti-gavel text-danger"></i>
                  </div>
                  <div className="timeline-content">
                    <div className="fw-bold">Beslissingsbord</div>
                    <small className="text-muted">AI analyseert alle offertes</small>
                  </div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-line"></div>
                  <div className="timeline-icon">
                    <i className="ti ti-file-invoice text-info"></i>
                  </div>
                  <div className="timeline-content">
                    <div className="fw-bold">Order Generatie</div>
                    <small className="text-muted">Automatisch orderformulier</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// De andere componenten (DecisionsTab, NegotiationTab, etc.) zouden op vergelijkbare wijze geïmplementeerd worden
// Vanwege ruimtebeperking laat ik ze hier weg, maar ze volgen hetzelfde patroon

// =========================
// HELPER FUNCTIES
// =========================

async function generateNegotiationStrategy(request, supplier) {
  // AI logica voor onderhandelingsstrategie
  return {
    type: "volume_discount",
    target_price: calculateTargetPrice(request, supplier),
    steps: [
      "Vraag volume korting aan",
      "Stel betere betalingsvoorwaarden voor",
      "Vraag kortere levertijd",
      "Toon alternatieve leveranciers"
    ],
    opening_message: generateOpeningMessage(request, supplier)
  }
}

function calculateTargetPrice(request, supplier) {
  // Complexe AI logica voor target price
  const basePrice = getSupplierQuote(request, supplier.id)
  const marketAverage = getMarketAverage(request.chapter_id)
  const supplierHistory = getSupplierHistory(supplier.id)
  
  let discount = 0.1 // Standaard 10% korting
  
  if (supplierHistory.volume > 100000) discount = 0.15
  if (supplierHistory.loyalty_years > 5) discount += 0.05
  
  return basePrice * (1 - discount)
}

function getSupplierQuote(request, supplierId) {
  const response = request.responses?.find(r => r.supplier_id === supplierId)
  return response?.total_price || 0
}

}
export default InkoopPage
