// components/dashboard/project-card.tsx
import { Calendar, FileText, Building, Users, MoreVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProjectCardProps {
  project: {
    id: string
    naam: string
    status: 'draft' | 'uploading' | 'analyzing' | 'calculating' | 'ready' | 'error'
    klant_naam: string
    locatie: string
    created_at: string
    laatste_update: string
    documenten_aantal: number
    team_leden?: number
  }
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
  const statusColors = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Concept' },
    uploading: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Uploaden' },
    analyzing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Analyseren' },
    calculating: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Berekenen' },
    ready: { bg: 'bg-green-100', text: 'text-green-800', label: 'Gereed' },
    error: { bg: 'bg-red-100', text: 'text-red-800', label: 'Fout' },
  }

  const status = statusColors[project.status]

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">{project.naam}</h3>
            </div>
            <Badge className={`${status.bg} ${status.text} border-0`}>
              {status.label}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(project.id)}>
                <FileText className="h-4 w-4 mr-2" />
                Bekijken
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(project.id)}>
                <Calendar className="h-4 w-4 mr-2" />
                Bewerken
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(project.id)}
                className="text-red-600"
              >
                <FileText className="h-4 w-4 mr-2" />
                Verwijderen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{project.klant_naam}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{project.locatie}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <FileText className="h-4 w-4 mr-2" />
            <span>{project.documenten_aantal} documenten</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Laatste update: {new Date(project.laatste_update).toLocaleDateString()}
            </div>
            <Button 
              onClick={() => onView(project.id)}
              variant="outline"
              size="sm"
            >
              Open project
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
