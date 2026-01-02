import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

// Icons
import { 
  Search, 
  Filter, 
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
  MoreVertical,
  RefreshCw
} from "lucide-react"

// API endpoints
const API_ENDPOINTS = {
  BACKEND_API: process.env.NEXT_PUBLIC_BACKEND_API || "https://sterkbouw-saas-backend-production.up.railway.app",
}

export default function CalculatiesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  // State management
  const [calculaties, setCalculaties] = useState([])
  const [filteredCalculaties, setFilteredCalculaties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectTypeFilter, setProjectTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updated_at")
  const [sortOrder, setSortOrder] = useState("desc")
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [calculatieToDelete, setCalculatieToDelete] = useState(null)
  
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
    if (!authLoading && !user) {
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
  }, [calculaties, searchTerm, statusFilter, projectTypeFilter, sortBy, sortOrder])

  // ======================
  // FUNCTIES
  // ======================

  const fetchCalculaties = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_ENDPOINTS.BACKEND_API}/api/projects?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Fout bij het ophalen van calculaties')
      }
      
      const data = await response.json()
      setCalculaties(data)
      updateStats(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      console.error('Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortCalculaties = () => {
    let filtered = [...calculaties]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(calc =>
        calc.naam?.toLowerCase().includes(term) ||
        calc.klant_naam?.toLowerCase().includes(term) ||
        calc.adres?.toLowerCase().includes(term) ||
        calc.plaats?.toLowerCase().includes(term)
      )
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(calc => calc.status === statusFilter)
    }
    
    // Apply project type filter
    if (projectTypeFilter !== "all") {
      filtered = filtered.filter(calc => calc.project_type === projectTypeFilter)
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case "naam":
          aValue = a.naam?.toLowerCase() || ""
          bValue = b.naam?.toLowerCase() || ""
          break
        case "klant_naam":
          aValue = a.klant_naam?.toLowerCase() || ""
          bValue = b.klant_naam?.toLowerCase() || ""
          break
        case "totaal_incl_btw":
          aValue = a.metadata?.totaal_incl_btw || 0
          bValue = b.metadata?.totaal_incl_btw || 0
          break
        case "created_at":
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case "updated_at":
        default:
          aValue = new Date(a.updated_at).getTime()
          bValue = new Date(b.updated_at).getTime()
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    setFilteredCalculaties(filtered)
  }

  const updateStats = (calculaties) => {
    const stats = {
      total: calculaties.length,
      active: calculaties.filter(c => c.status === 'active').length,
      completed: calculaties.filter(c => c.status === 'completed').length,
      draft: calculaties.filter(c => c.status === 'draft').length,
      totalValue: calculaties.reduce((sum, c) => {
        return sum + (c.metadata?.totaal_incl_btw || 0)
      }, 0)
    }
    setStats(stats)
  }

  const handleDeleteClick = (calculatie) => {
    setCalculatieToDelete(calculatie)
    setDeleteDialogOpen(true)
  }

  const deleteCalculatie = async () => {
    if (!calculatieToDelete || !user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_ENDPOINTS.BACKEND_API}/api/projects/${calculatieToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Verwijderen mislukt')
      }
      
      // Update local state
      const updatedCalculaties = calculaties.filter(c => c.id !== calculatieToDelete.id)
      setCalculaties(updatedCalculaties)
      updateStats(updatedCalculaties)
      
      setSuccess('Calculatie succesvol verwijderd')
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verwijderen mislukt')
    } finally {
      setIsLoading(false)
      setDeleteDialogOpen(false)
      setCalculatieToDelete(null)
    }
  }

  const handleDuplicate = async (calculatie) => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const duplicateData = {
        ...calculatie,
        naam: `${calculatie.naam} (kopie)`,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      delete duplicateData.id
      delete duplicateData.created_at
      delete duplicateData.updated_at
      
      const response = await fetch(`${API_ENDPOINTS.BACKEND_API}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify(duplicateData)
      })
      
      if (!response.ok) {
        throw new Error('Dupliceren mislukt')
      }
      
      const newCalculatie = await response.json()
      
      // Add to local state
      setCalculaties([newCalculatie, ...calculaties])
      
      setSuccess('Calculatie succesvol gedupliceerd')
      setTimeout(() => setSuccess(null), 3000)
      
      // Navigate to edit page
      router.push(`/calculaties/${newCalculatie.id}`)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dupliceren mislukt')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      draft: { variant: "outline", icon: Clock, text: "Concept", color: "text-gray-600" },
      active: { variant: "secondary", icon: RefreshCw, text: "Actief", color: "text-blue-600" },
      completed: { variant: "default", icon: CheckCircle, text: "Voltooid", color: "text-green-600" },
      cancelled: { variant: "destructive", icon: XCircle, text: "Geannuleerd", color: "text-red-600" }
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

  const getProjectTypeBadge = (type) => {
    const types = {
      nieuwbouw: { color: "bg-blue-100 text-blue-800" },
      renovatie: { color: "bg-orange-100 text-orange-800" },
      transformatie: { color: "bg-purple-100 text-purple-800" },
      verduurzaming: { color: "bg-green-100 text-green-800" },
      onderhoud: { color: "bg-yellow-100 text-yellow-800" }
    }
    
    const config = types[type] || { color: "bg-gray-100 text-gray-800" }
    
    return (
      <Badge variant="outline" className={config.color}>
        {type}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd-MM-yyyy', { locale: nl })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  // ======================
  // RENDER
  // ======================

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Laden...</p>
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
            <p className="text-gray-600">
              Overzicht van al uw bouwcalculaties en projecten
            </p>
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Totaal</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Concept</p>
                  <p className="text-2xl font-bold">{stats.draft}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Actief</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Voltooid</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Totale waarde</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fout- en succesmeldingen */}
      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Fout</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Succes</AlertTitle>
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters en zoeken */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Zoekveld */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoeken op project, klant, adres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter op status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="draft">Concept</SelectItem>
                <SelectItem value="active">Actief</SelectItem>
                <SelectItem value="completed">Voltooid</SelectItem>
                <SelectItem value="cancelled">Geannuleerd</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Projecttype filter */}
            <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter op type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle types</SelectItem>
                <SelectItem value="nieuwbouw">Nieuwbouw</SelectItem>
                <SelectItem value="renovatie">Renovatie</SelectItem>
                <SelectItem value="transformatie">Transformatie</SelectItem>
                <SelectItem value="verduurzaming">Verduurzaming</SelectItem>
                <SelectItem value="onderhoud">Onderhoud</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Sorteeropties */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sorteren op" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_at">Datum (nieuwste eerst)</SelectItem>
                <SelectItem value="created_at">Aanmaakdatum</SelectItem>
                <SelectItem value="naam">Projectnaam</SelectItem>
                <SelectItem value="klant_naam">Klantnaam</SelectItem>
                <SelectItem value="totaal_incl_btw">Totaalbedrag</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs defaultValue="table" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Tabelweergave</TabsTrigger>
          <TabsTrigger value="grid">Kaartweergave</TabsTrigger>
        </TabsList>
        
        {/* Tabelweergave */}
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>
                Alle Calculaties ({filteredCalculaties.length})
              </CardTitle>
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">
                          <button 
                            onClick={() => toggleSort("naam")}
                            className="flex items-center gap-1 hover:text-blue-600"
                          >
                            Project
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button 
                            onClick={() => toggleSort("klant_naam")}
                            className="flex items-center gap-1 hover:text-blue-600"
                          >
                            Klant
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                          <button 
                            onClick={() => toggleSort("totaal_incl_btw")}
                            className="flex items-center gap-1 hover:text-blue-600"
                          >
                            Totaal
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button 
                            onClick={() => toggleSort("updated_at")}
                            className="flex items-center gap-1 hover:text-blue-600"
                          >
                            Laatst gewijzigd
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                        <TableHead className="text-right">Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCalculaties.map((calculatie) => (
                        <TableRow key={calculatie.id} className="group hover:bg-gray-50">
                          <TableCell>
                            <div className="font-medium">{calculatie.naam}</div>
                            <div className="text-sm text-gray-500">
                              {calculatie.adres}, {calculatie.postcode} {calculatie.plaats}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{calculatie.klant_naam}</div>
                            {calculatie.klant_email && (
                              <div className="text-sm text-gray-500">{calculatie.klant_email}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {getProjectTypeBadge(calculatie.project_type)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(calculatie.status)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(calculatie.metadata?.totaal_incl_btw)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(calculatie.updated_at)}
                            </div>
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Bekijken"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              
                              <Link href={`/calculaties/${calculatie.id}/bewerken`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Bewerken"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicate(calculatie)}
                                title="Dupliceren"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              
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
        </TabsContent>
        
        {/* Kaartweergave */}
        <TabsContent value="grid">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCalculaties.map((calculatie) => (
                <Card key={calculatie.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg line-clamp-1">
                          {calculatie.naam}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          {calculatie.adres}, {calculatie.plaats}
                        </CardDescription>
                      </div>
                      {getStatusBadge(calculatie.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{calculatie.klant_naam}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {calculatie.project_type}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {formatDate(calculatie.updated_at)}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(calculatie.metadata?.totaal_incl_btw)}
                      </div>
                    </div>
                    
                    {calculatie.metadata?.oppervlakte && (
                      <div className="text-sm text-gray-600">
                        Oppervlakte: {calculatie.metadata.oppervlakte} m²
                      </div>
                    )}
                    
                    {calculatie.opmerkingen && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {calculatie.opmerkingen}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-3 border-t">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {calculatie.pdf_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(calculatie.pdf_url, '_blank')}
                            className="gap-1"
                          >
                            <Download className="h-3 w-3" />
                            PDF
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link href={`/calculaties/${calculatie.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </Link>
                        
                        <Link href={`/calculaties/${calculatie.id}/bewerken`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(calculatie)}
                          className="gap-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Verwijder dialoog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calculatie verwijderen</DialogTitle>
            <DialogDescription>
              Weet u zeker dat u de calculatie "{calculatieToDelete?.naam}" wilt verwijderen?
              Deze actie kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Annuleren
            </Button>
            <Button
              variant="destructive"
              onClick={deleteCalculatie}
              disabled={isLoading}
            >
              {isLoading ? "Verwijderen..." : "Verwijderen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
