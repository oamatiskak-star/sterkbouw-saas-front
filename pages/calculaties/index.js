// SterkBouw-SaaS-Frontend/pages/calculaties/index.js
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { supabase } from "@/lib/supabase"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Icons
import { 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpDown,
  RefreshCw,
  Wifi,
  Filter,
  Calendar,
  Building,
  User,
  ExternalLink,
  FolderPlus
} from "lucide-react"

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}

export default function CalculatiesPage() {
  const router = useRouter()
  const { user, loading: authLoading, userProfile } = useAuth()
  
  // State management
  const [calculaties, setCalculaties] = useState([])
  const [filteredCalculaties, setFilteredCalculaties] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updated_at")
  const [sortOrder, setSortOrder] = useState("desc")

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [isCreatingProject, setIsCreatingProject] = useState(false)

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
      loadCalculaties()
      loadProjects()
    }
  }, [user])

  useEffect(() => {
    filterAndSortCalculaties()
  }, [calculaties, searchTerm, statusFilter, sortBy, sortOrder])

  // ======================
  // DATA LOADING FUNCTIES
  // ======================

  const loadProjects = async () => {
    if (!user) return
    
    setLoadingProjects(true)
    try {
      const userId = userProfile?.id || user?.id
      
      // Probeer verschillende kolomnamen voor user ID
      let query = supabase
        .from('projecten')
        .select('id, naam, project_nummer, adres, plaats, klant_naam')
        .order('naam', { ascending: true })
      
      // Probeer verschillende gebruiker ID kolommen
      if (userId) {
        // Eerst proberen met 'gebruiker_id'
        const { data: data1, error: error1 } = await query.eq('gebruiker_id', userId)
        if (!error1 && data1) {
          setProjects(data1 || [])
          return
        }
        
        // Dan proberen met 'user_id'
        const { data: data2, error: error2 } = await query.eq('user_id', userId)
        if (!error2 && data2) {
          setProjects(data2 || [])
          return
        }
        
        // Als beide falen, probeer zonder filter (voor debugging)
        console.warn('Kan gebruiker ID kolom niet vinden, laad alle projecten (debug)')
        const { data: data3, error: error3 } = await query
        if (!error3) {
          setProjects(data3 || [])
        } else {
          console.error('Error loading projects:', error3)
        }
      }
      
    } catch (err) {
      console.error('Error loading projects:', err)
    } finally {
      setLoadingProjects(false)
    }
  }

  const loadCalculaties = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const userId = userProfile?.id || user?.id
      if (!userId) {
        setError("Gebruiker niet gevonden")
        return
      }
      
      console.log('📥 Laden calculaties voor gebruiker ID:', userId)
      
      // Eerst calculaties ophalen - probeer verschillende kolomnamen
      let calculatiesData = null
      let calculatiesError = null
      
      // Optie 1: Probeer met 'gebruiker_id'
      let query1 = supabase
        .from('calculaties')
        .select('*')
        .order('updated_at', { ascending: false })
      
      const { data: data1, error: error1 } = await query1.eq('gebruiker_id', userId)
      if (!error1) {
        calculatiesData = data1
        console.log('✅ Calculaties gevonden met gebruiker_id kolom')
      } else {
        console.log('❌ gebruiker_id kolom niet gevonden, fout:', error1.message)
        
        // Optie 2: Probeer met 'user_id'
        const { data: data2, error: error2 } = await query1.eq('user_id', userId)
        if (!error2) {
          calculatiesData = data2
          console.log('✅ Calculaties gevonden met user_id kolom')
        } else {
          console.log('❌ user_id kolom niet gevonden, fout:', error2.message)
          calculatiesError = error2
          
          // Optie 3: Probeer zonder filter (alleen voor debugging)
          console.warn('⚠️  Probeer calculaties zonder gebruiker filter (debug)')
          const { data: data3, error: error3 } = await query1
          if (!error3) {
            calculatiesData = data3
            console.log('⚠️  Geladen zonder gebruiker filter:', data3?.length, 'calculaties')
          } else {
            calculatiesError = error3
          }
        }
      }
      
      if (calculatiesError) {
        console.error('Database error bij calculaties:', calculatiesError)
        throw new Error(`Database fout: ${calculatiesError.message}`)
      }
      
      // Dan projecten ophalen voor mapping
      const { data: projectenData, error: projectError } = await supabase
        .from('projecten')
        .select('id, naam, adres, plaats, klant_naam')
      
      if (projectError) {
        console.error('Database error bij projecten:', projectError)
        // We kunnen doorgaan zonder projecten
      }
      
      // Maak een map van projecten voor snelle lookup
      const projectMap = {}
      if (projectenData) {
        projectenData.forEach(project => {
          projectMap[project.id] = project
        })
      }
      
      // Combineer calculaties met projectgegevens
      const combinedCalculaties = (calculatiesData || []).map(calculatie => {
        const project = projectMap[calculatie.project_id]
        return {
          ...calculatie,
          projecten: project || null
        }
      })
      
      console.log(`✅ ${combinedCalculaties.length} calculaties geladen`)
      
      setCalculaties(combinedCalculaties)
      updateStats(combinedCalculaties)
      
      if (combinedCalculaties.length === 0) {
        setSuccess('Nog geen calculaties. Maak je eerste calculatie aan!')
      }
      
    } catch (err) {
      console.error('Error loading calculaties:', err)
      setError(`Fout bij laden: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const createNewProject = async () => {
    if (!user) return
    
    setIsCreatingProject(true)
    setError(null)
    
    try {
      const userId = userProfile?.id || user?.id
      
      // Haal hoogste projectnummer op
      const { data: existingProjects } = await supabase
        .from('projecten')
        .select('project_nummer')
        .order('project_nummer', { ascending: false })
        .limit(1)
      
      const nextProjectNumber = existingProjects?.[0]?.project_nummer 
        ? existingProjects[0].project_nummer + 1 
        : 1001
      
      // Maak nieuw project - probeer verschillende gebruiker ID kolommen
      const projectData = {
        naam: `Nieuw Project ${nextProjectNumber}`,
        project_nummer: nextProjectNumber,
        status: 'actief',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        klant_naam: 'Nieuwe Klant',
        adres: 'Nog in te vullen',
        plaats: 'Nog in te vullen',
        metadata: {
          aangemaakt_op: new Date().toISOString(),
          is_nieuw: true
        }
      }
      
      // Probeer eerst met 'gebruiker_id', dan met 'user_id'
      let newProject = null
      let createError = null
      
      try {
        const { data, error } = await supabase
          .from('projecten')
          .insert({
            ...projectData,
            gebruiker_id: userId
          })
          .select()
          .single()
        
        if (!error) {
          newProject = data
        } else {
          createError = error
        }
      } catch (err) {
        createError = err
      }
      
      // Als 'gebruiker_id' faalt, probeer 'user_id'
      if (createError) {
        console.log('Probeer project aanmaken met user_id kolom')
        const { data, error } = await supabase
          .from('projecten')
          .insert({
            ...projectData,
            user_id: userId
          })
          .select()
          .single()
        
        if (error) {
          throw error
        }
        newProject = data
      }
      
      if (!newProject) {
        throw new Error('Kon project niet aanmaken')
      }
      
      // Refresh projecten lijst
      await loadProjects()
      
      // Selecteer het nieuwe project
      setSelectedProjectId(newProject.id)
      
      return newProject.id
      
    } catch (err) {
      console.error('Error creating project:', err)
      setError(`Project aanmaken mislukt: ${err.message}`)
      return null
    } finally {
      setIsCreatingProject(false)
    }
  }

  const handleNewCalculatie = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    
    setIsCreating(true)
    setError(null)
    
    try {
      const userId = userProfile?.id || user?.id
      
      // Bepaal project ID
      let projectId = selectedProjectId
      
      // Als er geen project is geselecteerd, maak er een aan
      if (!projectId) {
        projectId = await createNewProject()
        if (!projectId) {
          throw new Error('Kon geen project aanmaken')
        }
      }
      
      // Haal het hoogste calculatienummer op
      const { data: existingCalculaties } = await supabase
        .from('calculaties')
        .select('calculatie_nummer')
        .order('calculatie_nummer', { ascending: false })
        .limit(1)
      
      const nextNumber = existingCalculaties?.[0]?.calculatie_nummer 
        ? existingCalculaties[0].calculatie_nummer + 1 
        : 1001
      
      // Maak nieuwe calculatie - probeer verschillende gebruiker ID kolommen
      const calculatieData = {
        naam: `Calculatie ${nextNumber}`,
        calculatie_nummer: nextNumber,
        project_id: projectId,
        status: 'concept',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          aangemaakt_op: new Date().toISOString(),
          template: 'standaard',
          versie: 1,
          project_id: projectId
        }
      }
      
      let newCalculatie = null
      let createError = null
      
      try {
        // Probeer eerst met 'gebruiker_id'
        const { data, error } = await supabase
          .from('calculaties')
          .insert({
            ...calculatieData,
            gebruiker_id: userId
          })
          .select()
          .single()
        
        if (!error) {
          newCalculatie = data
        } else {
          createError = error
        }
      } catch (err) {
        createError = err
      }
      
      // Als 'gebruiker_id' faalt, probeer 'user_id'
      if (createError) {
        console.log('Probeer calculatie aanmaken met user_id kolom')
        const { data, error } = await supabase
          .from('calculaties')
          .insert({
            ...calculatieData,
            user_id: userId
          })
          .select()
          .single()
        
        if (error) {
          throw error
        }
        newCalculatie = data
      }
      
      if (!newCalculatie) {
        throw new Error('Kon calculatie niet aanmaken')
      }
      
      setSuccess('Nieuwe calculatie aangemaakt!')
      setIsDialogOpen(false)
      
      // Navigeer naar de calculatie/nieuw pagina met de juiste parameters
      router.push(`/calculatie/nieuw?id=${newCalculatie.id}&project_id=${projectId}`)
      
    } catch (err) {
      console.error('Error creating calculatie:', err)
      setError(`Aanmaken mislukt: ${err.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  const openNewCalculatieDialog = () => {
    setSelectedProjectId("")
    setIsDialogOpen(true)
  }

  const deleteCalculatie = async (calculatie) => {
    if (!calculatie || !user) return
    
    if (!confirm(`Weet u zeker dat u "${calculatie.naam}" wilt verwijderen?\nDeze actie kan niet ongedaan worden gemaakt.`)) {
      return
    }
    
    try {
      const userId = userProfile?.id || user?.id
      
      // Probeer eerst met 'gebruiker_id'
      let error = null
      
      try {
        const result = await supabase
          .from('calculaties')
          .delete()
          .eq('id', calculatie.id)
          .eq('gebruiker_id', userId)
        
        error = result.error
      } catch (err) {
        error = err
      }
      
      // Als 'gebruiker_id' faalt, probeer 'user_id'
      if (error) {
        const result = await supabase
          .from('calculaties')
          .delete()
          .eq('id', calculatie.id)
          .eq('user_id', userId)
        
        error = result.error
      }
      
      if (error) throw error
      
      // Update local state
      const updatedCalculaties = calculaties.filter(c => c.id !== calculatie.id)
      setCalculaties(updatedCalculaties)
      updateStats(updatedCalculaties)
      
      setSuccess('Calculatie succesvol verwijderd')
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err) {
      console.error('Error deleting calculatie:', err)
      setError(`Verwijderen mislukt: ${err.message}`)
    }
  }

  // ======================
  // HELPER FUNCTIES
  // ======================

  const filterAndSortCalculaties = () => {
    if (!calculaties || !Array.isArray(calculaties)) {
      setFilteredCalculaties([])
      return
    }
    
    let filtered = [...calculaties]
    
    // Zoekfilter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(calc => {
        return (
          (calc.naam && calc.naam.toLowerCase().includes(term)) ||
          (calc.klant_naam && calc.klant_naam.toLowerCase().includes(term)) ||
          (calc.adres && calc.adres.toLowerCase().includes(term)) ||
          (calc.plaats && calc.plaats.toLowerCase().includes(term)) ||
          (calc.calculatie_nummer && calc.calculatie_nummer.toString().includes(term)) ||
          (calc.projecten?.naam && calc.projecten.naam.toLowerCase().includes(term)) ||
          (calc.projecten?.klant_naam && calc.projecten.klant_naam.toLowerCase().includes(term))
        )
      })
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(calc => calc.status === statusFilter)
    }
    
    // Sorteren
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case "naam":
          aValue = (a.naam || "").toLowerCase()
          bValue = (b.naam || "").toLowerCase()
          break
        case "calculatie_nummer":
          aValue = a.calculatie_nummer || 0
          bValue = b.calculatie_nummer || 0
          break
        case "totaal":
          aValue = a.metadata?.totaal_incl_btw || 
                  a.totaal_incl_btw || 
                  a.totaal_bedrag || 
                  a.totaal || 
                  0
          bValue = b.metadata?.totaal_incl_btw || 
                  b.totaal_incl_btw || 
                  b.totaal_bedrag || 
                  b.totaal || 
                  0
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
    
    const stats = {
      total: calculatiesArray.length,
      active: calculatiesArray.filter(c => c.status === 'actief' || c.status === 'active').length,
      completed: calculatiesArray.filter(c => c.status === 'voltooid' || c.status === 'completed' || c.status === 'afgerond').length,
      draft: calculatiesArray.filter(c => c.status === 'concept' || c.status === 'draft').length,
      totalValue: calculatiesArray.reduce((sum, c) => {
        const value = c.metadata?.totaal_incl_btw || 
                     c.totaal_incl_btw || 
                     c.totaal_bedrag || 
                     c.totaal || 
                     0
        return sum + Number(value)
      }, 0)
    }
    
    setStats(stats)
  }

  const getStatusBadge = (status) => {
    if (!status) status = 'concept'
    
    const statusMap = {
      'concept': { variant: "outline", icon: Clock, text: "Concept", color: "text-gray-600" },
      'draft': { variant: "outline", icon: Clock, text: "Concept", color: "text-gray-600" },
      'actief': { variant: "secondary", icon: RefreshCw, text: "Actief", color: "text-blue-600" },
      'active': { variant: "secondary", icon: RefreshCw, text: "Actief", color: "text-blue-600" },
      'voltooid': { variant: "default", icon: CheckCircle, text: "Voltooid", color: "text-green-600" },
      'completed': { variant: "default", icon: CheckCircle, text: "Voltooid", color: "text-green-600" },
      'afgerond': { variant: "default", icon: CheckCircle, text: "Afgerond", color: "text-green-600" },
      'geannuleerd': { variant: "destructive", icon: XCircle, text: "Geannuleerd", color: "text-red-600" },
      'cancelled': { variant: "destructive", icon: XCircle, text: "Geannuleerd", color: "text-red-600" }
    }
    
    const config = statusMap[status] || statusMap.concept
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className={`gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "-"
      return format(new Date(dateString), 'dd-MM-yyyy', { locale: nl })
    } catch {
      return "-"
    }
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === "") return "€ -"
    const numAmount = Number(amount)
    if (isNaN(numAmount)) return "€ -"
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount)
  }

  const formatProjectInfo = (calculatie) => {
    if (calculatie.projecten) {
      const address = calculatie.projecten.adres || ""
      const city = calculatie.projecten.plaats || ""
      if (address || city) {
        return `${address}${address && city ? " • " : ""}${city}`
      }
      return calculatie.projecten.naam || "Geen projectinformatie"
    }
    
    if (calculatie.adres || calculatie.plaats) {
      return `${calculatie.adres || ''}${calculatie.adres && calculatie.plaats ? " • " : ""}${calculatie.plaats || ''}`
    }
    
    return "Geen projectinformatie"
  }

  const handleViewCalculatie = (calculatieId) => {
    router.push(`/calculaties/${calculatieId}`)
  }

  const handleEditCalculatie = (calculatieId) => {
    router.push(`/calculatie/nieuw?id=${calculatieId}`)
  }

  // ======================
  // RENDER
  // ======================

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticatie controleren...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dialog voor nieuwe calculatie */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nieuwe Calculatie</DialogTitle>
            <DialogDescription>
              Kies een bestaand project of maak een nieuw project aan voor deze calculatie.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project selecteren</Label>
              <Select 
                value={selectedProjectId} 
                onValueChange={setSelectedProjectId}
                disabled={isCreatingProject || loadingProjects}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingProjects ? "Projecten laden..." : "Selecteer een project"} />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 ? (
                    <SelectItem value="" disabled>
                      {loadingProjects ? "Laden..." : "Geen projecten gevonden"}
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="new">
                        + Nieuw project aanmaken
                      </SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.naam} • {project.adres || "Geen adres"}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                {projects.length} projecten beschikbaar
              </p>
            </div>
            
            {selectedProjectId === "new" && (
              <div className="space-y-2">
                <Label>Nieuw project aanmaken</Label>
                <div className="text-sm text-gray-600">
                  Er wordt automatisch een nieuw project aangemaakt met een volgend projectnummer.
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreating}
            >
              Annuleren
            </Button>
            <Button
              onClick={handleNewCalculatie}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Aanmaken...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {selectedProjectId === "new" ? "Project & Calculatie aanmaken" : "Calculatie aanmaken"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculaties</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <Wifi className="h-3 w-3 text-green-500" />
                Verbonden
              </Badge>
              <span className="text-sm text-gray-500">
                {calculaties.length} calculaties gevonden
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => loadCalculaties()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Vernieuwen
            </Button>
            <Button 
              className="gap-2"
              onClick={openNewCalculatieDialog}
              disabled={loading || isCreating}
            >
              <Plus className="h-4 w-4" />
              Nieuwe Calculatie
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
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
                  <p className="text-xl font-bold">{formatCurrency(stats.totalValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="font-medium">Fout</h3>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadCalculaties()}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Probeer opnieuw
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
                placeholder="Zoeken op naam, klant, nummer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {["all", "concept", "actief", "voltooid", "geannuleerd"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "all" ? "Alle" : 
                     status === "concept" ? "Concept" :
                     status === "actief" ? "Actief" : 
                     status === "voltooid" ? "Voltooid" : "Geannuleerd"}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">Sorteren op</label>
              <div className="flex gap-2">
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="updated_at">Laatst gewijzigd</option>
                  <option value="created_at">Aanmaakdatum</option>
                  <option value="naam">Naam</option>
                  <option value="calculatie_nummer">Calculatie nummer</option>
                  <option value="totaal">Totale waarde</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                >
                  <ArrowUpDown className="h-4 w-4" />
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
          <CardDescription>
            {loading && <span className="text-blue-600">• Laden...</span>}
            {!loading && (
              <span className="text-gray-600">
                {calculaties.length > 0 && `Laatst geladen: ${new Date().toLocaleTimeString('nl-NL')}`}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner />
          ) : filteredCalculaties.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {calculaties.length === 0 ? "Nog geen calculaties" : "Geen resultaten gevonden"}
              </h3>
              <p className="text-gray-600 mb-6">
                {calculaties.length === 0 
                  ? "Maak je eerste calculatie aan om te beginnen" 
                  : "Pas je zoekopdracht aan om meer resultaten te zien"}
              </p>
              {calculaties.length === 0 && (
                <Button 
                  className="gap-2"
                  onClick={openNewCalculatieDialog}
                  disabled={loading || isCreating}
                >
                  <Plus className="h-4 w-4" />
                  Eerste Calculatie
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Calculatie</TableHead>
                    <TableHead>Klant/Project</TableHead>
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
                        <div className="font-medium">{calculatie.naam || "Naamloos"}</div>
                        <div className="text-sm text-gray-500">
                          Calc. #{calculatie.calculatie_nummer || calculatie.id?.substring(0, 8)}
                          {calculatie.projecten?.naam && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                <Building className="h-3 w-3 mr-1" />
                                {calculatie.projecten.naam}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {calculatie.klant_naam || calculatie.projecten?.klant_naam || "Geen klant"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatProjectInfo(calculatie)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(calculatie.status)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(
                          calculatie.metadata?.totaal_incl_btw || 
                          calculatie.totaal_incl_btw || 
                          calculatie.totaal_bedrag || 
                          0
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{formatDate(calculatie.updated_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Bekijken"
                            onClick={() => handleViewCalculatie(calculatie.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Bewerken"
                            onClick={() => handleEditCalculatie(calculatie.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {calculatie.pdf_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(calculatie.pdf_url, '_blank')}
                              title="PDF Downloaden"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCalculatie(calculatie)}
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
