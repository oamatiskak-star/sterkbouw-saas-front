// pages/calculaties/[id].js
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import Link from "next/link"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

// Icons
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  FileText, 
  Building, 
  Calendar,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2
} from "lucide-react"

// API endpoints
const API_ENDPOINTS = {
  BACKEND_API: process.env.NEXT_PUBLIC_BACKEND_API || "https://sterkbouw-saas-backend-production.up.railway.app",
  EXECUTOR_API: process.env.NEXT_PUBLIC_EXECUTOR_API || "https://sterkbouw-saas-executor-production.up.railway.app",
}

export default function CalculatieDetail() {
  const router = useRouter()
  const { id } = router.query
  const { user, loading: authLoading } = useAuth()

  const [calculatie, setCalculatie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!id || !user) return

    async function loadCalculatie() {
      setLoading(true)
      setError(null)

      try {
        // Haal eerst het project op
        const token = await user.getIdToken()
        const projectRes = await fetch(`${API_ENDPOINTS.BACKEND_API}/api/projects/${id}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        if (!projectRes.ok) {
          if (projectRes.status === 404) {
            setError("Calculatie niet gevonden")
            return
          }
          throw new Error(`HTTP ${projectRes.status}`)
        }

        const projectData = await projectRes.json()
        
        // Als er metadata is met berekeningen, gebruik die
        // Anders maak we een eenvoudige weergave
        if (projectData) {
          setCalculatie(projectData)
        }

      } catch (err) {
        console.error("Load error:", err)
        setError(err.message || "Fout bij het laden van calculatie")
      } finally {
        setLoading(false)
      }
    }

    loadCalculatie()
  }, [id, user])

  // =========================
  // HANDLE FILE UPLOAD
  // =========================
  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file || !calculatie) return

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('project_id', calculatie.id)
      formData.append('calculatie_id', id)
      formData.append('user_id', user?.id || '')

      const res = await fetch(`${API_ENDPOINTS.EXECUTOR_API}/api/upload`, {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Upload mislukt (${res.status})`)
      }

      // Refresh de calculatie data na upload
      router.reload()

    } catch (err) {
      console.error("Upload error:", err)
      setUploadError(err.message || "Upload mislukt")
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ""
    }
  }

  const handleDelete = async () => {
    if (!confirm("Weet u zeker dat u deze calculatie wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.")) {
      return
    }

    try {
      const token = await user.getIdToken()
      const res = await fetch(`${API_ENDPOINTS.BACKEND_API}/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error("Verwijderen mislukt")
      }

      // Navigeer terug naar calculaties overzicht
      router.push('/calculaties')

    } catch (err) {
      setError(err.message || "Verwijderen mislukt")
    }
  }

  // =========================
  // RENDER
  // =========================
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Calculatie laden...</p>
        </div>
      </div>
    )
  }

  if (error || !calculatie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fout</AlertTitle>
          <AlertDescription>
            {error || "Calculatie niet gevonden"}
          </AlertDescription>
        </Alert>
        <Link href="/calculaties">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Terug naar overzicht
          </Button>
        </Link>
      </div>
    )
  }

  // Helper functies
  const getStatusBadge = (status) => {
    const variants = {
      draft: { variant: "outline", icon: Clock, text: "Concept" },
      active: { variant: "secondary", icon: AlertCircle, text: "Actief" },
      completed: { variant: "default", icon: CheckCircle, text: "Voltooid" },
      ready: { variant: "default", icon: CheckCircle, text: "Gereed" }
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

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "€ 0,00"
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Onbekend"
      const date = new Date(dateString)
      return date.toLocaleDateString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return "Onbekend"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link href="/calculaties">
              <Button variant="ghost" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Terug naar overzicht
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {calculatie.naam || "Naamloos project"}
            </h1>
            <div className="flex items-center gap-4">
              {getStatusBadge(calculatie.status)}
              <span className="text-gray-600">
                Laatst bijgewerkt: {formatDate(calculatie.updated_at)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {calculatie.pdf_url && (
              <Button
                onClick={() => window.open(calculatie.pdf_url, '_blank')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                PDF Downloaden
              </Button>
            )}
            
            <Link href={`/calculaties/${id}/bewerken`}>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Bewerken
              </Button>
            </Link>
            
            <Button
              variant="destructive"
              className="gap-2"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Verwijderen
            </Button>
          </div>
        </div>
      </div>

      {/* Error alerts */}
      {uploadError && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Upload fout</AlertTitle>
          <AlertDescription className="text-red-700">{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Projectinformatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Klant</h3>
                  <p className="font-medium">{calculatie.klant_naam || "Niet opgegeven"}</p>
                  {calculatie.klant_email && (
                    <p className="text-sm text-gray-600">{calculatie.klant_email}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Adres</h3>
                  <p className="font-medium">
                    {calculatie.adres || "Niet opgegeven"}
                    {calculatie.postcode && `, ${calculatie.postcode}`}
                    {calculatie.plaats && ` ${calculatie.plaats}`}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Projecttype</h3>
                  <p className="font-medium capitalize">{calculatie.project_type || "niet opgegeven"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Aanmaakdatum</h3>
                  <p className="font-medium">{formatDate(calculatie.created_at)}</p>
                </div>
              </div>

              {calculatie.metadata && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {calculatie.metadata.oppervlakte && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Oppervlakte</h3>
                        <p className="font-medium">{calculatie.metadata.oppervlakte} m²</p>
                      </div>
                    )}
                    
                    {calculatie.metadata.bouwjaar && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Bouwjaar</h3>
                        <p className="font-medium">{calculatie.metadata.bouwjaar}</p>
                      </div>
                    )}
                    
                    {calculatie.metadata.kamers && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Kamers</h3>
                        <p className="font-medium">{calculatie.metadata.kamers}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                      {getStatusBadge(calculatie.status)}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Bestanden uploaden */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bestanden uploaden
              </CardTitle>
              <CardDescription>
                Upload tekeningen of documenten voor AI-analyse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Sleep bestanden hierheen of klik om te selecteren
                </p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" as="span" disabled={uploading}>
                    {uploading ? "Uploaden..." : "Selecteer bestand"}
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-4">
                  Ondersteunde formaten: PDF, DWG, DXF, JPG, PNG, DOC
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financieel overzicht
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {calculatie.metadata?.subtotaal && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotaal:</span>
                  <span className="font-medium">{formatCurrency(calculatie.metadata.subtotaal)}</span>
                </div>
              )}
              
              {calculatie.metadata?.totaal_excl_btw && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Totaal excl. BTW:</span>
                  <span className="font-medium">{formatCurrency(calculatie.metadata.totaal_excl_btw)}</span>
                </div>
              )}
              
              {calculatie.metadata?.btw_bedrag && (
                <div className="flex justify-between">
                  <span className="text-gray-600">BTW:</span>
                  <span className="font-medium">{formatCurrency(calculatie.metadata.btw_bedrag)}</span>
                </div>
              )}
              
              {calculatie.metadata?.totaal_incl_btw && (
                <>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>Totaal incl. BTW:</span>
                    <span>{formatCurrency(calculatie.metadata.totaal_incl_btw)}</span>
                  </div>
                </>
              )}
              
              {!calculatie.metadata?.totaal_incl_btw && (
                <div className="text-center py-4 text-gray-500">
                  Financiële details niet beschikbaar
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle>Snelle acties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link href={`/calculaties/${id}/bewerken`}>
                  <Edit className="h-4 w-4" />
                  Calculatie bewerken
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link href="/calculaties/nieuw">
                  <FileText className="h-4 w-4" />
                  Dupliceer calculatie
                </Link>
              </Button>
              
              {calculatie.pdf_url && (
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="h-4 w-4" />
                  PDF downloaden
                </Button>
              )}
              
              <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Verwijder calculatie
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
