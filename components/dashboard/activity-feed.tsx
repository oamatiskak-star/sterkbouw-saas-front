// src/components/dashboard/activity-feed.tsx
import { 
  Calculator, 
  Upload, 
  FileText, 
  Send, 
  UserPlus, 
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ActivityFeedProps {
  activities?: Array<{
    id: string
    type: 'project_created' | 'calculatie_generated' | 'invoice_sent' | 'file_uploaded' | 'klant_added'
    title: string
    description: string
    timestamp: string
    user?: string
  }>
}

export function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created': return Calculator
      case 'calculatie_generated': return FileText
      case 'invoice_sent': return Send
      case 'file_uploaded': return Upload
      case 'klant_added': return UserPlus
      default: return CheckCircle
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project_created': return 'bg-blue-100 text-blue-600'
      case 'calculatie_generated': return 'bg-green-100 text-green-600'
      case 'invoice_sent': return 'bg-amber-100 text-amber-600'
      case 'file_uploaded': return 'bg-purple-100 text-purple-600'
      case 'klant_added': return 'bg-pink-100 text-pink-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'project_created': return 'Project'
      case 'calculatie_generated': return 'Calculatie'
      case 'invoice_sent': return 'Factuur'
      case 'file_uploaded': return 'Document'
      case 'klant_added': return 'Klant'
      default: return 'Activiteit'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activiteiten</CardTitle>
        <p className="text-sm text-gray-500">Laatste updates in je account</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              const colorClass = getActivityColor(activity.type)
              const timeAgo = getTimeAgo(activity.timestamp)
              
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className={`${colorClass} h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getActivityBadge(activity.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{timeAgo}</span>
                      {activity.user && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">door {activity.user}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nog geen activiteiten</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getTimeAgo(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} minuten geleden`
  if (diffHours < 24) return `${diffHours} uur geleden`
  if (diffDays < 7) return `${diffDays} dagen geleden`
  return date.toLocaleDateString()
}
