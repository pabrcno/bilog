"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, CalendarIcon, Clock } from "lucide-react"

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
        return "destructive"
      case "completed":
        // "success" is not a valid variant, use "secondary" for completed
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-full">
              {isAdmin ? <User className="h-5 w-5" /> : <CalendarIcon className="h-5 w-5" />}
            </div>
            <div>
              {patientName && <h3 className="font-medium">{patientName}</h3>}
              <h3 className="font-medium">{formatDate(date)}</h3>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="mr-1 h-4 w-4" />
                <span>
                  {formatTime(date)} - {getEndTime(date, duration)} ({duration} min)
                </span>
              </div>
              {dentist && <p className="text-sm text-gray-500">Dentist: {dentist}</p>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(status)} className="capitalize">
              {status}
            </Badge>
            {onCancel && status.toLowerCase() === "confirmed" && (
              <Button variant="destructive" size="sm" onClick={() => onCancel(id, timeSlotId)}>
                Cancel
              </Button>
            )}
            {isAdmin && onConfirm && status.toLowerCase() === "pending" && (
              <Button variant="default" size="sm" onClick={() => onConfirm(id)}>
                Confirm
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
