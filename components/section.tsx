import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function Section({ title, description, children, className, headerClassName, contentClassName }: SectionProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)}>
      {(title || description) && (
        <div className={cn("p-4 sm:p-6 border-b border-gray-200", headerClassName)}>
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className={cn("p-4 sm:p-6", contentClassName)}>{children}</div>
    </div>
  )
}
