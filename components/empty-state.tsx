import type { ReactNode } from "react"
import { CalendarClock } from "lucide-react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
}

export function EmptyState({
  icon = <CalendarClock className="mx-auto h-12 w-12 text-gray-400" />,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
      {icon}
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-1">{description}</p>
    </div>
  )
}
