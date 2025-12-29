// src/app/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { RecentProjects } from "@/components/dashboard/recent-projects"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { CalculatieStats } from "@/components/dashboard/calculatie-stats"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { Calculator, TrendingUp, AlertCircle, Calendar, Users, FileText, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardData {
  stats: {
    totalProjects: number
    activeProjects: number
    totalCalculaties: number
    pendingCalculaties: number
    totalKlanten: number
    revenue: number
    invoices: {
      paid: number
      pending: number
      overdue: number
    }
  }
  recentProjects: Array<{
    id: string
    name: string
    status: 'draft' | 'active' | 'completed' | 'on_hold'
    klant: string
    location: string
    progress: number
    lastUpdated: string
  }>
  recentActivities: Array<{
    id: string
    type: 'project_created' | 'calculatie_generated' | 'invoice_sent' | 'file_uploaded'
    title: string
    description: string
    timestamp: string
    user?: string
  }>
  quickStats: {
    thisMonth: {
      calculaties: number
      revenue: number
      projects: number
    }
    lastMonth: {
      calculaties: number
      revenue: number
      projects: number
    }
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, authLoading, router])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Hier zou je de API call naar je backend maken
      const mockData: DashboardData = {
        stats: {
          totalProjects: 24,
          activeProjects: 8,
          totalCalculaties: 156,
          pendingCalculaties: 12,
          totalKlanten: 42,
          revenue: 1254300,
          invoices: {
            paid: 18,
            pending: 5,
            overdue: 2
          }
        },
        recentProjects: [
          {
            id: "1",
            name: "Transformatie Van der Valk Hotel",
            status: "active",
            klant: "Van der Valk Group",
            location: "Amsterdam",
            progress: 75,
            lastUpdated: "2024-01-15T10:30:00Z"
          },
          {
            id: "2",
            name: "Nieuwbouw Kantoorcomplex Zuidas",
            status: "active",
            klant: "ABN AMRO",
            location: "Amsterdam Zuid",
            progress: 45,
            lastUpdated: "2024-01-14T14:20:00Z"
          },
          {
            id: "3",
            name: "Renovatie Gemeentehuis Utrecht",
            status: "on_hold",
            klant: "Gemeente Utrecht",
            location: "Utrecht Centrum",
            progress: 30,
            lastUpdated: "2024-01-13T09:15:00Z"
          },
          {
            id: "4",
            name: "Verduurzaming Ziekenhuis Leiden",
            status: "completed",
            klant: "LUMC",
            location: "Leiden",
            progress: 100,
            lastUpdated: "2024-01-12T16:45:00Z"
          }
        ],
        recentActivities: [
          {
            id: "1",
            type: "calculatie_generated",
            title: "Nieuwe calculatie gegenereerd",
            description: "Calculatie voor 'Transformatie Van der Valk Hotel' is gegenereerd",
            timestamp: "2024-01-15T11:30:00Z",
            user: "John Doe"
          },
          {
            id: "2",
            type: "invoice_sent",
            title: "Factuur verzonden",
            description: "Factuur #INV-2024-001 verzonden naar Van der Valk Group",
            timestamp: "2024-01-15T10:15:00Z"
          },
          {
            id: "3",
            type: "file_uploaded",
            title: "Bouwtekening geüpload",
            description: "CAD bestand geüpload voor project 'Nieuwbouw Zuidas'",
            timestamp: "2024-01-14T16:45:00Z",
            user: "Jane Smith"
          },
          {
            id: "4",
            type: "project_created",
            title: "Nieuw project aangemaakt",
            description: "Project 'Verduurzaming Ziekenhuis Leiden' aangemaakt",
            timestamp: "2024-01-14T14:30:00Z"
          }
        ],
        quickStats: {
          thisMonth: {
            calculaties: 24,
            revenue: 245000,
            projects: 8
          },
          lastMonth: {
            calculaties: 32,
            revenue: 312000,
            projects: 10
          }
        }
      }

      setData(mockData)
    } catch (err) {
      setError("Kon dashboard data niet laden")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Dashboard laden..." />
      </div>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="py-12">
          <EmptyState
            icon={AlertCircle}
            title="Fout bij laden"
            description={error}
            action={{
              label: "Probeer opnieuw",
              onClick: fetchDashboardData
            }}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title="Dashboard" 
      description="Welkom terug bij SterkStack Bouwcalculatie"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" }
      ]}
      actions={
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/rapporten')}>
            <FileText className="h-4 w-4 mr-2" />
            Rapport
          </Button>
          <Button onClick={() => router.push('/calculaties/nieuw')}>
            <Calculator className="h-4 w-4 mr-2" />
            Nieuwe Calculatie
          </Button>
        </div>
      }
    >
      {/* Overview Cards */}
      <div className="mb-8">
        <OverviewCards stats={data?.stats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Recent Projects & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <RecentProjects projects={data?.recentProjects} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActions />
            <CalculatieStats stats={data?.quickStats} />
          </div>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="space-y-6">
          <ActivityFeed activities={data?.recentActivities} />
          
          {/* Mini Stats */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4">Snel overzicht</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vandaag</p>
                    <p className="font-semibold">3 activiteiten</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Actieve klanten</p>
                    <p className="font-semibold">{data?.stats.totalKlanten}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Omzet deze maand</p>
                    <p className="font-semibold">€{data?.quickStats.thisMonth.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Insights & Aanbevelingen</h3>
            <p className="text-gray-600">Op basis van je recente activiteiten</p>
          </div>
          <TrendingUp className="h-8 w-8 text-blue-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calculator className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Calculatie efficiëntie</p>
                <p className="text-sm text-gray-500">AI analyse verbeterd</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Je calculaties zijn gemiddeld 15% sneller gegenereerd met onze AI-assistent
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold">Risico detectie</p>
                <p className="text-sm text-gray-500">3 potentiële risico's</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              AI heeft potentiële risico's gedetecteerd in 2 van je actieve projecten
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Document automatisering</p>
                <p className="text-sm text-gray-500">Tijd besparen</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Automatiseer je offertes en bespaar tot 8 uur per week op administratie
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
