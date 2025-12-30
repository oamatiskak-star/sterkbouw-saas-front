// pages/inkoop/index.js
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import supabase from "@/lib/supabase"

export default function InkoopPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(false)
  
  // Stabu hoofdstukken (bouwfases)
  const stabuChapters = [
    { id: "A", name: "Voorbereiding en algemeen", description: "Voorbereidende werkzaamheden" },
    { id: "B", name: "Grond- en waterbouw", description: "Grondwerk, fundering, drainage" },
    { id: "C", name: "Beton- en metselwerk", description: "Betonconstructies en metselwerk" },
    { id: "D", name: "Hout- en staalconstructies", description: "Hout- en staalconstructies" },
    { id: "E", name: "Dak- en gevelafwerking", description: "Daken, gevels, isolatie" },
    { id: "F", name: "Binnenafwerking", description: "Afwerking binnenmuren, vloeren" },
    { id: "G", name: "Installatietechniek", description: "Elektra, sanitair, HVAC" },
    { id: "H", name: "Buitenruimte", description: "Bestrating, terreininrichting" },
    { id: "I", name: "Speciale werken", description: "Bijzondere voorzieningen" }
  ]

  // State management
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [orders, setOrders] = useState([])
  const [priceRequests, setPriceRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  
  // AI Price request
  const [priceRequest, setPriceRequest] = useState({
    project_id: "",
    chapter_id: "",
    description: "",
    urgency: "normal",
    deadline: "",
    selected_suppliers: [],
    custom_message: ""
  })

  // Dashboard stats
  const [stats, setStats] = useState({
    activeRequests: 0,
    pendingDecisions: 0,
    costSavings: 0,
    avgResponseTime: 0
  })

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
      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, project_number, status, calculation_data')
        .eq('status', 'active')
        .order('name')

      if (projectsData) setProjects(projectsData)

      // Load suppliers
      const { data: suppliersData } = await supabase
        .from('suppliers')
        .select('*')
        .order('rating', { ascending: false })

      if (suppliersData) setSuppliers(suppliersData)

      // Load price requests
      loadPriceRequests()

      // Load notifications
      loadNotifications()

      // Calculate stats
      calculateStats()

    } catch (error) {
      console.error("Error loading data:", error)
      // Fallback mock data
      setProjects(getMockProjects())
      setSuppliers(getMockSuppliers())
      setPriceRequests(getMockPriceRequests())
      setNotifications(getMockNotifications())
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // REAL-TIME NOTIFICATIONS
  // =========================
  const setupRealtime = () => {
    // Listen for supplier responses
    const channel = supabase
      .channel('supplier-responses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'supplier_responses'
        },
        (payload) => {
          handleNewSupplierResponse(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleNewSupplierResponse = (response) => {
    // Create notification
    const newNotification = {
      id: Date.now(),
      type: 'supplier_response',
      title: 'Nieuwe leveranciersreactie',
      message: `${response.supplier_name} heeft gereageerd op prijsaanvraag ${response.request_id}`,
      data: response,
      read: false,
      created_at: new Date().toISOString()
    }

    setNotifications(prev => [newNotification, ...prev])
    
    // Update price request status
    setPriceRequests(prev => 
      prev.map(req => 
        req.id === response.request_id 
          ? { 
              ...req, 
              responses: [...(req.responses || []), response],
              status: 'responses_received'
            } 
          : req
      )
    )

    // Trigger AI analysis
    analyzeSupplierResponse(response)
  }

  // =========================
  // AI ANALYSE VAN LEVERANCIERS REACTIES
  // =========================
  const analyzeSupplierResponse = async (response) => {
    try {
      // AI analyseert de offerte
      const analysis = {
        request_id: response.request_id,
        supplier_id: response.supplier_id,
        total_price: calculateTotalPrice(response.items),
        unit_prices: analyzeUnitPrices(response.items),
        delivery_time: response.delivery_time,
        payment_terms: response.payment_terms,
        conditions: response.conditions,
        ai_score: calculateAiScore(response),
        ai_recommendation: generateRecommendation(response),
        analyzed_at: new Date().toISOString()
      }

      // Save analysis to database
      await supabase
        .from('price_request_analysis')
        .insert([analysis])

      // Update notification with AI analysis
      setNotifications(prev => prev.map(notif => 
        notif.data?.request_id === response.request_id
          ? {
              ...notif,
              ai_analysis: analysis,
              message: `AI heeft ${response.supplier_name}'s offerte geanalyseerd: ${analysis.ai_recommendation}`
            }
          : notif
      ))

    } catch (error) {
      console.error("AI analysis error:", error)
    }
  }

  // =========================
  // BELANGRIJKE KNOOP: STABU HOOFDSTUK SELECTIE & PRIJSAANVRAAG
  // =========================
  const handleChapterSelection = (projectId, chapterId) => {
    const project = projects.find(p => p.id === projectId)
    const chapter = stabuChapters.find(c => c.id === chapterId)
    
    if (!project || !chapter) {
      alert("Selecteer een project en hoofdstuk")
      return
    }

    setSelectedProject(project)
    setSelectedChapter(chapter)
    
    // Extract materials from project calculation for this chapter
    const chapterMaterials = extractChapterMaterials(project, chapterId)
    
    setPriceRequest(prev => ({
      ...prev,
      project_id: projectId,
      chapter_id: chapterId,
      description: `${project.name} - ${chapter.name}`,
      materials: chapterMaterials
    }))
    
    setActiveTab("price-request")
  }

  // =========================
  // AI GESTUURDE PRIJSAANVRAAG NAAR 5 LEVERANCIERS
  // =========================
  const handleSendPriceRequest = async () => {
    if (!priceRequest.project_id || !priceRequest.chapter_id) {
      alert("Selecteer eerst een project en Stabu hoofdstuk")
      return
    }

    setLoading(true)
    try {
      // AI selects 5 best suppliers for this chapter
      const aiSelectedSuppliers = selectBestSuppliers(priceRequest.chapter_id)
      
      if (aiSelectedSuppliers.length === 0) {
        alert("Geen geschikte leveranciers gevonden voor dit hoofdstuk")
        return
      }

      // Generate unique request ID
      const requestId = `PR-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      
      // Create price request in database
      const { data: newRequest, error } = await supabase
        .from('price_requests')
        .insert([{
          id: requestId,
          project_id: priceRequest.project_id,
          chapter_id: priceRequest.chapter_id,
          description: priceRequest.description,
          materials: priceRequest.materials,
          suppliers: aiSelectedSuppliers,
          status: 'sent',
          sent_via: 'email',
          sent_to: 'inkoop@sterkbouw.nl',
          created_by: (await supabase.auth.getSession()).data.session?.user.id,
          deadline: priceRequest.deadline || getDefaultDeadline(),
          urgency: priceRequest.urgency
        }])
        .select()

      if (error) throw error

      // Send emails to suppliers via AI
      await sendSupplierEmails(requestId, aiSelectedSuppliers, priceRequest)

      // Create notification
      setNotifications(prev => [{
        id: Date.now(),
        type: 'price_request_sent',
        title: 'Prijsaanvraag verzonden',
        message: `AI heeft prijsaanvraag verstuurd naar ${aiSelectedSuppliers.length} leveranciers`,
        data: { requestId, suppliers: aiSelectedSuppliers },
        read: false,
        created_at: new Date().toISOString()
      }, ...prev])

      // Add to price requests list
      setPriceRequests(prev => [newRequest[0], ...prev])

      // Reset form
      setPriceRequest({
        project_id: "",
        chapter_id: "",
        description: "",
        urgency: "normal",
        deadline: "",
        selected_suppliers: [],
        custom_message: ""
      })

      alert(`Prijsaanvraag succesvol verstuurd naar ${aiSelectedSuppliers.length} leveranciers!`)

    } catch (error) {
      console.error("Error sending price request:", error)
      alert("Fout bij versturen prijsaanvraag")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // AI FUNCTIE: BESTE LEVERANCIERS SELECTEREN
  // =========================
  const selectBestSuppliers = (chapterId) => {
    // AI logic to select best suppliers for specific Stabu chapter
    return suppliers
      .filter(supplier => {
        // Match supplier expertise with chapter requirements
        const supplierExpertise = supplier.expertise || []
        const chapterCategories = getChapterCategories(chapterId)
        
        return supplierExpertise.some(expertise => 
          chapterCategories.includes(expertise)
        )
      })
      .sort((a, b) => {
        // Sort by: rating, response time, price competitiveness
        const scoreA = calculateSupplierScore(a)
        const scoreB = calculateSupplierScore(b)
        return scoreB - scoreA
      })
      .slice(0, 5) // Top 5 suppliers
      .map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        contact_person: s.contact_person,
        phone: s.phone
      }))
  }

  // =========================
  // AI FUNCTIE: EMAILS VERSTUREN
  // =========================
  const sendSupplierEmails = async (requestId, suppliers, requestData) => {
    try {
      // Generate personalized email for each supplier
      const emailPromises = suppliers.map(async (supplier) => {
        const emailContent = generateAiEmail(supplier, requestData)
        
        // Save email to database for tracking
        await supabase
          .from('supplier_emails')
          .insert([{
            request_id: requestId,
            supplier_id: supplier.id,
            supplier_email: supplier.email,
            subject: emailContent.subject,
            body: emailContent.body,
            sent_at: new Date().toISOString(),
            status: 'sent'
          }])

        // In production: Send actual email
        // await sendEmail(supplier.email, emailContent.subject, emailContent.body)
        
        console.log(`Email sent to ${supplier.email}`)
      })

      await Promise.all(emailPromises)

    } catch (error) {
      console.error("Error sending emails:", error)
    }
  }

  // =========================
  // BESLISSINGS BORD - LEVERANCIERS VERGELIJKEN
  // =========================
  const DecisionBoard = ({ requestId }) => {
    const request = priceRequests.find(r => r.id === requestId)
    if (!request || !request.responses) return null

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">Beslissingsbord - {request.description}</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Leverancier</th>
                  <th>Totaal Prijs</th>
                  <th>Levertijd</th>
                  <th>Betalingscondities</th>
                  <th>AI Score</th>
                  <th>AI Advies</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {request.responses.map((response, index) => {
                  const analysis = request.ai_analysis?.find(a => a.supplier_id === response.supplier_id)
                  return (
                    <tr key={index}>
                      <td>
                        <strong>{response.supplier_name}</strong>
                        <br />
                        <small className="text-muted">{response.contact_person}</small>
                      </td>
                      <td className="fw-bold">
                        €{calculateTotalPrice(response.items).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                      </td>
                      <td>{response.delivery_time} dagen</td>
                      <td>{response.payment_terms}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${(analysis?.ai_score || 0) * 10}%` }}
                            ></div>
                          </div>
                          <span>{analysis?.ai_score || 0}/10</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${getRecommendationColor(analysis?.ai_recommendation)}`}>
                          {analysis?.ai_recommendation || 'In afwachting'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => handleSelectSupplier(requestId, response.supplier_id)}
                          >
                            <i className="ti ti-check"></i> Selecteren
                          </button>
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => viewSupplierDetails(response.supplier_id)}
                          >
                            <i className="ti ti-eye"></i>
                          </button>
                          <button 
                            className="btn btn-outline-warning"
                            onClick={() => handleNegotiate(requestId, response.supplier_id)}
                          >
                            <i className="ti ti-message"></i> Onderhandelen
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* AI Recommendation Summary */}
          <div className="card mt-4 border-info">
            <div className="card-header bg-info-subtle">
              <h6 className="mb-0">
                <i className="ti ti-robot text-info me-2"></i>
                AI Aanbeveling
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <p className="mb-2">
                    {generateAiRecommendationSummary(request)}
                  </p>
                  <small className="text-muted">
                    Gebaseerd op prijs, kwaliteit, levertijd en historische prestaties
                  </small>
                </div>
                <div className="col-md-4">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={() => handleAcceptAiRecommendation(requestId)}
                  >
                    <i className="ti ti-thumb-up me-2"></i>
                    AI Advies Volgen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================
  // NOTIFICATION CENTER
  // =========================
  const NotificationCenter = () => (
    <div className="dropdown">
      <button 
        className="btn btn-outline-primary position-relative"
        type="button"
        data-bs-toggle="dropdown"
      >
        <i className="ti ti-bell"></i>
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {notifications.filter(n => !n.read).length}
          </span>
        )}
      </button>
      <div className="dropdown-menu dropdown-menu-end p-0" style={{ minWidth: '350px' }}>
        <div className="card border-0">
          <div className="card-header bg-white">
            <h6 className="mb-0">Meldingen</h6>
          </div>
          <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-4">
                <i className="ti ti-bell-off text-muted fs-3"></i>
                <p className="text-muted mb-0">Geen nieuwe meldingen</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`border-bottom p-3 ${!notification.read ? 'bg-light' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="d-flex">
                    <div className={`rounded-circle p-2 me-3 bg-${getNotificationColor(notification.type)}-subtle`}>
                      <i className={`ti ti-${getNotificationIcon(notification.type)} text-${getNotificationColor(notification.type)}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{notification.title}</h6>
                      <p className="text-muted small mb-0">{notification.message}</p>
                      <small className="text-muted">
                        {new Date(notification.created_at).toLocaleString('nl-NL')}
                      </small>
                    </div>
                    {!notification.read && (
                      <div className="ms-2">
                        <span className="badge bg-danger">Nieuw</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="card-footer bg-white text-center">
            <button 
              className="btn btn-link text-decoration-none"
              onClick={() => setActiveTab('notifications')}
            >
              Alle meldingen bekijken
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // =========================
  // MAIN RENDER
  // =========================
  return (
    <Layout>
      <div className="container-fluid px-3 px-lg-4 py-4">
        
        {/* Header with Notification Center */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 mb-2">Inkoop & Bestellingen</h1>
            <p className="text-muted mb-0">
              Beheer prijsaanvragen, leveranciers en bestellingen met AI-ondersteuning
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <NotificationCenter />
            <button 
              className="btn btn-primary"
              onClick={() => setActiveTab('price-request')}
            >
              <i className="ti ti-mail-plus me-2"></i>
              Nieuwe Prijsaanvraag
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-0">
            <ul className="nav nav-tabs nav-tabs-alt">
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
                  onClick={() => setActiveTab("dashboard")}>
                  <i className="ti ti-dashboard me-2"></i>Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "price-request" ? "active" : ""}`}
                  onClick={() => setActiveTab("price-request")}>
                  <i className="ti ti-mail me-2"></i>Prijsaanvragen
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "decisions" ? "active" : ""}`}
                  onClick={() => setActiveTab("decisions")}>
                  <i className="ti ti-gavel me-2"></i>Beslissingen
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
                  onClick={() => setActiveTab("orders")}>
                  <i className="ti ti-package me-2"></i>Bestellingen
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "suppliers" ? "active" : ""}`}
                  onClick={() => setActiveTab("suppliers")}>
                  <i className="ti ti-truck me-2"></i>Leveranciers
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "notifications" ? "active" : ""}`}
                  onClick={() => setActiveTab("notifications")}>
                  <i className="ti ti-bell me-2"></i>Meldingen
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            
            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <div>
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card border-0 bg-primary-subtle">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary text-white rounded-circle p-3 me-3">
                            <i className="ti ti-mail fs-3"></i>
                          </div>
                          <div>
                            <div className="text-muted small">Actieve Prijsaanvragen</div>
                            <div className="h4 mb-0 fw-bold">{stats.activeRequests}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 bg-warning-subtle">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="bg-warning text-white rounded-circle p-3 me-3">
                            <i className="ti ti-clock fs-3"></i>
                          </div>
                          <div>
                            <div className="text-muted small">Beslissingen In Afwachting</div>
                            <div className="h4 mb-0 fw-bold">{stats.pendingDecisions}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 bg-success-subtle">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="bg-success text-white rounded-circle p-3 me-3">
                            <i className="ti ti-discount fs-3"></i>
                          </div>
                          <div>
                            <div className="text-muted small">AI Besparingen</div>
                            <div className="h4 mb-0 fw-bold">€{stats.costSavings.toLocaleString('nl-NL')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 bg-info-subtle">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="bg-info text-white rounded-circle p-3 me-3">
                            <i className="ti ti-report-analytics fs-3"></i>
                          </div>
                          <div>
                            <div className="text-muted small">Gem. Reactietijd</div>
                            <div className="h4 mb-0 fw-bold">{stats.avgResponseTime} uur</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Selectie voor Stabu hoofdstukken */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="ti ti-building me-2"></i>
                      Selecteer Project & Stabu Hoofdstuk voor Cashflow Optimalisatie
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <label className="form-label">Project Selecteren</label>
                        <select 
                          className="form-select mb-3"
                          value={selectedProject?.id || ""}
                          onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value))}
                        >
                          <option value="">Kies een project...</option>
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
                          className="form-select mb-3"
                          value={selectedChapter?.id || ""}
                          onChange={(e) => setSelectedChapter(stabuChapters.find(c => c.id === e.target.value))}
                          disabled={!selectedProject}
                        >
                          <option value="">Kies een Stabu hoofdstuk...</option>
                          {stabuChapters.map(chapter => (
                            <option key={chapter.id} value={chapter.id}>
                              {chapter.id} - {chapter.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {selectedProject && selectedChapter && (
                      <div className="alert alert-info">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">
                              {selectedProject.name} - {selectedChapter.name}
                            </h6>
                            <p className="mb-0">
                              AI kan nu prijsaanvragen sturen naar leveranciers voor dit hoofdstuk.
                              Dit helpt bij cashflow optimalisatie door specifieke onderdelen te versnellen.
                            </p>
                          </div>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleChapterSelection(selectedProject.id, selectedChapter.id)}
                          >
                            <i className="ti ti-send me-2"></i>
                            Prijsaanvraag Starten
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recente Prijsaanvragen */}
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Recente Prijsaanvragen</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Project</th>
                            <th>Stabu</th>
                            <th>Leveranciers</th>
                            <th>Status</th>
                            <th>Deadline</th>
                            <th>Acties</th>
                          </tr>
                        </thead>
                        <tbody>
                          {priceRequests.slice(0, 5).map(request => (
                            <tr key={request.id}>
                              <td>
                                <div className="fw-bold">{request.project?.name}</div>
                                <small className="text-muted">{request.description}</small>
                              </td>
                              <td>
                                <span className="badge bg-info">
                                  {request.chapter_id}
                                </span>
                              </td>
                              <td>
                                <div className="small">
                                  {request.suppliers?.length || 0} leveranciers
                                </div>
                              </td>
                              <td>
                                <span className={`badge bg-${getStatusColor(request.status)}`}>
                                  {getStatusText(request.status)}
                                </span>
                              </td>
                              <td>
                                <small>{new Date(request.deadline).toLocaleDateString('nl-NL')}</small>
                              </td>
                              <td>
                                {request.responses && request.responses.length > 0 ? (
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => setActiveTab('decisions')}
                                  >
                                    <i className="ti ti-gavel me-1"></i>
                                    Beslissen
                                  </button>
                                ) : (
                                  <button className="btn btn-sm btn-outline-secondary" disabled>
                                    In afwachting...
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRIJSAANVRAAG TAB */}
            {activeTab === "price-request" && (
              <PriceRequestForm 
                priceRequest={priceRequest}
                setPriceRequest={setPriceRequest}
                projects={projects}
                stabuChapters={stabuChapters}
                suppliers={suppliers}
                handleSendPriceRequest={handleSendPriceRequest}
                loading={loading}
              />
            )}

            {/* BESLISSINGEN TAB */}
            {activeTab === "decisions" && (
              <div>
                <h5 className="card-title mb-4">
                  <i className="ti ti-gavel text-primary me-2"></i>
                  Beslissingsbord - Leveranciers Vergelijken
                </h5>
                
                {priceRequests.filter(r => r.responses && r.responses.length > 0).length === 0 ? (
                  <div className="text-center py-5">
                    <i className="ti ti-gavel-off text-muted fs-1 mb-3"></i>
                    <h5 className="text-muted">Geen reacties om te beoordelen</h5>
                    <p className="text-muted mb-3">
                      Wacht op reacties van leveranciers of start een nieuwe prijsaanvraag
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setActiveTab('price-request')}
                    >
                      <i className="ti ti-mail-plus me-2"></i>
                      Nieuwe Prijsaanvraag
                    </button>
                  </div>
                ) : (
                  <div>
                    {priceRequests
                      .filter(r => r.responses && r.responses.length > 0)
                      .map(request => (
                        <DecisionBoard key={request.id} requestId={request.id} />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Overige tabs zouden vergelijkbaar zijn met eerdere implementatie */}
            
          </div>
        </div>
      </div>

      <style jsx>{`
        .nav-tabs .nav-link {
          border: none;
          border-bottom: 3px solid transparent;
          color: #6c757d;
          font-weight: 500;
        }
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          border-bottom-color: #0d6efd;
          background-color: transparent;
        }
        .dropdown-menu {
          transform: none !important;
          top: 100% !important;
        }
      `}</style>
    </Layout>
  )
}

// Helper components and functions would be defined here...
