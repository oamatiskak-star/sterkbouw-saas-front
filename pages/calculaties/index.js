// SterkBouw-SaaS-Frontend/pages/calculaties/index.js

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
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
  Calendar,
  Building,
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
  const { user, loading: authLoading } = useAuth()

  const [calculaties, setCalculaties] = useState([])
  const [filteredCalculaties, setFilteredCalculaties] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updated_at")
  const [sortOrder, setSortOrder] = useState("desc")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState("")

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
    totalValue: 0,
  })

  useEffect(() => {
    if (authLoading === false && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadProjects()
      loadCalculaties()
    }
  }, [user])

  useEffect(() => {
    filterAndSortCalculaties()
  }, [calculaties, searchTerm, statusFilter, sortBy, sortOrder])

  // ======================
  // DATA
  // ======================

  const loadProjects = async () => {
    setLoadingProjects(true)
    try {
      const { data, error } = await supabase
        .from("projecten")
        .select("id, naam, adres, plaats")
        .order("naam")

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingProjects(false)
    }
  }

  const loadCalculaties = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("calculaties")
        .select("*")
        .order("updated_at", { ascending: false })

      if (error) throw error

      const { data: projecten } = await supabase
        .from("projecten")
        .select("id, naam, adres, plaats")

      const projectMap = {}
      ;(projecten || []).forEach((p) => {
        projectMap[p.id] = p
      })

      const combined = (data || []).map((c) => ({
        ...c,
        projecten: projectMap[c.project_id] || null,
      }))

      setCalculaties(combined)
      updateStats(combined)
    } catch (err) {
      setError(`Fout bij laden: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleNewCalculatie = async () => {
    setIsCreating(true)
    setError(null)

    try {
      let projectId = selectedProjectId

      if (!projectId) {
        throw new Error("Geen project geselecteerd")
      }

      const { data: last } = await supabase
        .from("calculaties")
        .select("calculatie_nummer")
        .order("calculatie_nummer", { ascending: false })
        .limit(1)

      const nextNumber = last?.[0]?.calculatie_nummer
        ? last[0].calculatie_nummer + 1
        : 1001

      const { data, error } = await supabase
        .from("calculaties")
        .insert({
          naam: `Calculatie ${nextNumber}`,
          calculatie_nummer: nextNumber,
          project_id: projectId,
          status: "concept",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/calculatie/nieuw?id=${data.id}&project_id=${projectId}`)
    } catch (err) {
      setError(`Aanmaken mislukt: ${err.message}`)
    } finally {
      setIsCreating(false)
      setIsDialogOpen(false)
    }
  }

  const deleteCalculatie = async (calculatie) => {
    if (!confirm(`Calculatie "${calculatie.naam}" verwijderen?`)) return

    try {
      const { error } = await supabase
        .from("calculaties")
        .delete()
        .eq("id", calculatie.id)

      if (error) throw error

      const updated = calculaties.filter((c) => c.id !== calculatie.id)
      setCalculaties(updated)
      updateStats(updated)
    } catch (err) {
      setError(`Verwijderen mislukt: ${err.message}`)
    }
  }

  // ======================
  // HELPERS
  // ======================

  const filterAndSortCalculaties = () => {
    let filtered = [...calculaties]

    if (searchTerm) {
      const t = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.naam?.toLowerCase().includes(t) ||
          c.calculatie_nummer?.toString().includes(t) ||
          c.projecten?.naam?.toLowerCase().includes(t)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    filtered.sort((a, b) => {
      const aVal = new Date(a[sortBy] || 0).getTime()
      const bVal = new Date(b[sortBy] || 0).getTime()
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal
    })

    setFilteredCalculaties(filtered)
  }

  const updateStats = (list) => {
    setStats({
      total: list.length,
      active: list.filter((c) => c.status === "actief").length,
      completed: list.filter((c) => c.status === "voltooid").length,
      draft: list.filter((c) => c.status === "concept").length,
      totalValue: list.reduce((s, c) => s + Number(c.totaal || 0), 0),
    })
  }

  const formatDate = (d) =>
    d ? format(new Date(d), "dd-MM-yyyy", { locale: nl }) : "-"

  // ======================
  // RENDER
  // ======================

  if (authLoading) return null

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 rounded">
          <AlertTriangle className="inline mr-2 h-4 w-4 text-red-600" />
          {error}
        </div>
      )}

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Calculaties</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nieuwe calculatie
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Laatst gewijzigd</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCalculaties.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.naam}</TableCell>
                <TableCell>{c.projecten?.naam || "-"}</TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell>{formatDate(c.updated_at)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => router.push(`/calculaties/${c.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteCalculatie(c)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe calculatie</DialogTitle>
            <DialogDescription>Selecteer een project</DialogDescription>
          </DialogHeader>

          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecteer project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.naam}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button onClick={handleNewCalculatie} disabled={isCreating}>
              Aanmaken
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
