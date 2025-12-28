// components/dashboard/status-badge.tsx
import { CheckCircle, Clock, AlertCircle, XCircle, Upload, Calculator } from "lucide-react"

type StatusType = 'draft' | 'uploading' | 'analyzing' | 'calculating' | 'ready' | 'error'

interface StatusBadgeProps {
  status: StatusType
  showIcon?: boolean
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = {
    draft: {
      label: 'Concept',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Clock
    },
    uploading: {
      label: 'Uploaden',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Upload
    },
    analyzing: {
      label: 'Analyseren',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: AlertCircle
    },
    calculating: {
      label: 'Berekenen',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Calculator
    },
    ready: {
      label: 'Gereed',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle
    },
    error: {
      label: 'Fout',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle
    }
  }

  const { label, color, icon: Icon } = config[status]

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${color}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}
