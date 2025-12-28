// components/shared/empty-state.tsx
import { FileText, Calculator, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ 
  icon: Icon = FileText, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-6">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          <Plus className="h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
