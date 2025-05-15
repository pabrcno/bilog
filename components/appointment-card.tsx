"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, CalendarIcon, Clock, XCircle, CheckCircle2, Ban } from "lucide-react"
import React from "react"

interface AppointmentCardProps {
  id: number
  timeSlotId: number
  patientName?: string
  date: Date
  duration: number
  status: string
  dentist?: string
  onCancel?: (appointmentId: number, timeSlotId: number) => void
  isAdmin?: boolean
  onConfirm?: (appointmentId: number) => void
  onReject?: (appointmentId: number, timeSlotId: number) => void
}

function ActionIconButton({ icon, label, ...props }: { icon: React.ReactNode; label: string } & React.ComponentProps<typeof Button>) {
  return (
    <div className="relative group flex items-center justify-center">
      <Button {...props} className="flex items-center justify-center p-2" tabIndex={0}>
        {icon}
      </Button>
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition bg-gray-900 text-white text-xs px-2 py-1 rounded shadow select-none whitespace-nowrap">
        {label}
      </span>
    </div>
  )
}

export function AppointmentCard({
  id,
  timeSlotId,
  patientName,
  date,
  duration,
  status,
  dentist,
  onCancel,
  isAdmin = false,
  onConfirm,
  onReject,
}: AppointmentCardProps) {
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  // Calculate end time
  const getEndTime = (startDate: Date, durationMinutes: number) => {
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + durationMinutes)
    return formatTime(endDate)
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "default"
      case "cancelled":
      case "rejected":
        return "destructive"
      case "completed":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Action buttons config
  const actions = []
  if (onCancel && status.toLowerCase() === "confirmed") {
    actions.push({
      label: "Cancel",
      icon: <XCircle className="h-5 w-5" />,
      onClick: () => onCancel(id, timeSlotId),
      color: "destructive" as const,
    })
  }
  if (isAdmin && onConfirm && status.toLowerCase() === "pending") {
    actions.push({
      label: "Confirm",
      icon: <CheckCircle2 className="h-5 w-5" />,
      onClick: () => onConfirm(id),
      color: "default" as const,
    })
  }
  if (isAdmin && onReject && status.toLowerCase() === "pending") {
    actions.push({
      label: "Reject",
      icon: <Ban className="h-5 w-5" />,
      onClick: () => onReject(id, timeSlotId),
      color: "destructive" as const,
    })
  }

  const isCancelled = status.toLowerCase() === "cancelled"

  return (
    <Card className={`border border-gray-200 shadow-sm hover:shadow transition-shadow relative ${isCancelled ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        {/* Status badge at top right */}
        <div className="absolute top-4 right-4">
          <Badge variant={getStatusVariant(status)} className="capitalize text-[10px] px-2 py-0.5 tracking-wide shadow-sm" style={{letterSpacing: '0.04em'}}>
            {status}
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 min-h-[90px]">
          {/* Info Section */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-full flex items-center justify-center mt-1">
              {isAdmin ? <User className="h-5 w-5" /> : <CalendarIcon className="h-5 w-5" />}
            </div>
            <div className="flex flex-col gap-2 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 w-full">
                {dentist && (
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs text-blue-600 font-medium leading-tight mb-0.5">Dentist</span>
                    <span className="block text-base font-semibold text-gray-800 leading-tight truncate">{dentist}</span>
                  </div>
                )}
                {patientName && (
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs text-gray-400 leading-tight mb-0.5">Patient</span>
                    <span className="block text-sm font-medium text-gray-700 truncate">{patientName}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center text-xs text-gray-500 gap-2 mt-2">
                <Clock className="h-4 w-4" />
                <span>
                  {formatTime(date)} - {getEndTime(date, duration)}
                  <span className="mx-1">•</span>
                  {duration} min
                </span>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          {actions.length > 0 && (
            <div className="flex flex-row flex-wrap gap-2 items-center justify-end min-w-[120px] mt-4 sm:mt-0">
              {actions.map((action) => (
                <ActionIconButton
                  key={action.label}
                  icon={action.icon}
                  label={action.label}
                  variant={action.color}
                  size="icon"
                  onClick={action.onClick}
                  aria-label={action.label}
                />
              ))}
            </div>
          )}
        </div>
        {/* Date at bottom right */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-medium">
          {formatDate(date)}
        </div>
      </CardContent>
    </Card>
  )
}
