// pages/inkoop/index.js
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import AdminLayout from "@/components/AdminLayout"
import supabase from "@/lib/supabase"

// REMOVE: Verwijder de probleem imports
// import DashboardTab from "@/components/inkoop/DashboardTab"
// import PriceRequestTab from "@/components/inkoop/PriceRequestTab"
// ... alle andere tab imports
// import { getSupplierQuote, calculateTargetPrice, ... } from "@/lib/inkoop/helpers"

export default function InkoopPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  
  // Eenvoudige Stabu hoofdstukken (mock data)
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

  // State management - vereenvoudigd
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [orders, setOrders] = useState([])
  const [priceRequests, setPriceRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [documents, setDocuments] = useState([])
  
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

  // Dashboard stats
  const [stats, setStats] = useState({
    activeRequests: 0,
    pendingDecisions: 0,
    costSavings: 0,
    avgResponseTime: 0,
    negotiationSuccessRate: "78%",
    cashflowImpact: 0
  })

  // Mock helper functions
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'success'
      case 'pending': return 'warning'
      case 'completed': return 'secondary'
      default: return 'light'
    }
  }

  const getStatusText = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'Actief'
      case 'pending': return 'In behandeling'
      case 'completed': return 'Voltooid'
      default: return status || 'Onbekend'
    }
  }

  const getMockProjects = () => [
    { id: 1, name: "Woningbouw Amsterdam", status: "active", project_number: "PROJ-001" },
    { id: 2, name: "Kantoor Rotterdam", status: "active", project_number: "PROJ-002" },
    { id: 3, name: "Schoolgebouw Utrecht", status: "pending", project_number: "PROJ-003" }
  ]

  const getMockSuppliers = () => [
    { id: 1, name: "Bouwhandel BV", category: "Materialen", rating: 4.5 },
    { id: 2, name: "InstallatieTech", category: "Installaties", rating: 4.2 },
    { id: 3, name: "FunderingNL", category: "Grondwerk", rating: 4.7 }
  ]

  const getMockOrders = () => [
    { id: 1, order_number: "ORD-001", project_id: 1, supplier_id: 1, total_amount: 12500, status: "pending" },
    { id: 2, order_number: "ORD-002", project_id: 2, supplier_id: 2, total_amount: 8500, status: "completed" }
  ]

  const getMockPriceRequests = () => [
    { id: 1, project_id: 1, description: "Betonwerk", status: "sent", deadline: "2024-01-15" },
    { id: 2, project_id: 2, description: "Elektra installatie", status: "received", deadline: "2024-01-20" }
  ]

  const calculateOrderTotal = (request, supplier) => {
    // Mock berekening
    return Math.floor(Math.random() * 10000) + 5000
  }

  const handleChapterSelection = async (projectId, chapterId) => {
    setLoading(true)
    try {
      const project = projects.find(p => p.id === projectId)
      const chapter = stabuChapters.find(c => c.id === chapterId)
      
      if (!project || !chapter) return
      
      setPriceRequestForm({
        ...priceRequestForm,
        project_id: projectId,
        chapter_id: chapterId,
        description: `${chapter.name} voor ${project.name}`,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      
      setActiveTab("price-request")
      
    } catch (error) {
      console.error("Error selecting chapter:", error)
      alert("Fout bij selecteren hoofdstuk")
    } finally {
      setLoading(false)
    }
  }

  const handleSendPriceRequest = async () => {
    setLoading(true)
    try {
      if (!priceRequestForm.project_id || !priceRequestForm.chapter_id) {
        alert("Selecteer een project en Stabu hoofdstuk")
        return
      }

      // Simpele mock logica
      const newRequest = {
        id: Date.now(),
        ...priceRequestForm,
        status: "sent",
        sent_at: new Date().toISOString()
      }

      setPriceRequests(prev => [newRequest, ...prev])
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

    } catch (error) {
      console.error("Error sending price request:", error)
      alert("Fout bij verzenden prijsaanvraag")
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Laad echte data of gebruik mock data
        const [projectsRes, suppliersRes] = await Promise.all([
          supabase.from('projects').select('*').eq('status', 'active'),
          supabase.from('suppliers').select('*')
        ])
        
        if (projectsRes.data) setProjects(projectsRes.data)
        else setProjects(getMockProjects())
        
        if (suppliersRes.data) setSuppliers(suppliersRes.data)
        else setSuppliers(getMockSuppliers())
        
        // Mock data voor development
        setOrders(getMockOrders())
        setPriceRequests(getMockPriceRequests())
        
      } catch (error) {
        console.error("Error loading data:", error)
        // Fallback naar mock data
        setProjects(getMockProjects())
        setSuppliers(getMockSuppliers())
        setOrders(getMockOrders())
        setPriceRequests(getMockPriceRequests())
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return (
    <AdminLayout>  {/* ← VERANDER HIER */}
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
                { id: "orders", icon: "package", label: "Bestellingen" },
                { id: "suppliers", icon: "truck", label: "Leveranciers" },
                { id: "documents", icon: "files", label: "Documenten" }
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
        {loading && activeTab === "dashboard" && (
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
              <div className="dashboard-tab">
                <h5 className="card-title mb-4">
                  <i className="ti ti-dashboard text-primary me-2"></i>
                  Inkoop Dashboard
                </h5>
                
                {/* Statistieken */}
                <div className="row mb-4">
                  <div className="col-md-3 col-6 mb-3">
                    <div className="card border-0 bg-primary bg-opacity-10">
                      <div className="card-body text-center">
                        <div className="h4 mb-1">{stats.activeRequests}</div>
                        <div className="text-muted small">Actieve aanvragen</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <div className="card border-0 bg-warning bg-opacity-10">
                      <div className="card-body text-center">
                        <div className="h4 mb-1">{stats.pendingDecisions}</div>
                        <div className="text-muted small">In behandeling</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <div className="card border-0 bg-success bg-opacity-10">
                      <div className="card-body text-center">
                        <div className="h4 mb-1">€{stats.costSavings.toLocaleString('nl-NL')}</div>
                        <div className="text-muted small">Kostenbesparing</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <div className="card border-0 bg-info bg-opacity-10">
                      <div className="card-body text-center">
                        <div className="h4 mb-1">{stats.avgResponseTime}u</div>
                        <div className="text-muted small">Reactietijd</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Project Selectie */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="mb-3">Projecten</h6>
                    <div className="list-group">
                      {projects.map(project => (
                        <button
                          key={project.id}
                          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                            selectedProject?.id === project.id ? 'active' : ''
                          }`}
                          onClick={() => setSelectedProject(project)}
                        >
                          <div>
                            <div className="fw-bold">{project.name}</div>
                            <small className="text-muted">{project.project_number}</small>
                          </div>
                          <span className={`badge bg-${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h6 className="mb-3">Stabu Hoofdstukken</h6>
                    <div className="row">
                      {stabuChapters.map(chapter => (
                        <div key={chapter.id} className="col-6 mb-2">
                          <button
                            className={`btn btn-outline-${chapter.color} w-100 text-start ${
                              selectedChapter?.id === chapter.id ? 'active' : ''
                            }`}
                            onClick={() => {
                              setSelectedChapter(chapter)
                              if (selectedProject) {
                                handleChapterSelection(selectedProject.id, chapter.id)
                              } else {
                                alert("Selecteer eerst een project")
                              }
                            }}
                            disabled={!selectedProject}
                          >
                            <div className="fw-bold">{chapter.id}</div>
                            <small>{chapter.name}</small>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRIJSAANVRAAG TAB */}
            {activeTab === "price-request" && (
              <div className="price-request-tab">
                <h5 className="card-title mb-4">
                  <i className="ti ti-mail text-primary me-2"></i>
                  Nieuwe Prijsaanvraag
                </h5>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Project</label>
                      <select 
                        className="form-select"
                        value={priceRequestForm.project_id}
                        onChange={(e) => setPriceRequestForm({
                          ...priceRequestForm,
                          project_id: e.target.value
                        })}
                      >
                        <option value="">Selecteer project</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name} ({project.project_number})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Stabu Hoofdstuk</label>
                      <select 
                        className="form-select"
                        value={priceRequestForm.chapter_id}
                        onChange={(e) => {
                          const chapter = stabuChapters.find(c => c.id === e.target.value)
                          setPriceRequestForm({
                            ...priceRequestForm,
                            chapter_id: e.target.value,
                            description: chapter ? `${chapter.name} voor ${projects.find(p => p.id === priceRequestForm.project_id)?.name}` : ""
                          })
                        }}
                      >
                        <option value="">Selecteer hoofdstuk</option>
                        {stabuChapters.map(chapter => (
                          <option key={chapter.id} value={chapter.id}>
                            {chapter.id} - {chapter.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Omschrijving</label>
                      <textarea 
                        className="form-control"
                        rows="3"
                        value={priceRequestForm.description}
                        onChange={(e) => setPriceRequestForm({
                          ...priceRequestForm,
                          description: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Urgentie</label>
                      <select 
                        className="form-select"
                        value={priceRequestForm.urgency}
                        onChange={(e) => setPriceRequestForm({
                          ...priceRequestForm,
                          urgency: e.target.value
                        })}
                      >
                        <option value="normal">Normaal</option>
                        <option value="urgent">Urgent</option>
                        <option value="critical">Kritiek</option>
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Deadline</label>
                      <input 
                        type="date"
                        className="form-control"
                        value={priceRequestForm.deadline}
                        onChange={(e) => setPriceRequestForm({
                          ...priceRequestForm,
                          deadline: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Bericht aan leverancier</label>
                      <textarea 
                        className="form-control"
                        rows="3"
                        value={priceRequestForm.custom_message}
                        onChange={(e) => setPriceRequestForm({
                          ...priceRequestForm,
                          custom_message: e.target.value
                        })}
                        placeholder="Optioneel: speciaal bericht voor leverancier..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="d-flex justify-content-end">
                  <button 
                    className="btn btn-primary"
                    onClick={handleSendPriceRequest}
                    disabled={!priceRequestForm.project_id || !priceRequestForm.chapter_id}
                  >
                    <i className="ti ti-send me-2"></i>
                    Prijsaanvraag Versturen
                  </button>
                </div>
              </div>
            )}

            {/* BESTELLINGEN TAB */}
            {activeTab === "orders" && (
              <div className="orders-tab">
                <h5 className="card-title mb-4">
                  <i className="ti ti-package text-primary me-2"></i>
                  Bestellingen
                </h5>
                
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Ordernummer</th>
                        <th>Project</th>
                        <th>Leverancier</th>
                        <th>Bedrag</th>
                        <th>Status</th>
                        <th>Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>{order.order_number}</td>
                          <td>{projects.find(p => p.id === order.project_id)?.name || 'Onbekend'}</td>
                          <td>{suppliers.find(s => s.id === order.supplier_id)?.name || 'Onbekend'}</td>
                          <td>€{order.total_amount?.toLocaleString('nl-NL', {minimumFractionDigits: 2})}</td>
                          <td>
                            <span className={`badge bg-${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="ti ti-eye"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LEVERANCIERS TAB */}
            {activeTab === "suppliers" && (
              <div className="suppliers-tab">
                <h5 className="card-title mb-4">
                  <i className="ti ti-truck text-primary me-2"></i>
                  Leveranciers
                </h5>
                
                <div className="row">
                  {suppliers.map(supplier => (
                    <div key={supplier.id} className="col-md-4 mb-3">
                      <div className="card border">
                        <div className="card-body">
                          <h6 className="card-title">{supplier.name}</h6>
                          <div className="mb-2">
                            <small className="text-muted">Categorie:</small>
                            <div>{supplier.category}</div>
                          </div>
                          <div className="mb-2">
                            <small className="text-muted">Beoordeling:</small>
                            <div className="d-flex align-items-center">
                              <div className="rating">
                                {'★'.repeat(Math.floor(supplier.rating || 0))}
                                {'☆'.repeat(5 - Math.floor(supplier.rating || 0))}
                              </div>
                              <span className="ms-2">{supplier.rating?.toFixed(1)}</span>
                            </div>
                          </div>
                          <button className="btn btn-sm btn-outline-primary w-100">
                            Bekijk details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DOCUMENTEN TAB */}
            {activeTab === "documents" && (
              <div className="documents-tab">
                <h5 className="card-title mb-4">
                  <i className="ti ti-files text-primary me-2"></i>
                  Documenten
                </h5>
                
                <div className="text-center py-5 border rounded">
                  <i className="ti ti-cloud-upload text-muted fs-1 mb-3"></i>
                  <p className="text-muted mb-3">Upload bestanden door ze hierheen te slepen</p>
                  <input type="file" className="form-control w-auto mx-auto" />
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
        .rating {
          color: #ffc107;
          font-size: 1.2rem;
        }
      `}</style>
    </AdminLayout>
  )
}
