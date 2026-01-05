// SterkBouw-SaaS-Frontend/pages/calculaties/index.js - MET CORS FIXES
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Icons
import { 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  FileText,
  Building, 
  Calendar, 
  User,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpDown,
  RefreshCw
} from "lucide-react"

// API endpoints
const API_ENDPOINTS = {
  BACKEND_API: process.env.NEXT_PUBLIC_BACKEND_API || "https://sterkbouw-saas-backend-production.up.railway.app",
}

// Simple inline Progress component
function SimpleProgress({ value = 0, className = '' }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className="h-full w-full flex-1 bg-blue-600 transition-all"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}

// Helper function voor CORS-compliant API calls
const createApiClient = (getToken) => {
  return {
    async request(endpoint, options = {}) {
      const token = await getToken();
      
      // Bepaal of we proxy moeten gebruiken (client-side CORS issues)
      const isBrowser = typeof window !== 'undefined';
      const backendUrl = API_ENDPOINTS.BACKEND_API;
      
      let url;
      let fetchOptions = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      };
      
      // Als we in de browser zijn en het is cross-origin, gebruik CORS mode
      if (isBrowser) {
        const backendOrigin = new URL(backendUrl).origin;
        const frontendOrigin = window.location.origin;
        
        // Als origins verschillend zijn, gebruik CORS mode
        if (backendOrigin !== frontendOrigin) {
          fetchOptions.mode = 'cors';
          fetchOptions.credentials = 'include';
        }
        
        url = `${backendUrl}${endpoint}`;
      } else {
        // Server-side, directe URL
        url = `${backendUrl}${endpoint}`;
      }
      
      try {
        const response = await fetch(url, fetchOptions);
        
        // Als CORS error, probeer proxy
        if (response.status === 0 || response.type === 'opaque') {
          console.warn('CORS error detected, trying proxy...');
          
          // Gebruik Next.js API route als proxy
          const proxyUrl = `/api/proxy${endpoint}`;
          const proxyResponse = await fetch(proxyUrl, {
            method: options.method || 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            }
          });
          
          return proxyResponse;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return response;
      } catch (error) {
        console.error('API request error:', error);
        
        // Als fetch mislukt, probeer proxy
        if (isBrowser && error.message.includes('Failed to fetch')) {
          console.log('Trying proxy as fallback...');
          const proxyUrl = `/api/proxy${endpoint}`;
          return fetch(proxyUrl, {
            method: options.method || 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            }
          });
        }
        
        throw error;
      }
    },
    
    async get(endpoint, options = {}) {
      return this.request(endpoint, { ...options, method: 'GET' });
    },
    
    async delete(endpoint, options = {}) {
      return this.request(endpoint, { ...options, method: 'DELETE' });
    }
  };
};

export default function CalculatiesPage() {
  const router = useRouter()
  
  // ======================
  // AUTH - GEBRUIK NIEUWE FUNCTIES
  // ======================
  const { 
    user, 
    loading: authLoading, 
    userProfile, 
    getIdToken 
  } = useAuth()
  
  // State management
  const [calculaties, setCalculaties] = useState([])
  const [filteredCalculaties, setFilteredCalculaties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updated_at")
  const [sortOrder, setSortOrder] = useState("desc")

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
    totalValue: 0
  })

  // ======================
  // EFFECTS
  // ======================

  useEffect(() => {
    if (authLoading === false && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchCalculaties()
    }
  }, [user])

  useEffect(() => {
    filterAndSortCalculaties()
  }, [calculaties, searchTerm, statusFilter, sortBy, sortOrder])

  // ======================
  // FUNCTIES - MET CORS FIXES
  // ======================

  const fetchCalculaties = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const token = await getIdToken()
      
      if (!token) {
        setError("Authenticatie token niet beschikbaar. Log opnieuw in.")
        return
      }
      
      const userId = userProfile?.id || user?.id
      if (!userId) {
        setError("Gebruiker niet gevonden")
        return
      }
      
      console.log('Fetching calculaties voor user:', userId);
      console.log('Backend URL:', API_ENDPOINTS.BACKEND_API);
      
      // Gebruik de API client helper
      const api = createApiClient(() => Promise.resolve(token));
      const endpoint = `/api/projects?user_id=${userId}`;
      
      const response = await api.get(endpoint);
      
      if (!response.ok) {
        // Check voor auth errors
        if (response.status === 401 || response.status === 403) {
          setError("U heeft geen toegang tot deze data. Log opnieuw in.")
          setTimeout(() => router.push('/login'), 2000)
          return
        }
        
        const errorText = await response.text();
        throw new Error(`Fout bij het ophalen: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      const calculatiesArray = Array.isArray(data) ? data : [];
      setCalculaties(calculatiesArray);
      updateStats(calculatiesArray);
      
    } catch (err) {
      console.error('Fetch error:', err);
      
      // Toon CORS-specifieke foutmelding
      if (err.message.includes('Failed to fetch') || err.message.includes('CORS') || err.message.includes('NetworkError')) {
        setError(`
          CORS Fout: Kan geen verbinding maken met de backend server.
          
          Mogelijke oorzaken:
          1. Backend staat CORS niet toe voor dit domein
          2. Backend server is offline
          3. Firewall blokkeert de verbinding
          
          Foutdetails: ${err.message}
          
          Controleer de CORS configuratie in de SterkBouw-SaaS-Backend repository.
        `);
      } else {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortCalculaties = () => {
    if (!calculaties || !Array.isArray(calculaties)) {
      setFilteredCalculaties([])
      return
    }
    
    let filtered = [...calculaties]
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(calc => {
        return (
          (calc.naam && calc.naam.toLowerCase().includes(term)) ||
          (calc.klant_naam && calc.klant_naam.toLowerCase().includes(term)) ||
          (calc.adres && calc.adres.toLowerCase().includes(term)) ||
          (calc.plaats && calc.plaats.toLowerCase().includes(term))
        )
      })
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(calc => calc.status === statusFilter)
    }
    
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case "naam":
          aValue = (a.naam || "").toLowerCase()
          bValue = (b.naam || "").toLowerCase()
          break
        case "klant_naam":
          aValue = (a.klant_naam || "").toLowerCase()
          bValue = (b.klant_naam || "").toLowerCase()
          break
        case "totaal_incl_btw":
          aValue = a.metadata?.totaal_incl_btw || 0
          bValue = b.metadata?.totaal_incl_btw || 0
          break
        case "created_at":
          aValue = new Date(a.created_at || 0).getTime()
          bValue = new Date(b.created_at || 0).getTime()
          break
        case "updated_at":
        default:
          aValue = new Date(a.updated_at || 0).getTime()
          bValue = new Date(b.updated_at || 0).getTime()
      }
      
      return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
    })
    
    setFilteredCalculaties(filtered)
  }

  const updateStats = (calculatiesArray) => {
    if (!Array.isArray(calculatiesArray)) {
      setStats({ total: 0, active: 0, completed: 0, draft: 0, totalValue: 0 })
      return
    }
    
    setStats({
      total: calculatiesArray.length,
      active: calculatiesArray.filter(c => c.status === 'active').length,
      completed: calculatiesArray.filter(c => c.status === 'completed').length,
      draft: calculatiesArray.filter(c => c.status === 'draft').length,
      totalValue: calculatiesArray.reduce((sum, c) => sum + (c.metadata?.totaal_incl_btw || 0), 0)
    })
  }

  const handleDeleteClick = (calculatie) => {
    if (confirm(`Weet u zeker dat u "${calculatie.naam || 'calculatie'}" wilt verwijderen?\nDeze actie kan niet ongedaan worden gemaakt.`)) {
      deleteCalculatie(calculatie)
    }
  }

  const deleteCalculatie = async (calculatie) => {
    if (!calculatie || !user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const token = await getIdToken()
      
      if (!token) {
        setError("Authenticatie token niet beschikbaar. Log opnieuw in.")
        return
      }
      
      // Gebruik de API client helper
      const api = createApiClient(() => Promise.resolve(token));
      const endpoint = `/api/projects/${calculatie.id}`;
      
      const response = await api.delete(endpoint);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("U heeft geen toestemming om deze calculatie te verwijderen")
          return
        }
        
        const errorText = await response.text();
        throw new Error(`Verwijderen mislukt: ${response.status} - ${errorText}`);
      }
      
      const updatedCalculaties = calculaties.filter(c => c.id !== calculatie.id)
      setCalculaties(updatedCalculaties)
      updateStats(updatedCalculaties)
      
      setSuccess('Calculatie succesvol verwijderd')
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Verwijderen mislukt');
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusBadge = (status) => {
    if (!status) status = 'draft'
    
    const variants = {
      draft: { variant: "outline", icon: Clock, text: "Concept" },
      active: { variant: "secondary", icon: RefreshCw, text: "Actief" },
      completed: { variant: "default", icon: CheckCircle, text: "Voltooid" },
      cancelled: { variant: "destructive", icon: XCircle, text: "Geannuleerd" }
    }
    
    const config = variants[status] || variants.draft
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Onbekend"
      return format(new Date(dateString), 'dd-MM-yyyy', { locale: nl })
    } catch {
      return "Onbekend"
    }
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "€ 0,00"
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  // ======================
  // RENDER
  // ======================

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <SimpleProgress value={100} className="w-64 mb-4" />
          <p className="text-gray-600">Authenticatie controleren...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculaties</h1>
            <p className="text-gray-600">Overzicht van al uw bouwcalculaties</p>
          </div>
          <Link href="/calculaties/nieuw">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nieuwe Calculatie
            </Button>
          </Link>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            { key: 'total', label: 'Totaal', value: stats.total, icon: FileText, color: 'blue' },
            { key: 'draft', label: 'Concept', value: stats.draft, icon: Clock, color: 'gray' },
            { key: 'active', label: 'Actief', value: stats.active, icon: RefreshCw, color: 'blue' },
            { key: 'completed', label: 'Voltooid', value: stats.completed, icon: CheckCircle, color: 'green' },
            { key: 'totalValue', label: 'Totale waarde', value: formatCurrency(stats.totalValue), icon: DollarSign, color: 'green' }
          ].map((stat) => (
            <Card key={stat.key}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="font-medium">Fout</h3>
          </div>
          <p className="text-red-700 mt-1 whitespace-pre-line">{error}</p>
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="mr-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Probeer opnieuw
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open('https://railway.app/project/sterkbouw-saas-backend', '_blank')}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Backend controleren
            </Button>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <h3 className="font-medium">Succes</h3>
          </div>
          <p className="text-green-700 mt-1">{success}</p>
        </div>
      )}

      {/* Search and filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoeken op project, klant, adres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">Status</label>
              <div className="flex gap-2">
                {["all", "draft", "active", "completed"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "all" ? "Alle" : 
                     status === "draft" ? "Concept" :
                     status === "active" ? "Actief" : "Voltooid"}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">Sorteren op</label>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "updated_at" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("updated_at")}
                >
                  Datum
                </Button>
                <Button
                  variant={sortBy === "naam" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("naam")}
                >
                  Naam
                </Button>
                <Button
                  variant={sortOrder === "desc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                >
                  {sortOrder === "desc" ? "↓" : "↑"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Calculaties ({filteredCalculaties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-600">Calculaties laden...</p>
            </div>
          ) : filteredCalculaties.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {calculaties.length === 0 ? "Nog geen calculaties" : "Geen resultaten gevonden"}
              </h3>
              <p className="text-gray-600 mb-6">
                {calculaties.length === 0 
                  ? "Maak uw eerste calculatie aan om te beginnen" 
                  : "Pas uw zoekopdracht aan om meer resultaten te zien"}
              </p>
              {calculaties.length === 0 && (
                <Link href="/calculaties/nieuw">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nieuwe Calculatie
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">
                      <button 
                        onClick={() => setSortBy("naam")}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        Project
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead>Klant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Totaal</TableHead>
                    <TableHead>Laatst gewijzigd</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalculaties.map((calculatie) => (
                    <TableRow key={calculatie.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium">{calculatie.naam || "Naamloos project"}</div>
                        <div className="text-sm text-gray-500">
                          {calculatie.adres || "Geen adres"}, {calculatie.postcode || ""} {calculatie.plaats || ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{calculatie.klant_naam || "Geen klant"}</div>
                        {calculatie.klant_email && (
                          <div className="text-sm text-gray-500">{calculatie.klant_email}</div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(calculatie.status)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(calculatie.metadata?.totaal_incl_btw)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(calculatie.updated_at)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {calculatie.pdf_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(calculatie.pdf_url, '_blank')}
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Link href={`/calculaties/${calculatie.id}`}>
                            <Button variant="ghost" size="sm" title="Bekijken">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(calculatie)}
                            title="Verwijderen"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
