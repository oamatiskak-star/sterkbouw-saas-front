// SterkBouw-SaaS-Frontend/pages/calculaties/index.js - MET DIRECT SUPABASE
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { supabase } from "@/lib/supabase" // Supabase import toegevoegd

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
  RefreshCw,
  TestTube,
  Database,
  ExternalLink
} from "lucide-react"

// Log de Supabase configuratie voor debugging
console.log('🔧 Supabase Configuratie:', {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set',
  HOST: typeof window !== 'undefined' ? window.location.host : 'server'
});

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

// Helper: Genereer mock calculaties voor demo/fallback
const generateMockCalculaties = (userId) => {
  return [
    {
      id: 'mock-1-' + Date.now(),
      naam: 'Transformatie Hotel Van der Valk',
      klant_naam: 'Van der Valk Group',
      adres: 'Hotelstraat 1',
      postcode: '1234 AB',
      plaats: 'Amsterdam',
      status: 'active',
      user_id: userId,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        oppervlakte: 2500,
        bouwjaar: 1985,
        kamers: 120,
        totaal_incl_btw: 1250000,
        project_type: 'transformatie'
      },
      pdf_url: null
    },
    {
      id: 'mock-2-' + Date.now(),
      naam: 'Renovatie Kantoor ING',
      klant_naam: 'ING Bank NV',
      adres: 'Bankstraat 42',
      postcode: '5678 CD',
      plaats: 'Rotterdam',
      status: 'draft',
      user_id: userId,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        oppervlakte: 1800,
        bouwjaar: 1990,
        kamers: 45,
        totaal_incl_btw: 750000,
        project_type: 'renovatie'
      },
      pdf_url: null
    },
    {
      id: 'mock-3-' + Date.now(),
      naam: 'Nieuwbouw Woningen Amstelveen',
      klant_naam: 'BPD Development',
      adres: 'Bosweg 15',
      postcode: '1181 AG',
      plaats: 'Amstelveen',
      status: 'completed',
      user_id: userId,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        oppervlakte: 3200,
        bouwjaar: 2024,
        kamers: 24,
        totaal_incl_btw: 2850000,
        project_type: 'nieuwbouw'
      },
      pdf_url: 'https://example.com/demo.pdf'
    }
  ];
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
  const [isCreating, setIsCreating] = useState(false) // Voor nieuwe calculatie knop
  const [supabaseStatus, setSupabaseStatus] = useState('unknown') // 'connected', 'error', 'unknown'
  
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
  // FUNCTIES - DIRECT SUPABASE VERSIE
  // ======================

  const fetchCalculaties = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const userId = userProfile?.id || user?.id
      if (!userId) {
        setError("Gebruiker niet gevonden")
        return
      }
      
      console.log('🔍 Fetching calculaties voor user:', userId);
      console.log('📡 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      // Test eerst of Supabase connectie werkt
      try {
        const { error: testError } = await supabase
          .from('calculaties')
          .select('id')
          .limit(1)
        
        if (testError && testError.code === 'PGRST301') {
          // Table doesn't exist yet
          console.log('⚠️ Table "calculaties" might not exist yet, will create demo data');
          setSupabaseStatus('table_missing')
        } else if (testError) {
          console.error('Supabase test error:', testError)
          setSupabaseStatus('error')
        } else {
          setSupabaseStatus('connected')
        }
      } catch (testErr) {
        console.error('Supabase connection test failed:', testErr)
        setSupabaseStatus('error')
      }
      
      // Haal calculaties op uit Supabase
      const { data, error } = await supabase
        .from('calculaties')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
      
      if (error) {
        console.error('Supabase query error:', error)
        
        // Als de tabel niet bestaat, gebruik mock data
        if (error.code === 'PGRST301' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('Table "calculaties" does not exist yet, using mock data')
          const mockData = generateMockCalculaties(userId)
          setCalculaties(mockData)
          updateStats(mockData)
          setSuccess('Tabel "calculaties" bestaat nog niet, toon demo data')
          setTimeout(() => setSuccess(null), 3000)
          return
        }
        
        throw new Error(`Supabase fout: ${error.message}`)
      }
      
      const calculatiesArray = Array.isArray(data) ? data : []
      
      // Als er data is, gebruik die
      if (calculatiesArray.length > 0) {
        console.log(`✅ ${calculatiesArray.length} calculaties gevonden in Supabase`)
        setCalculaties(calculatiesArray)
        updateStats(calculatiesArray)
      } else {
        // Geen data, gebruik mock voor demo
        console.log('Geen calculaties gevonden in Supabase, gebruik demo data')
        const mockData = generateMockCalculaties(userId)
        setCalculaties(mockData)
        updateStats(mockData)
        setSuccess('Geen projecten gevonden in database, toon demo data')
        setTimeout(() => setSuccess(null), 3000)
      }
      
    } catch (err) {
      console.error('❌ Fetch error:', err)
      
      // Fallback naar mock data
      const mockData = generateMockCalculaties(userProfile?.id || user?.id)
      setCalculaties(mockData)
      updateStats(mockData)
      
      setError(`
        🚨 Fout bij ophalen calculaties
        
        **Details:** ${err.message}
        
        **Oplossing gebruikt:** Demo data getoond
        
        **Supabase Status:** ${supabaseStatus}
      `)
    } finally {
      setIsLoading(false)
    }
  }

  // ======================
  // NIEUWE CALCULATIE FUNCTIE - SIMPELE SUPABASE VERSIE
  // ======================

  const handleNieuweCalculatie = async () => {
    if (!user) {
      setError("Je moet ingelogd zijn om een nieuwe calculatie te maken")
      router.push('/login')
      return
    }

    setIsCreating(true)
    setError(null)
    
    try {
      const userId = userProfile?.id || user?.id
      if (!userId) {
        throw new Error('Gebruiker niet gevonden')
      }

      console.log('🔄 Start nieuwe calculatie voor user:', userId)
      
      // Maak nieuwe calculatie aan in Supabase
      const { data: newCalc, error: supabaseError } = await supabase
        .from('calculaties')
        .insert({
          naam: `Nieuwe Calculatie ${format(new Date(), 'dd-MM HH:mm')}`,
          user_id: userId,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            aangemaakt_via: 'frontend_index',
            template: 'default',
            versie: 1,
            timestamp: new Date().toISOString(),
            totaal_incl_btw: 0
          }
        })
        .select()
        .single()

      if (supabaseError) {
        console.error('❌ Supabase error:', supabaseError)
        
        // Als de tabel niet bestaat, maak dan een demo ID aan
        if (supabaseError.code === 'PGRST301' || supabaseError.message.includes('relation')) {
          console.log('Table "calculaties" does not exist, creating demo ID')
          const demoId = `demo-${Date.now()}`
          setSuccess('Database tabel bestaat nog niet. Demo modus gestart.')
          router.push(`/calculaties/${demoId}?demo=true`)
          return
        }
        
        throw new Error(`Aanmaken mislukt: ${supabaseError.message}`)
      }

      console.log(`✅ Nieuwe calculatie aangemaakt in Supabase: ${newCalc.id}`)
      setSuccess('Nieuwe calculatie aangemaakt!')
      setTimeout(() => setSuccess(null), 3000)
      router.push(`/calculaties/${newCalc.id}`)

    } catch (error) {
      console.error('❌ Fout bij nieuwe calculatie:', error)
      
      setError(`
        Kon geen nieuwe calculatie starten:
        
        **Fout:** ${error.message}
        
        **Wat nu?**
        1. Probeer opnieuw
        2. Contacteer support als probleem aanhoudt
        3. Gebruik demo modus:
      `)
      
      // Bied demo optie aan
      if (confirm('Kon geen nieuwe calculatie starten. Wilt u een demo berekening zien?')) {
        const demoId = `demo-${Date.now()}`
        router.push(`/calculaties/${demoId}?demo=true`)
      }
    } finally {
      setIsCreating(false)
    }
  }

  // ======================
  // HULP FUNCTIES
  // ======================

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
      const userId = userProfile?.id || user?.id
      if (!userId) {
        setError("Gebruiker niet gevonden")
        return
      }
      
      // Direct Supabase delete
      const { error } = await supabase
        .from('calculaties')
        .delete()
        .eq('id', calculatie.id)
        .eq('user_id', userId) // Extra beveiliging
      
      if (error) {
        throw new Error(`Verwijderen mislukt: ${error.message}`)
      }
      
      const updatedCalculaties = calculaties.filter(c => c.id !== calculatie.id)
      setCalculaties(updatedCalculaties)
      updateStats(updatedCalculaties)
      
      setSuccess('Calculatie succesvol verwijderd')
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Verwijderen mislukt')
    } finally {
      setIsLoading(false)
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

  // Functie om Supabase tabel te testen
  const testSupabaseConnection = async () => {
    setIsLoading(true)
    try {
      console.log('🔍 Test Supabase connection...')
      
      // Test 1: Check if we can query
      const { data: tables, error: tablesError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .limit(5)
      
      console.log('Tables query result:', tablesError ? 'Error' : 'Success', tables)
      
      // Test 2: Try to count calculaties
      const { count, error: countError } = await supabase
        .from('calculaties')
        .select('*', { count: 'exact', head: true })
      
      console.log('Calculaties count:', count, 'Error:', countError)
      
      // Test 3: Try to get user's calculaties
      const userId = userProfile?.id || user?.id
      if (userId) {
        const { data, error } = await supabase
          .from('calculaties')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
        
        console.log('User calculaties test:', data, error)
      }
      
      alert(`
        Supabase Test Resultaten (zie console voor details):
        
        1. Tables query: ${tablesError ? 'Error' : 'Success'}
        2. Calculaties count: ${count !== null ? count : 'N/A'} (Error: ${countError ? 'Yes' : 'No'})
        3. Database: ${process.env.NEXT_PUBLIC_SUPABASE_URL}
        
        Controleer de browser console (F12) voor gedetailleerde logs.
      `)
      
    } catch (err) {
      console.error('Test error:', err)
      alert(`Test error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const openSupabaseDashboard = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', 'https://app.supabase.com/project/')
    if (url) {
      window.open(url, '_blank')
    } else {
      alert('Supabase URL is niet geconfigureerd')
    }
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
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={supabaseStatus === 'connected' ? 'default' : 'outline'} className="gap-1">
                <Database className="h-3 w-3" />
                {supabaseStatus === 'connected' ? 'Supabase verbonden' : 
                 supabaseStatus === 'table_missing' ? 'Tabel ontbreekt' : 
                 supabaseStatus === 'error' ? 'Fout' : 'Status onbekend'}
              </Badge>
              <span className="text-xs text-gray-500">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Database: Aan' : 'Database: Uit'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              className="gap-2"
              onClick={handleNieuweCalculatie}
              disabled={isCreating || isLoading}
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Aanmaken...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Nieuwe Calculatie
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={testSupabaseConnection}
              title="Test Supabase verbinding"
            >
              <TestTube className="h-4 w-4" />
            </Button>
          </div>
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
          <div className="mt-3 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchCalculaties()}
              className="mr-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Probeer opnieuw
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testSupabaseConnection}
            >
              <Database className="h-4 w-4 mr-1" />
              Test Database
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openSupabaseDashboard}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Supabase Dashboard
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
          <CardDescription>
            {isCreating && <span className="text-blue-600">• Nieuwe calculatie aanmaken...</span>}
            {supabaseStatus === 'table_missing' && (
              <span className="text-yellow-600">⚠️ Database tabel "calculaties" bestaat nog niet</span>
            )}
          </CardDescription>
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
                <Button 
                  className="gap-2"
                  onClick={handleNieuweCalculatie}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Aanmaken...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Nieuwe Calculatie
                    </>
                  )}
                </Button>
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
