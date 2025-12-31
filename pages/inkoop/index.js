// pages/inkoop/index.js
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import supabase from "@/lib/supabase"

// =========================
// SUB-COMPONENTS
// =========================
import DashboardTab from "@/components/inkoop/DashboardTab"
import PriceRequestTab from "@/components/inkoop/PriceRequestTab"
import DecisionsTab from "@/components/inkoop/DecisionsTab"
import NegotiationTab from "@/components/inkoop/NegotiationTab"
import CashflowTab from "@/components/inkoop/CashflowTab"
import OrdersTab from "@/components/inkoop/OrdersTab"
import SuppliersTab from "@/components/inkoop/SuppliersTab"
import PlanningTab from "@/components/inkoop/PlanningTab"
import DocumentsTab from "@/components/inkoop/DocumentsTab"
import NotificationsTab from "@/components/inkoop/NotificationsTab"

// =========================
// HELPER FUNCTIES
// =========================
import {
  getSupplierQuote,
  calculateTargetPrice,
  generateNegotiationStrategy,
  calculateUpfrontPayment,
  calculateROIMonths,
  calculateRiskLevel,
  calculateOptimalTiming,
  generateCashflowRecommendations,
  calculateAvgResponseTime,
  calculateOnTimeDeliveryRate,
  calculatePriceAccuracy,
  calculateQualityScore,
  calculateOverallSupplierRating,
  calculateOrderTotal,
  calculateDeliveryDate,
  getProjectAddress,
  generateOrderInstructions,
  parsePlanningData,
  linkDeliveriesToPlanning,
  analyzeCriticalPath,
  identifyRiskPoints,
  getStatusColor,
  getStatusText,
  getMockProjects,
  getMockSuppliers,
  getMockOrders,
  getMockPriceRequests,
  generateNegotiationEmail,
  generateOpeningMessage,
  getMarketAverage,
  getSupplierHistory
} from "@/lib/inkoop/helpers"

// =========================
// HOOFD COMPONENT
// =========================
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

  const [previewOrder, setPreviewOrder] = useState(null)

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

  // =========================
  // B. CASHFLOW IMPACT DASHBOARD
  // =========================
  const [cashflowAnalysis, setCashflowAnalysis] = useState(null)

  // =========================
  // C. LEVERANCIERS PERFORMANCE TRACKING
  // =========================
  const [supplierPerformance, setSupplierPerformance] = useState({})

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

  // =========================
  // E. PLANNING INTEGRATIE
  // =========================
  const [planningData, setPlanningData] = useState([])

  // =========================
  // F. DOCUMENT MANAGEMENT
  // =========================
  const [selectedDocuments, setSelectedDocuments] = useState([])

  // =========================
  // HANDLER FUNCTIES
  // =========================
  const handleChapterSelection = async (projectId, chapterId) => {
    setLoading(true)
    try {
      const project = projects.find(p => p.id === projectId)
      const chapter = stabuChapters.find(c => c.id === chapterId)
      
      if (!project || !chapter) return
      
      // Stel prijsaanvraag formulier in
      setPriceRequestForm({
        ...priceRequestForm,
        project_id: projectId,
        chapter_id: chapterId,
        description: `${chapter.name} voor ${project.name}`,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 dagen van nu
      })
      
      setActiveTab("price-request")
      
    } catch (error) {
      console.error("Error selecting chapter:", error)
      alert("Fout bij selecteren hoofdstuk")
    } finally {
      setLoading(false)
    }
  }

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

  const handleSendPriceRequest = async () => {
    setLoading(true)
    try {
      if (!priceRequestForm.project_id || !priceRequestForm.chapter_id) {
        alert("Selecteer een project en Stabu hoofdstuk")
        return
      }

      // AI selecteert automatisch 5 beste leveranciers
      const selectedSuppliers = suppliers.slice(0, 5).map(s => s.id)
      
      const priceRequestData = {
        ...priceRequestForm,
        selected_suppliers: selectedSuppliers,
        status: "sent",
        sent_at: new Date().toISOString(),
        created_by: (await supabase.auth.getSession()).data.session?.user.id
      }

      // Opslaan in database
      const { data, error } = await supabase
        .from('price_requests')
        .insert([priceRequestData])
        .select()

      if (error) throw error

      if (data) {
        setPriceRequests(prev => [data[0], ...prev])
        alert("Prijsaanvraag succesvol verzonden!")
        setPriceRequestForm({
          project_id: "",
          chapter_id: "",
          description: "",
          urgency: "normal",
          deadline: "",
          selected_suppliers: [],
          custom_message: ""
        })
      }

    } catch (error) {
      console.error("Error sending price request:", error)
      alert("Fout bij verzenden prijsaanvraag")
    } finally {
      setLoading(false)
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

  const loadPriceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('price_requests')
        .select(`
          *,
          project:projects(name, project_number),
          responses:price_responses(*)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setPriceRequests(data)
    } catch (error) {
      console.error("Error loading price requests:", error)
    }
  }

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'inkoop')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) throw error
      if (data) setNotifications(data)
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('category', 'inkoop')
        .order('uploaded_at', { ascending: false })
      
      if (error) throw error
      if (data) setDocuments(data)
    } catch (error) {
      console.error("Error loading documents:", error)
    }
  }

  const loadPlanningIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('planning_integrations')
        .select('*')
        .order('last_sync', { ascending: false })
      
      if (error) throw error
      if (data) setPlanningIntegrations(data)
    } catch (error) {
      console.error("Error loading planning integrations:", error)
    }
  }

  const setupRealtime = () => {
    // Real-time subscriptions
    const priceRequestChannel = supabase
      .channel('price_requests')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'price_requests' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPriceRequests(prev => [payload.new, ...prev])
          }
          if (payload.eventType === 'UPDATE') {
            setPriceRequests(prev => prev.map(req => 
              req.id === payload.new.id ? payload.new : req
            ))
          }
        }
      )
      .subscribe()

    return () => {
      priceRequestChannel.unsubscribe()
    }
  }

  const calculateStats = () => {
    const activeRequests = priceRequests.filter(req => 
      ['sent', 'received', 'in_review'].includes(req.status)
    ).length
    
    const pendingDecisions = priceRequests.filter(req => 
      req.status === 'received' && req.responses && req.responses.length > 0
    ).length
    
    const costSavings = orders.reduce((total, order) => {
      const savings = order.negotiated_savings || 0
      return total + savings
    }, 0)
    
    const avgResponseTime = priceRequests.length > 0 
      ? priceRequests.reduce((total, req) => {
          if (req.responses && req.responses.length > 0) {
            const responseTime = req.responses.reduce((sum, res) => {
              const sentTime = new Date(req.sent_at)
              const responseTime = new Date(res.received_at)
              const hours = (responseTime - sentTime) / (1000 * 60 * 60)
              return sum + hours
            }, 0) / req.responses.length
            return total + responseTime
          }
          return total
        }, 0) / priceRequests.length
      : 0
    
    const cashflowImpact = calculateCashflowImpact()
    
    setStats({
      activeRequests,
      pendingDecisions,
      costSavings,
      avgResponseTime: Math.round(avgResponseTime),
      negotiationSuccessRate: "78%",
      cashflowImpact
    })
  }

  const calculateCashflowImpact = () => {
    // Vereenvoudigde berekening voor demo
    let impact = 0
    
    // Bereken cashflow impact van openstaande bestellingen
    orders.forEach(order => {
      if (order.status === 'pending' || order.status === 'confirmed') {
        impact += order.total_amount || 0
      }
    })
    
    // Trek voorschotten af
    priceRequests.forEach(request => {
      if (request.upfront_payment) {
        impact -= request.upfront_payment
      }
    })
    
    return Math.round(impact)
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
            <button 
              className="btn btn-outline-primary" 
              onClick={() => setActiveTab('notifications')}
            >
              <i className="ti ti-bell"></i>
              <span className="badge bg-danger ms-1">
                {notifications.filter(n => !n.read).length}
              </span>
            </button>
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
                previewOrder={previewOrder}
                setPreviewOrder={setPreviewOrder}
                activeTab={activeTab}
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

            {/* ORDER PREVIEW TAB */}
            {activeTab === "order-preview" && previewOrder && (
              <div className="order-preview">
                <h5 className="card-title mb-4">
                  <i className="ti ti-file-invoice text-primary me-2"></i>
                  Order Voorbeeld
                </h5>
                <div className="card border">
                  <div className="card-body">
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <h6>Order Details</h6>
                        <dl className="row">
                          <dt className="col-sm-4">Ordernummer:</dt>
                          <dd className="col-sm-8">{previewOrder.order_number}</dd>
                          <dt className="col-sm-4">Project:</dt>
                          <dd className="col-sm-8">{previewOrder.project_name}</dd>
                          <dt className="col-sm-4">Leverancier:</dt>
                          <dd className="col-sm-8">{previewOrder.supplier_name}</dd>
                          <dt className="col-sm-4">Totaalbedrag:</dt>
                          <dd className="col-sm-8">€{previewOrder.total_amount?.toLocaleString('nl-NL', {minimumFractionDigits: 2})}</dd>
                          <dt className="col-sm-4">Leverdatum:</dt>
                          <dd className="col-sm-8">{new Date(previewOrder.delivery_date).toLocaleDateString('nl-NL')}</dd>
                        </dl>
                      </div>
                      <div className="col-md-6">
                        <h6>Leveringsinformatie</h6>
                        <dl className="row">
                          <dt className="col-sm-4">Leveradres:</dt>
                          <dd className="col-sm-8">{previewOrder.delivery_address}</dd>
                          <dt className="col-sm-4">Betalingsvoorwaarden:</dt>
                          <dd className="col-sm-8">{previewOrder.payment_terms === '30_days' ? '30 dagen' : previewOrder.payment_terms}</dd>
                          <dt className="col-sm-4">Status:</dt>
                          <dd className="col-sm-8">
                            <span className="badge bg-warning">{previewOrder.status}</span>
                          </dd>
                        </dl>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-outline-secondary" onClick={() => setActiveTab('orders')}>
                        Terug
                      </button>
                      <button className="btn btn-primary">
                        <i className="ti ti-send me-2"></i>
                        Order Versturen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
        .timeline-activity .timeline-item {
          display: flex;
          margin-bottom: 1rem;
        }
        .timeline-activity .timeline-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
        }
        .timeline-activity .timeline-line {
          position: absolute;
          left: 20px;
          top: 40px;
          bottom: -1rem;
          width: 2px;
          background-color: #dee2e6;
        }
        .timeline-activity .timeline-item:last-child .timeline-line {
          display: none;
        }
      `}</style>
    </Layout>
  )
}
