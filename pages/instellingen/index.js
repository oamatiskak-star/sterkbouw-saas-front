// pages/instellingen/index.js
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import supabase from "@/lib/supabase"

export default function InstellingenPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("gebruikers")
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  
  // Gebruikersbeheer
  const [users, setUsers] = useState([])
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user",
    phone: "",
    department: ""
  })
  
  // Systeeminstellingen
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    auditLogging: true,
    autoBackup: true,
    backupFrequency: "daily",
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    twoFactorAuth: false
  })
  
  // Module instellingen
  const [moduleSettings, setModuleSettings] = useState({
    calculatie: true,
    projecten: true,
    btw: true,
    bouwplaats: true,
    documenten: true,
    urenregistratie: true,
    voorraad: true,
    financien: true,
    rapportages: true
  })
  
  // API Keys
  const [apiKeys, setApiKeys] = useState([])
  const [newApiKey, setNewApiKey] = useState({
    name: "",
    permissions: ["read"]
  })
  
  // Audit log
  const [auditLogs, setAuditLogs] = useState([])

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push("/login")
          return
        }
        
        setCurrentUser(session.user)
        
        // Check if user is admin (simplified - in practice you'd check user_metadata)
        const { data: userData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (userData) {
          setUserRole(userData.role)
          if (userData.role !== 'admin') {
            router.push("/dashboard")
          }
        }
        
        // Load initial data
        loadUsers()
        loadAuditLogs()
        
      } catch (error) {
        console.error("Permission check failed:", error)
      }
    }
    
    checkPermissions()
  }, [router])

  // =========================
  // GEBRUIKERSBEHEER
  // =========================
  const loadUsers = async () => {
    try {
      // In practice: get users from your users/profiles table
      const mockUsers = [
        { id: 1, email: "admin@sterkbouw.nl", full_name: "Jan de Admin", role: "admin", created_at: "2023-01-15", last_login: "2023-12-29" },
        { id: 2, email: "manager@sterkbouw.nl", full_name: "Piet Manager", role: "manager", created_at: "2023-02-20", last_login: "2023-12-28" },
        { id: 3, email: "calculator@sterkbouw.nl", full_name: "Kees Calculator", role: "calculator", created_at: "2023-03-10", last_login: "2023-12-27" },
        { id: 4, email: "bouwplaats@sterkbouw.nl", full_name: "Henk Bouwplaats", role: "field", created_at: "2023-04-05", last_login: "2023-12-26" },
        { id: 5, email: "user@sterkbouw.nl", full_name: "Lisa Gebruiker", role: "user", created_at: "2023-05-12", last_login: "2023-12-25" }
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // In practice: Create user in Supabase Auth and add to profiles table
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: newUser.full_name,
          role: newUser.role,
          phone: newUser.phone,
          department: newUser.department
        }
      })
      
      if (error) throw error
      
      // Add to users list
      const newUserObj = {
        id: data.user.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        created_at: new Date().toISOString(),
        last_login: null
      }
      
      setUsers([...users, newUserObj])
      setNewUser({
        email: "",
        password: "",
        full_name: "",
        role: "user",
        phone: "",
        department: ""
      })
      
      alert("Gebruiker succesvol aangemaakt!")
      
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Fout bij aanmaken gebruiker: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      // In practice: Update role in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      
      if (error) throw error
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
      
      alert("Rol succesvol bijgewerkt!")
    } catch (error) {
      console.error("Error updating role:", error)
      alert("Fout bij bijwerken rol")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm("Weet je zeker dat je deze gebruiker wilt verwijderen?")) return
    
    try {
      // In practice: Delete user from Supabase Auth and profiles
      const { error } = await supabase.auth.admin.deleteUser(userId)
      
      if (error) throw error
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId))
      alert("Gebruiker succesvol verwijderd!")
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Fout bij verwijderen gebruiker")
    }
  }

  // =========================
  // SYSTEEM INSTELLINGEN
  // =========================
  const handleSystemSettingChange = (key, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSystemSettings = async () => {
    setLoading(true)
    try {
      // In practice: Save to database or config file
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert("Systeeminstellingen opgeslagen!")
    } catch (error) {
      alert("Fout bij opslaan instellingen")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // MODULE INSTELLINGEN
  // =========================
  const handleModuleToggle = (module) => {
    setModuleSettings(prev => ({
      ...prev,
      [module]: !prev[module]
    }))
  }

  const saveModuleSettings = async () => {
    setLoading(true)
    try {
      // In practice: Save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert("Module instellingen opgeslagen!")
    } catch (error) {
      alert("Fout bij opslaan module instellingen")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // API KEYS BEHEER
  // =========================
  const handleCreateApiKey = async (e) => {
    e.preventDefault()
    
    try {
      const newKey = {
        id: Date.now(),
        name: newApiKey.name,
        key: `sk_${Math.random().toString(36).substr(2, 24)}`,
        permissions: newApiKey.permissions,
        created_at: new Date().toISOString(),
        last_used: null
      }
      
      setApiKeys([...apiKeys, newKey])
      setNewApiKey({ name: "", permissions: ["read"] })
      alert("API Key aangemaakt!")
    } catch (error) {
      alert("Fout bij aanmaken API Key")
    }
  }

  const handleRevokeApiKey = (keyId) => {
    if (!confirm("Weet je zeker dat je deze API Key wilt intrekken?")) return
    
    setApiKeys(apiKeys.filter(key => key.id !== keyId))
    alert("API Key ingetrokken!")
  }

  // =========================
  // AUDIT LOG
  // =========================
  const loadAuditLogs = async () => {
    try {
      const mockLogs = [
        { id: 1, user: "admin@sterkbouw.nl", action: "Gebruiker aangemaakt", target: "user@sterkbouw.nl", timestamp: "2023-12-30 09:15:23", ip: "192.168.1.1" },
        { id: 2, user: "manager@sterkbouw.nl", action: "Project bijgewerkt", target: "Project #123", timestamp: "2023-12-30 08:45:12", ip: "192.168.1.2" },
        { id: 3, user: "admin@sterkbouw.nl", action: "Instellingen gewijzigd", target: "Systeeminstellingen", timestamp: "2023-12-29 16:30:45", ip: "192.168.1.1" },
        { id: 4, user: "calculator@sterkbouw.nl", action: "Calculatie opgeslagen", target: "Calculatie #456", timestamp: "2023-12-29 14:20:33", ip: "192.168.1.3" },
        { id: 5, user: "bouwplaats@sterkbouw.nl", action: "Inspectie geüpload", target: "Bouwplaats inspectie", timestamp: "2023-12-29 11:05:18", ip: "192.168.1.4" }
      ]
      setAuditLogs(mockLogs)
    } catch (error) {
      console.error("Error loading audit logs:", error)
    }
  }

  // =========================
  // BACKUP & RESTORE
  // =========================
  const handleCreateBackup = async () => {
    setLoading(true)
    try {
      // In practice: Trigger backup process
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert("Backup succesvol gemaakt! Download link wordt voorbereid.")
    } catch (error) {
      alert("Fout bij maken backup")
    } finally {
      setLoading(false)
    }
  }

  if (userRole !== 'admin') {
    return (
      <Layout>
        <div className="container-fluid py-5">
          <div className="text-center">
            <i className="ti ti-shield-off text-danger fs-1 mb-3"></i>
            <h3 className="mb-3">Toegang Geweigerd</h3>
            <p className="text-muted mb-4">
              Je hebt geen administrator rechten om deze pagina te bekijken.
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="btn btn-primary"
            >
              Terug naar Dashboard
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container-fluid px-3 px-lg-4 py-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div>
            <h1 className="h2 mb-2">Instellingen</h1>
            <p className="text-muted mb-0">
              Beheer systeeminstellingen, gebruikers en applicatieconfiguratie
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <span className="badge bg-success">
              <i className="ti ti-shield-check me-1"></i>
              Admin Mode
            </span>
            <span className="text-muted small">
              Ingelogd als: {currentUser?.email}
            </span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-0">
            <ul className="nav nav-tabs nav-tabs-alt">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "gebruikers" ? "active" : ""}`}
                  onClick={() => setActiveTab("gebruikers")}
                >
                  <i className="ti ti-users me-2"></i>
                  Gebruikersbeheer
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "systeem" ? "active" : ""}`}
                  onClick={() => setActiveTab("systeem")}
                >
                  <i className="ti ti-settings me-2"></i>
                  Systeeminstellingen
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "modules" ? "active" : ""}`}
                  onClick={() => setActiveTab("modules")}
                >
                  <i className="ti ti-apps me-2"></i>
                  Modules
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "api" ? "active" : ""}`}
                  onClick={() => setActiveTab("api")}
                >
                  <i className="ti ti-key me-2"></i>
                  API Keys
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "audit" ? "active" : ""}`}
                  onClick={() => setActiveTab("audit")}
                >
                  <i className="ti ti-history me-2"></i>
                  Audit Log
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "backup" ? "active" : ""}`}
                  onClick={() => setActiveTab("backup")}
                >
                  <i className="ti ti-cloud me-2"></i>
                  Backup
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            
            {/* GEBRUIKERSBEHEER TAB */}
            {activeTab === "gebruikers" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">
                    <i className="ti ti-users text-primary me-2"></i>
                    Gebruikersbeheer
                  </h5>
                  <button 
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal" 
                    data-bs-target="#newUserModal"
                  >
                    <i className="ti ti-plus me-1"></i>
                    Nieuwe Gebruiker
                  </button>
                </div>

                {/* Gebruikers Tabel */}
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Naam</th>
                        <th>E-mail</th>
                        <th>Rol</th>
                        <th>Aangemaakt</th>
                        <th>Laatste Login</th>
                        <th>Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary-subtle rounded-circle p-2 me-3">
                                <i className="ti ti-user text-primary"></i>
                              </div>
                              <div>
                                <div className="fw-bold">{user.full_name}</div>
                                <small className="text-muted">ID: {user.id}</small>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <select 
                              className="form-select form-select-sm"
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                              style={{ width: 'auto' }}
                            >
                              <option value="admin">Administrator</option>
                              <option value="manager">Manager</option>
                              <option value="calculator">Calculator</option>
                              <option value="field">Bouwplaats</option>
                              <option value="user">Gebruiker</option>
                              <option value="viewer">Alleen lezen</option>
                            </select>
                          </td>
                          <td>
                            <small>
                              {new Date(user.created_at).toLocaleDateString('nl-NL')}
                            </small>
                          </td>
                          <td>
                            <small>
                              {user.last_login 
                                ? new Date(user.last_login).toLocaleDateString('nl-NL')
                                : 'Nooit'
                              }
                            </small>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                title="Bewerken"
                              >
                                <i className="ti ti-edit"></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteUser(user.id)}
                                title="Verwijderen"
                              >
                                <i className="ti ti-trash"></i>
                              </button>
                              <button 
                                className="btn btn-outline-secondary"
                                title="Reset wachtwoord"
                              >
                                <i className="ti ti-refresh"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Nieuwe Gebruiker Modal */}
                <div className="modal fade" id="newUserModal" tabIndex="-1">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Nieuwe Gebruiker</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                      </div>
                      <form onSubmit={handleCreateUser}>
                        <div className="modal-body">
                          <div className="mb-3">
                            <label className="form-label">Volledige Naam</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newUser.full_name}
                              onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">E-mailadres</label>
                            <input
                              type="email"
                              className="form-control"
                              value={newUser.email}
                              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Wachtwoord</label>
                            <input
                              type="password"
                              className="form-control"
                              value={newUser.password}
                              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                              required
                              minLength="8"
                            />
                            <small className="text-muted">Minimaal 8 karakters</small>
                          </div>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Rol</label>
                              <select
                                className="form-select"
                                value={newUser.role}
                                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                              >
                                <option value="user">Gebruiker</option>
                                <option value="calculator">Calculator</option>
                                <option value="field">Bouwplaats</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Administrator</option>
                              </select>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Telefoon</label>
                              <input
                                type="tel"
                                className="form-control"
                                value={newUser.phone}
                                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Afdeling</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newUser.department}
                              onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                            Annuleren
                          </button>
                          <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Bezig...
                              </>
                            ) : (
                              'Gebruiker Aanmaken'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SYSTEEMINSTELLINGEN TAB */}
            {activeTab === "systeem" && (
              <div>
                <h5 className="card-title mb-4">
                  <i className="ti ti-settings text-primary me-2"></i>
                  Systeeminstellingen
                </h5>

                <div className="row">
                  <div className="col-md-6">
                    <div className="card border mb-4">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">Algemene Instellingen</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={systemSettings.maintenanceMode}
                              onChange={(e) => handleSystemSettingChange('maintenanceMode', e.target.checked)}
                            />
                            <label className="form-check-label fw-bold">
                              Onderhoudsmodus
                            </label>
                            <small className="d-block text-muted">
                              Toon onderhoudspagina aan gebruikers
                            </small>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={systemSettings.emailNotifications}
                              onChange={(e) => handleSystemSettingChange('emailNotifications', e.target.checked)}
                            />
                            <label className="form-check-label fw-bold">
                              E-mail Notificaties
                            </label>
                            <small className="d-block text-muted">
                              Stuur notificaties naar gebruikers
                            </small>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={systemSettings.auditLogging}
                              onChange={(e) => handleSystemSettingChange('auditLogging', e.target.checked)}
                            />
                            <label className="form-check-label fw-bold">
                              Audit Logging
                            </label>
                            <small className="d-block text-muted">
                              Log alle gebruikersacties voor beveiliging
                            </small>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={systemSettings.twoFactorAuth}
                              onChange={(e) => handleSystemSettingChange('twoFactorAuth', e.target.checked)}
                            />
                            <label className="form-check-label fw-bold">
                              Twee-Factor Authenticatie
                            </label>
                            <small className="d-block text-muted">
                              Vereis 2FA voor alle gebruikers
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card border mb-4">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">Beveiliging</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            Sessie Timeout (minuten)
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={systemSettings.sessionTimeout}
                            onChange={(e) => handleSystemSettingChange('sessionTimeout', parseInt(e.target.value))}
                            min="5"
                            max="1440"
                          />
                          <small className="text-muted">
                            Tijd voordat gebruikers automatisch worden uitgelogd
                          </small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            Maximum Login Pogingen
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={systemSettings.maxLoginAttempts}
                            onChange={(e) => handleSystemSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                            min="1"
                            max="10"
                          />
                          <small className="text-muted">
                            Aantal mislukte pogingen voordat account wordt geblokkeerd
                          </small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            Backup Frequentie
                          </label>
                          <select
                            className="form-select"
                            value={systemSettings.backupFrequency}
                            onChange={(e) => handleSystemSettingChange('backupFrequency', e.target.value)}
                          >
                            <option value="hourly">Elk uur</option>
                            <option value="daily">Dagelijks</option>
                            <option value="weekly">Wekelijks</option>
                            <option value="monthly">Maandelijks</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <button 
                    className="btn btn-primary"
                    onClick={saveSystemSettings}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Opslaan...
                      </>
                    ) : (
                      'Instellingen Opslaan'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* MODULES TAB */}
            {activeTab === "modules" && (
              <div>
                <h5 className="card-title mb-4">
                  <i className="ti ti-apps text-primary me-2"></i>
                  Module Beheer
                </h5>

                <div className="alert alert-info">
                  <i className="ti ti-info-circle me-2"></i>
                  Schakel modules in of uit om functionaliteit te beheren
                </div>

                <div className="row">
                  {Object.entries(moduleSettings).map(([module, enabled]) => (
                    <div key={module} className="col-md-4 mb-3">
                      <div className="card border h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="card-title mb-1 text-capitalize">
                                {getModuleName(module)}
                              </h6>
                              <small className="text-muted">
                                {getModuleDescription(module)}
                              </small>
                            </div>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={enabled}
                                onChange={() => handleModuleToggle(module)}
                              />
                            </div>
                          </div>
                          <div className="small">
                            <span className={`badge bg-${enabled ? 'success' : 'danger'}`}>
                              {enabled ? 'Ingeschakeld' : 'Uitgeschakeld'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-end mt-4">
                  <button 
                    className="btn btn-primary"
                    onClick={saveModuleSettings}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Opslaan...
                      </>
                    ) : (
                      'Module Instellingen Opslaan'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* API KEYS TAB */}
            {activeTab === "api" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">
                    <i className="ti ti-key text-primary me-2"></i>
                    API Keys Beheer
                  </h5>
                  <button 
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal" 
                    data-bs-target="#newApiKeyModal"
                  >
                    <i className="ti ti-plus me-1"></i>
                    Nieuwe API Key
                  </button>
                </div>

                {apiKeys.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="ti ti-key-off text-muted fs-1 mb-3"></i>
                    <h5 className="text-muted">Geen API Keys</h5>
                    <p className="text-muted">Maak je eerste API Key aan</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Naam</th>
                          <th>API Key</th>
                          <th>Permissions</th>
                          <th>Aangemaakt</th>
                          <th>Laatst Gebruikt</th>
                          <th>Acties</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiKeys.map(apiKey => (
                          <tr key={apiKey.id}>
                            <td>
                              <div className="fw-bold">{apiKey.name}</div>
                            </td>
                            <td>
                              <code className="bg-light p-1 rounded">
                                {apiKey.key.substring(0, 8)}...
                              </code>
                            </td>
                            <td>
                              {apiKey.permissions.map(perm => (
                                <span key={perm} className="badge bg-info me-1">
                                  {perm}
                                </span>
                              ))}
                            </td>
                            <td>
                              <small>
                                {new Date(apiKey.created_at).toLocaleDateString('nl-NL')}
                              </small>
                            </td>
                            <td>
                              <small>
                                {apiKey.last_used 
                                  ? new Date(apiKey.last_used).toLocaleDateString('nl-NL')
                                  : 'Nooit'
                                }
                              </small>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRevokeApiKey(apiKey.id)}
                              >
                                <i className="ti ti-trash"></i>
                                Intrekken
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Nieuwe API Key Modal */}
                <div className="modal fade" id="newApiKeyModal" tabIndex="-1">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Nieuwe API Key</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                      </div>
                      <form onSubmit={handleCreateApiKey}>
                        <div className="modal-body">
                          <div className="mb-3">
                            <label className="form-label">Naam</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newApiKey.name}
                              onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                              placeholder="Bijv. 'Externe Integratie'"
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Permissions</label>
                            <div>
                              {['read', 'write', 'delete', 'admin'].map(perm => (
                                <div key={perm} className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={newApiKey.permissions.includes(perm)}
                                    onChange={(e) => {
                                      const perms = e.target.checked
                                        ? [...newApiKey.permissions, perm]
                                        : newApiKey.permissions.filter(p => p !== perm)
                                      setNewApiKey({...newApiKey, permissions: perms})
                                    }}
                                  />
                                  <label className="form-check-label text-capitalize">
                                    {perm}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                            Annuleren
                          </button>
                          <button type="submit" className="btn btn-primary">
                            API Key Aanmaken
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIT LOG TAB */}
            {activeTab === "audit" && (
              <div>
                <h5 className="card-title mb-4">
                  <i className="ti ti-history text-primary me-2"></i>
                  Audit Log
                </h5>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Tijdstip</th>
                        <th>Gebruiker</th>
                        <th>Actie</th>
                        <th>Doel</th>
                        <th>IP Adres</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id}>
                          <td>
                            <small>{log.timestamp}</small>
                          </td>
                          <td>{log.user}</td>
                          <td>
                            <span className="badge bg-info">{log.action}</span>
                          </td>
                          <td>
                            <small>{log.target}</small>
                          </td>
                          <td>
                            <code>{log.ip}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <small className="text-muted">
                    Laatste {auditLogs.length} acties
                  </small>
                  <button className="btn btn-sm btn-outline-primary">
                    <i className="ti ti-download me-1"></i>
                    Exporteer Logs
                  </button>
                </div>
              </div>
            )}

            {/* BACKUP TAB */}
            {activeTab === "backup" && (
              <div>
                <h5 className="card-title mb-4">
                  <i className="ti ti-cloud text-primary me-2"></i>
                  Backup & Herstel
                </h5>

                <div className="row">
                  <div className="col-md-6">
                    <div className="card border mb-4">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">Backup Maken</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-4">
                          <h6 className="fw-bold">Laatste Backups</h6>
                          <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              <span>backup_20231230_0900.zip</span>
                              <span className="badge bg-success">Vandaag 09:00</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              <span>backup_20231229_0900.zip</span>
                              <span className="badge bg-secondary">Gisteren</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                              <span>backup_20231228_0900.zip</span>
                              <span className="badge bg-secondary">2 dagen</span>
                            </li>
                          </ul>
                        </div>

                        <button 
                          className="btn btn-primary w-100"
                          onClick={handleCreateBackup}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Backup maken...
                            </>
                          ) : (
                            <>
                              <i className="ti ti-download me-2"></i>
                              Nieuwe Backup Maken
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card border mb-4">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">Backup Instellingen</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Automatische Backups</label>
                          <select className="form-select" defaultValue="daily">
                            <option value="disabled">Uitgeschakeld</option>
                            <option value="hourly">Elk uur</option>
                            <option value="daily">Dagelijks</option>
                            <option value="weekly">Wekelijks</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">Backup Retentie</label>
                          <select className="form-select" defaultValue="30">
                            <option value="7">7 dagen</option>
                            <option value="30">30 dagen</option>
                            <option value="90">90 dagen</option>
                            <option value="365">1 jaar</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">Backup Locatie</label>
                          <div className="input-group">
                            <input 
                              type="text" 
                              className="form-control" 
                              value="/var/backups/sterkbouw" 
                              readOnly 
                            />
                            <button className="btn btn-outline-secondary" type="button">
                              <i className="ti ti-folder"></i>
                            </button>
                          </div>
                        </div>

                        <button className="btn btn-outline-primary w-100">
                          <i className="ti ti-cloud-upload me-2"></i>
                          Backup naar Cloud
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-warning">
                  <i className="ti ti-alert-triangle me-2"></i>
                  <strong>Waarschuwing:</strong> Het herstellen van een backup overschrijft alle huidige gegevens.
                </div>

                <div className="text-end">
                  <button className="btn btn-danger">
                    <i className="ti ti-restore me-2"></i>
                    Backup Herstellen
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Systeem Status Footer */}
        <div className="card border-0 shadow-sm mt-4 bg-light">
          <div className="card-body p-3">
            <div className="row">
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <div className="bg-success-subtle p-2 rounded me-3">
                    <i className="ti ti-server text-success"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Systeem Status</div>
                    <div className="fw-bold text-success">Online</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <div className="bg-info-subtle p-2 rounded me-3">
                    <i className="ti ti-users text-info"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Actieve Gebruikers</div>
                    <div className="fw-bold">{users.length}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <div className="bg-warning-subtle p-2 rounded me-3">
                    <i className="ti ti-database text-warning"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Database Grootte</div>
                    <div className="fw-bold">248 MB</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="d-flex align-items-center">
                  <div className="bg-primary-subtle p-2 rounded me-3">
                    <i className="ti ti-shield text-primary"></i>
                  </div>
                  <div>
                    <div className="small text-muted">Beveiliging</div>
                    <div className="fw-bold">Hoog</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Helper functies */}
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
        .nav-tabs .nav-link:hover {
          color: #0d6efd;
        }
        .form-switch .form-check-input {
          width: 3em;
          height: 1.5em;
        }
      `}</style>
    </Layout>
  )
}

// Helper functies
function getModuleName(module) {
  const names = {
    calculatie: "Calculatie Module",
    projecten: "Projectbeheer",
    btw: "Bouwtechnische Werken",
    bouwplaats: "Bouwplaats App",
    documenten: "Documentbeheer",
    urenregistratie: "Urenregistratie",
    voorraad: "Voorraadbeheer",
    financien: "Financiën Module",
    rapportages: "Rapportages"
  }
  return names[module] || module
}

function getModuleDescription(module) {
  const descriptions = {
    calculatie: "Kostenberekeningen en offertes",
    projecten: "Projectmanagement en planning",
    btw: "Bouwtechnische specificaties",
    bouwplaats: "Uitvoering en inspectie",
    documenten: "Bestandsbeheer en archivering",
    urenregistratie: "Urenregistratie en facturatie",
    voorraad: "Materialen en voorraad",
    financien: "Budgetten en cashflow",
    rapportages: "Rapporten en analyses"
  }
  return descriptions[module] || "Applicatie module"
}
