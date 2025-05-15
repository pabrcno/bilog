import React from 'react'
import { cn } from "@/lib/utils"

type StatusType = 'pending' | 'confirmed' | 'rejected' | 'all'

interface StatusBadgeProps {
  status: StatusType
  count: number
  className?: string
}

const statusConfig = {
  pending: {
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
  },
  confirmed: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  rejected: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
  all: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
}

export function StatusBadge({ status, count, className }: StatusBadgeProps) {
  const { bgColor, textColor } = statusConfig[status]
  
  return (
    <span className={cn(
      'font-semibold px-2 py-0.5 rounded-full',
      bgColor,
      textColor,
      className
    )}>
      {count}
    </span>
  )
}

export function StatusIndicator({ 
  label, 
  status, 
  count, 
  className 
}: StatusBadgeProps & { label: string }) {
  return (
    <div className={cn(
      "flex justify-between items-center p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors",
      className
    )}>
      <span className="text-gray-700">{label}:</span>
      <StatusBadge status={status} count={count} />
    </div>
  )
} 