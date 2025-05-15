import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  variant?: "default" | "transparent" | "sidebar"
}

export function Section({ 
  title, 
  description, 
  children, 
  className, 
  headerClassName, 
  contentClassName,
  variant = "default"
}: SectionProps) {
  const variantClasses = {
    default: "bg-white rounded-lg border border-gray-200 shadow-sm",
    transparent: "bg-transparent p-0 border-0 shadow-none",
    sidebar: "bg-white rounded-lg p-4 shadow-sm border border-gray-200"
  }

  return (
    <div className={cn(variantClasses[variant], className)}>
      {(title || description) && (
        <div className={cn("p-4 sm:p-6 border-b border-gray-200", headerClassName, {
          "border-0": variant === "transparent"
        })}>
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <div className={cn("p-4 sm:p-6", contentClassName)}>{children}</div>
    </div>
  )
}
