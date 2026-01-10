// pages/calculaties/nieuw.js - SIMPLIFIED VERSION
import { useState } from "react"
import { useRouter } from "next/router"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

// UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  Building,
  FileText,
  Calculator,
  Download
} from "lucide-react"

export default function NieuweCalculatiePage() {
  const router = useRouter()
  const { user, loading: authLoading, userProfile } = useAuth()
  
  // Form state
  const [formData, setFormData] = useState({
    naam: "Nieuwe Calculatie",
    klant_naam: "",
    klant_email: "",
    klant_telefoon: "",
    adres: "",
    postcode: "",
    plaats: "",
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
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [createdCalculatieId, setCreatedCalculatieId] = useState(null)

  // ======================
  // FUNCTIES
  // ======================

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNieuwePostChange = (field, value) => {
    setNieuwePost(prev => ({ ...prev, [field]: value }))
  }

  const createCalculatie = async () => {
    if (!user) {
      setError("Je moet ingelogd zijn om een calculatie aan te maken")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const userId = userProfile?.id || user?.id
      if (!userId) {
        setError("Gebruiker niet gevonden")
        return
      }
      
      // Bereken totalen
      const subtotaal = berekenSubtotaal()
      const opslagBedragen = berekenOpslagen(subtotaal)
      const totaalData = berekenTotaal(opslagBedragen)
      
      // Bereid calculatie data voor
      const calculatieData = {
        naam: formData.naam,
        klant_naam: formData.klant_naam,
        klant_email: formData.klant_email,
        klant_telefoon: formData.klant_telefoon,
        adres: formData.adres,
        postcode: formData.postcode,
        plaats: formData.plaats,
        status: 'concept',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          project_type: formData.project_type,
          oppervlakte_m2: formData.oppervlakte_m2,
          bouwjaar: formData.bouwjaar,
          aantal_kamers: formData.aantal_kamers,
          opmerkingen: formData.opmerkingen,
          posten: posten,
          opslagen: opslagen,
          berekeningen: {
            subtotaal: subtotaal,
            opslagen: opslagBedragen,
            totaal: totaalData,
            totaal_incl_btw: totaalData.totaal_incl_btw
          }
        }
      }
      
      // Maak calculatie aan in Supabase
      const { data: newCalculatie, error: supabaseError } = await supabase
        .from('calculaties')
        .insert(calculatieData)
        .select()
        .single()
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        throw new Error(`Calculatie aanmaken mislukt: ${supabaseError.message}`)
      }
      
      setCreatedCalculatieId(newCalculatie.id)
      setSuccess('Calculatie succesvol aangemaakt!')
      
    } catch (err) {
      console.error('Create error:', err)
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  const berekenPostTotaal = (post) => {
    const arbeidskosten = post.arbeidsuren * 50 // Standaard €50/uur
    const materiaal = post.materiaal || (post.eenheidsprijs * post.aantal)
    return arbeidskosten + materiaal
  }

  const berekenSubtotaal = () => {
    return posten.reduce((totaal, post) => totaal + berekenPostTotaal(post), 0)
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
    
    // Reset form
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

  const handleTerugNaarOverzicht = () => {
    router.push('/calculaties')
  }

  // Bereken totalen voor display
  const subtotaal = berekenSubtotaal()
  const opslagBedragen = berekenOpslagen(subtotaal)
  const totaalData = berekenTotaal(opslagBedragen)

  // ======================
  // RENDER
  // ======================

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Authenticatie controleren...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={handleTerugNaarOverzicht}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar overzicht
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nieuwe Calculatie</h1>
          <p className="text-gray-600">Creëer een nieuwe bouwkosten calculatie</p>
        </div>
      </div>

      {/* Error/Success messages */}
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
          <AlertDescription className="text-green-700">
            {success}
            {createdCalculatieId && (
              <div className="mt-2">
                <Badge variant="outline" className="mt-1">
                  ID: {createdCalculatieId.substring(0, 8)}...
                </Badge>
                <div className="mt-3">
                  <Button onClick={() => router.push(`/calculaties/${createdCalculatieId}`)}>
                    Open calculatie
                  </Button>
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linker kolom: Projectinfo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projectinfo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Projectinformatie
              </CardTitle>
              <CardDescription>Basisgegevens van het project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="naam">Calculatie naam *</Label>
                <Input
                  id="naam"
                  value={formData.naam}
                  onChange={(e) => handleFormChange('naam', e.target.value)}
                  placeholder="Bijv. Transformatie Van der Valk Hotel"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="klant_naam">Klantnaam</Label>
                  <Input
                    id="klant_naam"
                    value={formData.klant_naam}
                    onChange={(e) => handleFormChange('klant_naam', e.target.value)}
                    placeholder="Naam opdrachtgever"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_type">Projecttype</Label>
                  <Select 
                    value={formData.project_type} 
                    onValueChange={(value) => handleFormChange('project_type', value)}
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oppervlakte_m2">Oppervlakte (m²)</Label>
                  <Input
                    id="oppervlakte_m2"
                    type="number"
                    value={formData.oppervlakte_m2}
                    onChange={(e) => handleFormChange('oppervlakte_m2', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bouwjaar">Bouwjaar</Label>
                  <Input
                    id="bouwjaar"
                    type="number"
                    value={formData.bouwjaar}
                    onChange={(e) => handleFormChange('bouwjaar', e.target.value)}
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aantal_kamers">Aantal kamers</Label>
                  <Input
                    id="aantal_kamers"
                    type="number"
                    value={formData.aantal_kamers}
                    onChange={(e) => handleFormChange('aantal_kamers', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="opmerkingen">Opmerkingen</Label>
                <Textarea
                  id="opmerkingen"
                  value={formData.opmerkingen}
                  onChange={(e) => handleFormChange('opmerkingen', e.target.value)}
                  placeholder="Extra informatie over het project..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Posten tabel */}
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Omschrijving</TableHead>
                      <TableHead>Eenheid</TableHead>
                      <TableHead>Aantal</TableHead>
                      <TableHead>Arbeid (uur)</TableHead>
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
                          <TableCell>{post.arbeidsuren}</TableCell>
                          <TableCell>€{(post.materiaal || post.eenheidsprijs * post.aantal).toFixed(2)}</TableCell>
                          <TableCell className="font-semibold">
                            €{postTotaal.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => verwijderPost(post.id)}
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
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Nieuwe post toevoegen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm">Code</Label>
                    <Input
                      id="code"
                      value={nieuwePost.code}
                      onChange={(e) => handleNieuwePostChange('code', e.target.value)}
                      placeholder="12.10"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="omschrijving" className="text-sm">Omschrijving</Label>
                    <Input
                      id="omschrijving"
                      value={nieuwePost.omschrijving}
                      onChange={(e) => handleNieuwePostChange('omschrijving', e.target.value)}
                      placeholder="Werkzaamheden"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arbeidsuren" className="text-sm">Arbeidsuren</Label>
                    <Input
                      id="arbeidsuren"
                      type="number"
                      value={nieuwePost.arbeidsuren}
                      onChange={(e) => handleNieuwePostChange('arbeidsuren', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="materiaal" className="text-sm">Materiaal (€)</Label>
                    <Input
                      id="materiaal"
                      type="number"
                      value={nieuwePost.materiaal}
                      onChange={(e) => handleNieuwePostChange('materiaal', e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                <Button 
                  onClick={voegPostToe} 
                  className="gap-2"
                  disabled={!nieuwePost.code || !nieuwePost.omschrijving}
                >
                  <Plus className="h-4 w-4" />
                  Post toevoegen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rechter kolom: Instellingen en totalen */}
        <div className="space-y-6">
          {/* Instellingen */}
          <Card>
            <CardHeader>
              <CardTitle>Instellingen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {Object.entries(opslagen).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-sm capitalize">
                      {key.replace('_', ' ')}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={key}
                        type="number"
                        value={value}
                        onChange={(e) => setOpslagen(prev => ({
                          ...prev,
                          [key]: Number(e.target.value)
                        }))}
                        className="w-20 h-8"
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
              <CardTitle>Financiële samenvatting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotaal:</span>
                  <span className="font-medium">€{subtotaal.toFixed(2)}</span>
                </div>
                {Object.entries(opslagBedragen).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm text-gray-600">
                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                    <span>€{value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>Totaal excl. BTW:</span>
                  <span>€{totaalData.totaal_excl_btw.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>BTW ({opslagen.btw_percentage}%):</span>
                  <span>€{totaalData.btw_bedrag.toFixed(2)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold text-blue-600">
                <span>Totaal incl. BTW:</span>
                <span>€{totaalData.totaal_incl_btw.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Opslaan knop */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={createCalculatie}
                disabled={loading || !formData.naam.trim()}
                className="w-full gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Aanmaken...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Calculatie Opslaan
                  </>
                )}
              </Button>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>De calculatie wordt opgeslagen in de database</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
