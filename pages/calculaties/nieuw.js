import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
// UI Components - alle correct geïmporteerd
import Card from "@/components/ui/card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Label from "@/components/ui/label"
import Textarea from "@/components/ui/textarea"
import Select from "@/components/ui/select"
import Badge from "@/components/ui/badge"
import Progress from "@/components/ui/progress"
import Separator from "@/components/ui/separator"
import Alert from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Building, Calculator, Download, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react"

// Card subcomponents - toegevoegd
const CardHeader = ({ className, children, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...props}>
    {children}
  </div>
)

const CardTitle = ({ className, children, ...props }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`} {...props}>
    {children}
  </h3>
)

const CardDescription = ({ className, children, ...props }) => (
  <p className={`text-sm text-muted-foreground ${className || ''}`} {...props}>
    {children}
  </p>
)

const CardContent = ({ className, children, ...props }) => (
  <div className={`p-6 pt-0 ${className || ''}`} {...props}>
    {children}
  </div>
)

// Alert subcomponents - toegevoegd
const AlertTitle = ({ className, children, ...props }) => (
  <h5 className={`mb-1 font-medium leading-none tracking-tight ${className || ''}`} {...props}>
    {children}
  </h5>
)

const AlertDescription = ({ className, children, ...props }) => (
  <div className={`text-sm ${className || ''}`} {...props}>
    {children}
  </div>
)

// Select subcomponents - toegevoegd
const SelectTrigger = ({ className, children, ...props }) => (
  <div className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`} {...props}>
    {children}
  </div>
)

const SelectValue = ({ placeholder, children, ...props }) => (
  <span className={`${!children ? 'text-muted-foreground' : ''}`} {...props}>
    {children || placeholder}
  </span>
)

const SelectContent = ({ className, children, ...props }) => (
  <div className={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className || ''}`} {...props}>
    <div className="p-1">{children}</div>
  </div>
)

const SelectItem = ({ className, children, value, ...props }) => (
  <div className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className || ''}`} {...props}>
    {children}
  </div>
)

// API endpoints
const API_ENDPOINTS = {
  EXECUTOR_API: process.env.NEXT_PUBLIC_EXECUTOR_API || "https://sterkbouw-saas-executor-production.up.railway.app",
  BACKEND_API: process.env.NEXT_PUBLIC_BACKEND_API || "https://sterkbouw-saas-backend-production.up.railway.app",
}

// Types
const PostType = {
  id: "",
  code: "",
  omschrijving: "",
  eenheid: "",
  aantal: 0,
  eenheidsprijs: 0,
  arbeidsuren: 0,
  materiaal: 0,
  opmerking: "",
  categorie: ""
}

const AnalyseResultaatType = {
  oppervlakte_m2: 0,
  bouwjaar: 0,
  aantal_kamers: 0,
  project_type: 'onbekend',
  materiaal_suggesties: [],
  risico_indicatoren: [],
  verduurzamingspotentieel: [],
  geschatte_totale_kosten: 0,
  confidence_score: 0
}

export default function NieuweCalculatiePage() {
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  
  // State management
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Project state
  const [project, setProject] = useState(null)
  const [projectId, setProjectId] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    klant_naam: "",
    klant_email: "",
    klant_telefoon: "",
    adres: "",
    postcode: "",
    plaats: "",
    project_naam: "",
    project_type: "transformatie",
    oppervlakte_m2: "",
    bouwjaar: "",
    aantal_kamers: "",
    opmerkingen: "",
  })
  
  // Calculatie state
  const [posten, setPosten] = useState([
    {
      id: "1",
      code: "12.10",
      omschrijving: "Sloop en stripwerk",
      eenheid: "m²",
      aantal: 120,
      eenheidsprijs: 45,
      arbeidsuren: 80,
      materiaal: 1200,
      opmerking: "Incl. afvoer puin",
      categorie: "voorbereiding"
    },
    {
      id: "2",
      code: "21.50",
      omschrijving: "Constructieve aanpassingen",
      eenheid: "m²",
      aantal: 120,
      eenheidsprijs: 85,
      arbeidsuren: 120,
      materiaal: 3500,
      opmerking: "Staalconstructies",
      categorie: "constructie"
    },
    {
      id: "3",
      code: "23.30",
      omschrijving: "Gevel en isolatie",
      eenheid: "m²",
      aantal: 96,
      eenheidsprijs: 95,
      arbeidsuren: 90,
      materiaal: 4200,
      opmerking: "PIR isolatie + gevelbekleding",
      categorie: "isolatie"
    },
    {
      id: "4",
      code: "41.10",
      omschrijving: "Installaties E en W",
      eenheid: "stuk",
      aantal: 1,
      eenheidsprijs: 8500,
      arbeidsuren: 60,
      materiaal: 5200,
      opmerking: "Elektra en waterleidingen",
      categorie: "installaties"
    },
    {
      id: "5",
      code: "51.90",
      omschrijving: "Afbouw en herindeling",
      eenheid: "stuk",
      aantal: 1,
      eenheidsprijs: 12500,
      arbeidsuren: 180,
      materiaal: 7800,
      opmerking: "Wanden, plafonds, vloeren",
      categorie: "afwerking"
    }
  ])
  
  const [nieuwePost, setNieuwePost] = useState({
    code: "",
    omschrijving: "",
    eenheid: "m²",
    aantal: 1,
    eenheidsprijs: 0,
    arbeidsuren: 0,
    materiaal: 0,
    opmerking: "",
    categorie: "algemeen"
  })
  
  // Instellingen
  const [opslagen, setOpslagen] = useState({
    algemene_kosten: 8,
    bouwplaatskosten: 4,
    winstopslag: 6,
    risicofactor: 5,
    btw_percentage: 21
  })
  
  const [uurlonen, setUurlonen] = useState([
    { discipline: "timmerman", uurloon: 52 },
    { discipline: "installateur", uurloon: 60 },
    { discipline: "elektricien", uurloon: 60 },
    { discipline: "stucadoor", uurloon: 48 },
    { discipline: "schilder", uurloon: 45 }
  ])
  
  // AI Analyse resultaten
  const [analyseResultaat, setAnalyseResultaat] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [analyseStatus, setAnalyseStatus] = useState('idle')
  
  // ======================
  // EFFECTS
  // ======================
  
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])
  
  useEffect(() => {
    if (analyseResultaat?.oppervlakte_m2) {
      const oppervlakte = analyseResultaat.oppervlakte_m2
      const bijgewerktePosten = posten.map(post => {
        if (post.eenheid === "m²") {
          return { ...post, aantal: oppervlakte }
        }
        return post
      })
      setPosten(bijgewerktePosten)
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        oppervlakte_m2: oppervlakte.toString(),
        bouwjaar: analyseResultaat.bouwjaar?.toString() || prev.bouwjaar,
        aantal_kamers: analyseResultaat.aantal_kamers?.toString() || prev.aantal_kamers,
        project_type: analyseResultaat.project_type !== 'onbekend' 
          ? analyseResultaat.project_type 
          : prev.project_type
      }))
    }
  }, [analyseResultaat])
  
  // Poll voor project updates
  useEffect(() => {
    let intervalId
    
    if (projectId && analyseStatus === 'analyzing') {
      intervalId = setInterval(async () => {
        await checkProjectStatus()
      }, 3000)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [projectId, analyseStatus])
  
  // ======================
  // FUNCTIES
  // ======================
  
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleNieuwePostChange = (field, value) => {
    setNieuwePost(prev => ({ ...prev, [field]: value }))
  }
  
  // STAP 1: Project aanmaken
  const createProject = async () => {
    if (!user) {
      setError("Je moet ingelogd zijn om een project aan te maken")
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const projectData = {
        naam: formData.project_naam || `Nieuw project ${new Date().toLocaleDateString()}`,
        klant_naam: formData.klant_naam,
        adres: formData.adres,
        postcode: formData.postcode,
        plaats: formData.plaats,
        project_type: formData.project_type,
        status: 'draft',
        gebruiker_id: user.id,
        metadata: {
          oppervlakte: formData.oppervlakte_m2,
          bouwjaar: formData.bouwjaar,
          kamers: formData.aantal_kamers,
          opmerkingen: formData.opmerkingen
        }
      }
      
      const response = await fetch(`${API_ENDPOINTS.BACKEND_API}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify(projectData)
      })
      
      if (!response.ok) {
        throw new Error('Project aanmaken mislukt')
      }
      
      const data = await response.json()
      setProject(data)
      setProjectId(data.id)
      setCurrentStep(2)
      setSuccess('Project succesvol aangemaakt!')
      
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }
  
  // STAP 2: Bestanden uploaden voor AI analyse
  const handleFileUpload = async (files) => {
    if (!projectId) {
      setError("Maak eerst een project aan")
      return
    }
    
    const fileArray = Array.from(files)
    setUploadedFiles(fileArray)
    setAnalyseStatus('uploading')
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      fileArray.forEach(file => {
        formData.append('files', file)
      })
      formData.append('project_id', projectId)
      formData.append('user_id', user?.id || '')
      
      const response = await fetch(`${API_ENDPOINTS.EXECUTOR_API}/api/analyze`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Upload mislukt')
      }
      
      const data = await response.json()
      
      if (data.task_id) {
        setAnalyseStatus('analyzing')
      } else if (data.resultaten) {
        verwerkAnalyseResultaten(data.resultaten)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload mislukt')
      setAnalyseStatus('error')
    } finally {
      setIsLoading(false)
    }
  }
  
  const checkProjectStatus = async () => {
    if (!projectId) return
    
    try {
      const response = await fetch(`${API_ENDPOINTS.EXECUTOR_API}/api/analyse/status/${projectId}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.status === 'complete' && data.resultaten) {
          verwerkAnalyseResultaten(data.resultaten)
          setAnalyseStatus('complete')
          setCurrentStep(3)
        } else if (data.status === 'error') {
          setError('AI analyse mislukt')
          setAnalyseStatus('error')
        }
      }
    } catch (err) {
      console.error('Status check error:', err)
    }
  }
  
  const verwerkAnalyseResultaten = (resultaten) => {
    setAnalyseResultaat({
      oppervlakte_m2: resultaten.oppervlakte || 0,
      bouwjaar: resultaten.bouwjaar || 0,
      aantal_kamers: resultaten.aantal_kamers || 0,
      project_type: resultaten.project_type || 'onbekend',
      materiaal_suggesties: resultaten.materiaal_suggesties || [],
      risico_indicatoren: resultaten.risico_indicatoren || [],
      verduurzamingspotentieel: resultaten.verduurzamingspotentieel || [],
      geschatte_totale_kosten: resultaten.geschatte_kosten || 0,
      confidence_score: resultaten.confidence_score || 0
    })
  }
  
  // STAP 3: Calculatie genereren
  const generateCalculatie = async () => {
    if (!projectId || !analyseResultaat) {
      setError("Voer eerst een analyse uit")
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const subtotaal = berekenSubtotaal()
      const opslagBedragen = berekenOpslagen(subtotaal)
      const totaalData = berekenTotaal(opslagBedragen)
      
      const calculatieData = {
        project_id: projectId,
        project_info: formData,
        posten: posten,
        instellingen: {
          opslagen: opslagen,
          uurlonen: uurlonen
        },
        analyse_resultaat: analyseResultaat,
        berekeningen: {
          subtotaal: subtotaal,
          opslagen: opslagBedragen,
          totaal: totaalData,
          samenvatting: genereerSamenvatting(subtotaal, totaalData)
        }
      }
      
      const response = await fetch(`${API_ENDPOINTS.EXECUTOR_API}/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calculatieData)
      })
      
      if (!response.ok) {
        throw new Error('PDF generatie mislukt')
      }
      
      const pdfData = await response.json()
      
      if (pdfData.pdf_url) {
        await updateProjectWithPDF(pdfData.pdf_url)
        setCurrentStep(4)
        setSuccess('Calculatie succesvol gegenereerd!')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Genereren mislukt')
    } finally {
      setIsLoading(false)
    }
  }
  
  const updateProjectWithPDF = async (pdfUrl) => {
    if (!projectId || !user) return
    
    try {
      await fetch(`${API_ENDPOINTS.BACKEND_API}/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          pdf_url: pdfUrl,
          status: 'ready',
          updated_at: new Date().toISOString()
        })
      })
    } catch (err) {
      console.error('Project update error:', err)
    }
  }
  
  // Berekeningsfuncties
  const berekenPostTotaal = (post) => {
    const arbeidskosten = post.arbeidsuren * getGemiddeldUurloon()
    const materiaal = post.materiaal || (post.eenheidsprijs * post.aantal)
    return arbeidskosten + materiaal
  }
  
  const berekenSubtotaal = () => {
    return posten.reduce((totaal, post) => totaal + berekenPostTotaal(post), 0)
  }
  
  const getGemiddeldUurloon = () => {
    const total = uurlonen.reduce((som, u) => som + u.uurloon, 0)
    return total / uurlonen.length
  }
  
  const berekenOpslagen = (subtotaal) => {
    return {
      algemene_kosten: subtotaal * (opslagen.algemene_kosten / 100),
      bouwplaatskosten: subtotaal * (opslagen.bouwplaatskosten / 100),
      winstopslag: subtotaal * (opslagen.winstopslag / 100),
      risicofactor: subtotaal * (opslagen.risicofactor / 100)
    }
  }
  
  const berekenTotaal = (opslagen) => {
    const subtotaal = berekenSubtotaal()
    const totaalOpslagen = Object.values(opslagen).reduce((a, b) => a + b, 0)
    const totaalExclBtw = subtotaal + totaalOpslagen
    const btwBedrag = totaalExclBtw * (opslagen.btw_percentage / 100)
    
    return {
      subtotaal: subtotaal,
      totaal_opslagen: totaalOpslagen,
      totaal_excl_btw: totaalExclBtw,
      btw_bedrag: btwBedrag,
      totaal_incl_btw: totaalExclBtw + btwBedrag
    }
  }
  
  const genereerSamenvatting = (subtotaal, totaal) => {
    return `Calculatie voor ${formData.project_naam}. Subtotaal: €${subtotaal.toFixed(2)}, Totaal incl. BTW: €${totaal.totaal_incl_btw.toFixed(2)}`
  }
  
  const voegPostToe = () => {
    if (!nieuwePost.code || !nieuwePost.omschrijving) {
      setError("Code en omschrijving zijn verplicht")
      return
    }
    
    const nieuweId = Math.random().toString(36).substr(2, 9)
    setPosten([
      ...posten,
      {
        id: nieuweId,
        code: nieuwePost.code,
        omschrijving: nieuwePost.omschrijving,
        eenheid: nieuwePost.eenheid || "m²",
        aantal: Number(nieuwePost.aantal) || 1,
        eenheidsprijs: Number(nieuwePost.eenheidsprijs) || 0,
        arbeidsuren: Number(nieuwePost.arbeidsuren) || 0,
        materiaal: Number(nieuwePost.materiaal) || 0,
        opmerking: nieuwePost.opmerking || "",
        categorie: nieuwePost.categorie || "algemeen"
      }
    ])
    
    setNieuwePost({
      code: "",
      omschrijving: "",
      eenheid: "m²",
      aantal: 1,
      eenheidsprijs: 0,
      arbeidsuren: 0,
      materiaal: 0,
      opmerking: "",
      categorie: "algemeen"
    })
  }
  
  const verwijderPost = (id) => {
    setPosten(posten.filter(p => p.id !== id))
  }
  
  // Bereken totalen voor display
  const subtotaal = berekenSubtotaal()
  const opslagBedragen = berekenOpslagen(subtotaal)
  const totaalData = berekenTotaal(opslagBedragen)
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nieuwe Calculatie</h1>
        <p className="text-gray-600">Creëer een nieuwe bouwkosten calculatie met AI-ondersteuning</p>
      </div>
      
      {/* Stappen indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2
                ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
                ${currentStep === step ? 'ring-4 ring-blue-100' : ''}
              `}>
                {step}
              </div>
              <span className="text-sm font-medium">
                {step === 1 && 'Project'}
                {step === 2 && 'Upload'}
                {step === 3 && 'Calculatie'}
                {step === 4 && 'Resultaat'}
              </span>
            </div>
          ))}
        </div>
        <Progress value={((currentStep - 1) / 3) * 100} className="h-2" />
      </div>
      
      {/* Fout- en succesmeldingen */}
      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
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
      
      <Tabs defaultValue="project" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="project">Projectinfo</TabsTrigger>
          <TabsTrigger value="upload">AI Analyse</TabsTrigger>
          <TabsTrigger value="calculatie">Calculatie</TabsTrigger>
          <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
        </TabsList>
        
        {/* STAP 1: Project informatie */}
        <TabsContent value="project">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Klantgegevens
                </CardTitle>
                <CardDescription>Vul de gegevens van de opdrachtgever in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="klant_naam">Naam opdrachtgever *</Label>
                  <Input
                    id="klant_naam"
                    value={formData.klant_naam}
                    onChange={(e) => handleFormChange('klant_naam', e.target.value)}
                    placeholder="Volledige naam"
                    disabled={currentStep > 1}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="klant_email">E-mailadres</Label>
                    <Input
                      id="klant_email"
                      type="email"
                      value={formData.klant_email}
                      onChange={(e) => handleFormChange('klant_email', e.target.value)}
                      placeholder="email@voorbeeld.nl"
                      disabled={currentStep > 1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="klant_telefoon">Telefoon</Label>
                    <Input
                      id="klant_telefoon"
                      value={formData.klant_telefoon}
                      onChange={(e) => handleFormChange('klant_telefoon', e.target.value)}
                      placeholder="06 12345678"
                      disabled={currentStep > 1}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adres">Adres *</Label>
                  <Input
                    id="adres"
                    value={formData.adres}
                    onChange={(e) => handleFormChange('adres', e.target.value)}
                    placeholder="Straatnaam en huisnummer"
                    disabled={currentStep > 1}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => handleFormChange('postcode', e.target.value)}
                      placeholder="1234 AB"
                      disabled={currentStep > 1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plaats">Plaats *</Label>
                    <Input
                      id="plaats"
                      value={formData.plaats}
                      onChange={(e) => handleFormChange('plaats', e.target.value)}
                      placeholder="Plaatsnaam"
                      disabled={currentStep > 1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Projectdetails
                </CardTitle>
                <CardDescription>Specificaties van het bouwproject</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project_naam">Projectnaam *</Label>
                  <Input
                    id="project_naam"
                    value={formData.project_naam}
                    onChange={(e) => handleFormChange('project_naam', e.target.value)}
                    placeholder="Bijv. Transformatie Van der Valk Hotel"
                    disabled={currentStep > 1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="project_type">Projecttype</Label>
                  <Select 
                    value={formData.project_type} 
                    onValueChange={(value) => handleFormChange('project_type', value)}
                    disabled={currentStep > 1}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nieuwbouw">Nieuwbouw</SelectItem>
                      <SelectItem value="renovatie">Renovatie</SelectItem>
                      <SelectItem value="transformatie">Transformatie</SelectItem>
                      <SelectItem value="verduurzaming">Verduurzaming</SelectItem>
                      <SelectItem value="onderhoud">Onderhoud</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="oppervlakte_m2">Oppervlakte (m²)</Label>
                    <Input
                      id="oppervlakte_m2"
                      type="number"
                      value={formData.oppervlakte_m2}
                      onChange={(e) => handleFormChange('oppervlakte_m2', e.target.value)}
                      placeholder="Auto"
                      readOnly={!!analyseResultaat}
                      className={analyseResultaat ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bouwjaar">Bouwjaar</Label>
                    <Input
                      id="bouwjaar"
                      type="number"
                      value={formData.bouwjaar}
                      onChange={(e) => handleFormChange('bouwjaar', e.target.value)}
                      placeholder="Auto"
                      readOnly={!!analyseResultaat}
                      className={analyseResultaat ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aantal_kamers">Kamers</Label>
                    <Input
                      id="aantal_kamers"
                      type="number"
                      value={formData.aantal_kamers}
                      onChange={(e) => handleFormChange('aantal_kamers', e.target.value)}
                      placeholder="Auto"
                      readOnly={!!analyseResultaat}
                      className={analyseResultaat ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>
                
                {analyseResultaat && (
                  <Alert className="mt-4">
                    <AlertTitle className="text-sm">AI Detectie Resultaten</AlertTitle>
                    <AlertDescription className="text-xs space-y-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div>Oppervlakte: {analyseResultaat.oppervlakte_m2} m²</div>
                        <div>Bouwjaar: {analyseResultaat.bouwjaar}</div>
                        <div>Type: {analyseResultaat.project_type}</div>
                        <div>Betrouwbaarheid: {analyseResultaat.confidence_score}%</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="opmerkingen">Opmerkingen</Label>
                  <Textarea
                    id="opmerkingen"
                    value={formData.opmerkingen}
                    onChange={(e) => handleFormChange('opmerkingen', e.target.value)}
                    placeholder="Extra informatie over het project..."
                    disabled={currentStep > 1}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={createProject}
              disabled={isLoading || !formData.klant_naam || !formData.adres || !formData.project_naam}
              className="gap-2"
            >
              {isLoading ? 'Aanmaken...' : 'Project Aanmaken'}
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        {/* STAP 2: Upload & AI Analyse */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Bouwdocumenten
              </CardTitle>
              <CardDescription>
                Upload tekeningen, rapporten en andere documenten voor AI-analyse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Upload zone */}
                <div 
                  className={`
                    border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                    ${analyseStatus === 'uploading' || analyseStatus === 'analyzing' 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }
                  `}
                  onClick={() => !isLoading && fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Sleep bestanden hierheen of klik om te selecteren
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload CAD bestanden (DWG, DXF), PDF's, afbeeldingen of Word documenten
                  </p>
                  <Button variant="outline" disabled={isLoading}>
                    Selecteer Bestanden
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.doc,.docx,.cad"
                    disabled={isLoading || analyseStatus === 'analyzing'}
                  />
                </div>
                
                {/* Upload status */}
                {analyseStatus !== 'idle' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`
                          h-3 w-3 rounded-full
                          ${analyseStatus === 'complete' ? 'bg-green-500' :
                            analyseStatus === 'error' ? 'bg-red-500' :
                            analyseStatus === 'analyzing' ? 'bg-yellow-500 animate-pulse' :
                            'bg-blue-500 animate-pulse'}
                        `} />
                        <span className="font-medium">
                          {analyseStatus === 'uploading' && 'Bestanden uploaden...'}
                          {analyseStatus === 'analyzing' && 'AI analyse uitgevoerd...'}
                          {analyseStatus === 'complete' && 'Analyse voltooid!'}
                          {analyseStatus === 'error' && 'Analyse mislukt'}
                        </span>
                      </div>
                      {analyseStatus === 'analyzing' && (
                        <Badge variant="outline">Bezig</Badge>
                      )}
                    </div>
                    
                    <Progress 
                      value={
                        analyseStatus === 'uploading' ? 50 :
                        analyseStatus === 'analyzing' ? 80 :
                        analyseStatus === 'complete' ? 100 : 0
                      } 
                    />
                  </div>
                )}
                
                {/* Uploaded files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Geüploade bestanden</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {file.type.split('/')[1]?.toUpperCase() || 'ONBEKEND'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* AI Analyse resultaten */}
                {analyseResultaat && (
                  <div className="space-y-4">
                    <Separator />
                    <h4 className="font-medium text-gray-700">AI Analyse Resultaten</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">Materiaal Suggesties</CardTitle>
                        </CardHeader>
                        <CardContent className="py-3">
                          <ul className="space-y-1 text-sm">
                            {analyseResultaat.materiaal_suggesties.slice(0, 3).map((s, i) => (
                              <li key={i} className="flex justify-between">
                                <span>{s.naam}</span>
                                <span className="text-gray-600">€{s.geschatte_kosten.toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">Risico Indicatoren</CardTitle>
                        </CardHeader>
                        <CardContent className="py-3">
                          <ul className="space-y-1 text-sm">
                            {analyseResultaat.risico_indicatoren.slice(0, 3).map((r, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <AlertCircle className="h-3 w-3 text-yellow-500" />
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">Verduurzaming</CardTitle>
                        </CardHeader>
                        <CardContent className="py-3">
                          <ul className="space-y-1 text-sm">
                            {analyseResultaat.verduurzamingspotentieel.slice(0, 3).map((v, i) => (
                              <li key={i}>{v}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setCurrentStep(3)}
                        className="gap-2"
                        disabled={analyseStatus !== 'complete'}
                      >
                        Ga naar Calculatie
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* STAP 3: Calculatie */}
        <TabsContent value="calculatie">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Posten tabel */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Calculatie Posten</span>
                    <Badge variant="outline">
                      {posten.length} posten • €{subtotaal.toFixed(2)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Omschrijving</TableHead>
                            <TableHead>Eenheid</TableHead>
                            <TableHead>Aantal</TableHead>
                            <TableHead>Arbeid</TableHead>
                            <TableHead>Materiaal</TableHead>
                            <TableHead>Totaal</TableHead>
                            <TableHead className="w-[100px]">Acties</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {posten.map((post) => {
                            const postTotaal = berekenPostTotaal(post)
                            return (
                              <TableRow key={post.id}>
                                <TableCell className="font-mono">{post.code}</TableCell>
                                <TableCell>
                                  <div className="font-medium">{post.omschrijving}</div>
                                  {post.opmerking && (
                                    <div className="text-xs text-gray-500">{post.opmerking}</div>
                                  )}
                                </TableCell>
                                <TableCell>{post.eenheid}</TableCell>
                                <TableCell>{post.aantal}</TableCell>
                                <TableCell>{post.arbeidsuren} uur</TableCell>
                                <TableCell>
                                  €{(post.materiaal || post.eenheidsprijs * post.aantal).toFixed(2)}
                                </TableCell>
                                <TableCell className="font-semibold">
                                  €{postTotaal.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => verwijderPost(post.id)}
                                    disabled={isLoading}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Nieuwe post formulier */}
                    <Card>
                      <CardHeader className="py-4">
                        <CardTitle className="text-lg">Nieuwe Post Toevoegen</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                          <div>
                            <Label htmlFor="code" className="text-xs">Code</Label>
                            <Input
                              id="code"
                              value={nieuwePost.code}
                              onChange={(e) => handleNieuwePostChange('code', e.target.value)}
                              placeholder="12.10"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="omschrijving" className="text-xs">Omschrijving</Label>
                            <Input
                              id="omschrijving"
                              value={nieuwePost.omschrijving}
                              onChange={(e) => handleNieuwePostChange('omschrijving', e.target.value)}
                              placeholder="Werkzaamheden"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="eenheid" className="text-xs">Eenheid</Label>
                            <Select 
                              value={nieuwePost.eenheid}
                              onValueChange={(value) => handleNieuwePostChange('eenheid', value)}
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Selecteer eenheid" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="m²">m²</SelectItem>
                                <SelectItem value="m">m</SelectItem>
                                <SelectItem value="stuk">stuk</SelectItem>
                                <SelectItem value="uur">uur</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="aantal" className="text-xs">Aantal</Label>
                            <Input
                              id="aantal"
                              type="number"
                              value={nieuwePost.aantal}
                              onChange={(e) => handleNieuwePostChange('aantal', e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="arbeidsuren" className="text-xs">Uren</Label>
                            <Input
                              id="arbeidsuren"
                              type="number"
                              value={nieuwePost.arbeidsuren}
                              onChange={(e) => handleNieuwePostChange('arbeidsuren', e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="materiaal" className="text-xs">Materiaal</Label>
                            <Input
                              id="materiaal"
                              type="number"
                              value={nieuwePost.materiaal}
                              onChange={(e) => handleNieuwePostChange('materiaal', e.target.value)}
                              placeholder="€"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button 
                              onClick={voegPostToe} 
                              className="w-full gap-2"
                              disabled={isLoading}
                            >
                              <Plus className="h-4 w-4" />
                              Toevoegen
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Instellingen en totalen */}
            <div className="space-y-6">
              {/* Instellingen */}
              <Card>
                <CardHeader>
                  <CardTitle>Calculatie Instellingen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Uurlonen per discipline</Label>
                    <div className="space-y-2">
                      {uurlonen.map((u, i) => (
                        <div key={u.discipline} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{u.discipline}</span>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={u.uurloon}
                              onChange={(e) => {
                                const nieuwe = [...uurlonen]
                                nieuwe[i].uurloon = Number(e.target.value)
                                setUurlonen(nieuwe)
                              }}
                              className="w-20 h-8 text-sm"
                              disabled={isLoading}
                            />
                            <span className="text-sm">€/uur</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t text-sm text-gray-600">
                      Gemiddeld: €{getGemiddeldUurloon().toFixed(2)}/uur
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Opslagen (%)</Label>
                    {Object.entries(opslagen).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => setOpslagen(prev => ({
                              ...prev,
                              [key]: Number(e.target.value)
                            }))}
                            className="w-20 h-8 text-sm"
                            disabled={isLoading}
                          />
                          <span className="text-sm">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Totalen */}
              <Card>
                <CardHeader>
                  <CardTitle>Financiële Samenvatting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotaal werkzaamheden:</span>
                      <span className="font-medium">€{subtotaal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>+ Algemene kosten ({opslagen.algemene_kosten}%):</span>
                      <span>€{opslagBedragen.algemene_kosten.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>+ Bouwplaatskosten ({opslagen.bouwplaatskosten}%):</span>
                      <span>€{opslagBedragen.bouwplaatskosten.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>+ Winstopslag ({opslagen.winstopslag}%):</span>
                      <span>€{opslagBedragen.winstopslag.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>+ Risicofactor ({opslagen.risicofactor}%):</span>
                      <span>€{opslagBedragen.risicofactor.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Totaal exclusief BTW:</span>
                      <span>€{totaalData.totaal_excl_btw.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>+ BTW ({opslagen.btw_percentage}%):</span>
                      <span>€{totaalData.btw_bedrag.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>Totaal inclusief BTW:</span>
                    <span>€{totaalData.totaal_incl_btw.toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    onClick={generateCalculatie}
                    className="w-full mt-4 gap-2"
                    disabled={isLoading || !analyseResultaat}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Calculatie genereren...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4" />
                        Calculatie Genereren
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* STAP 4: Overzicht en download */}
        <TabsContent value="overzicht">
          {currentStep >= 4 && project?.pdf_url ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  Calculatie Voltooid!
                </CardTitle>
                <CardDescription>
                  Uw calculatie is succesvol gegenereerd en kan worden gedownload.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border p-6 text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <Download className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Calculatie Gereed</h3>
                    <p className="text-gray-600 mb-6">
                      De calculatie voor {formData.project_naam} is klaar voor gebruik.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">Project Samenvatting</CardTitle>
                        </CardHeader>
                        <CardContent className="py-3 text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Klant:</span>
                            <span className="font-medium">{formData.klant_naam}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Locatie:</span>
                            <span className="font-medium">{formData.plaats}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Oppervlakte:</span>
                            <span className="font-medium">{formData.oppervlakte_m2} m²</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Aantal posten:</span>
                            <span className="font-medium">{posten.length}</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">Financieel Overzicht</CardTitle>
                        </CardHeader>
                        <CardContent className="py-3 text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Subtotaal:</span>
                            <span className="font-medium">€{subtotaal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Opslagen:</span>
                            <span className="font-medium">€{totaalData.totaal_opslagen.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>BTW:</span>
                            <span className="font-medium">€{totaalData.btw_bedrag.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-base font-bold text-blue-600">
                            <span>Totaal:</span>
                            <span>€{totaalData.totaal_incl_btw.toFixed(2)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => window.open(project.pdf_url, '_blank')}
                        className="gap-2"
                        size="lg"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard')}
                        className="gap-2"
                        size="lg"
                      >
                        Naar Dashboard
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentStep(1)
                          setProject(null)
                          setProjectId(null)
                          setUploadedFiles([])
                          setAnalyseResultaat(null)
                          setAnalyseStatus('idle')
                        }}
                        className="gap-2"
                        size="lg"
                      >
                        Nieuwe Calculatie
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Calculatie Nog Niet Gereed</CardTitle>
                <CardDescription>
                  Voltooi de vorige stappen om de calculatie te genereren.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Calculator className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Ga terug naar de calculatie stap om de generatie te starten.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
