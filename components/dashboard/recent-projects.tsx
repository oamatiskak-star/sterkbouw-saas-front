// src/components/dashboard/recent-projects.tsx
import { Calendar, MapPin, Users, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

interface RecentProjectsProps {
  projects?: Array<{
    id: string
    name: string
    status: 'draft' | 'active' | 'completed' | 'on_hold'
    klant: string
    location: string
    progress: number
    lastUpdated: string
  }>
}

export function RecentProjects({ projects = [] }: RecentProjectsProps) {
  const router = useRouter()

  const statusConfig = {
    draft: { label: 'Concept', color: 'bg-gray-100 text-gray-800' },
    active: { label: 'Actief', color: 'bg-green-100 text-green-800' },
    completed: { label: 'Voltooid', color: 'bg-blue-100 text-blue-800' },
    on_hold: { label: 'Gepauzeerd', color: 'bg-yellow-100 text-yellow-800' }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recente Projecten</CardTitle>
          <p className="text-sm text-gray-500">Overzicht van je actieve projecten</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/projecten')}
        >
          Alle projecten
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.length > 0 ? (
            projects.map((project) => {
              const status = statusConfig[project.status]
              
              return (
                <div 
                  key={project.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/projecten/${project.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{project.name}</h4>
                      <Badge className={`${status.color} border-0`}>
                        {status.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{project.klant}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(project.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Voortgang</span>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <Button variant="ghost" size="sm">
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nog geen projecten</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/projecten/nieuw')}
              >
                Maak je eerste project
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
