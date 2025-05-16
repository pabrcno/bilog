import React from 'react'

interface DateHeaderProps {
  date: Date | undefined
  formatDate: (date: Date) => string

  actions?: React.ReactNode
}

export function DateHeader({ date, formatDate, actions }: DateHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800">
        {date ? formatDate(date) : "Select a date"}
      </h2>
      
      <div className="flex space-x-2">
      
        
        {actions}
      </div>
    </div>
  )
} 