"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock } from "lucide-react"

interface TimeSlotCardProps {
  date: Date
  duration: number
  dentistName: string
  dentistSpecialty?: string
  onSelect?: () => void
  onDelete?: () => void
  isAdmin?: boolean
}

export function TimeSlotCard({
  date,
  duration,
  dentistName,
  dentistSpecialty = "General Dentist",
  onSelect,
  onDelete,
  isAdmin = false,
}: TimeSlotCardProps) {
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (isAdmin) {
    return (
      <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-full">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{formatTime(date)}</h3>
                <p className="text-sm text-gray-500">{duration} minutes</p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow transition-shadow cursor-pointer" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarFallback>{getInitials(dentistName)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{dentistName}</h3>
            <p className="text-xs text-gray-500">{dentistSpecialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{formatTime(date)}</span>
          <span className="text-xs text-gray-500 ml-auto">{duration} min</span>
        </div>
      </CardContent>
    </Card>
  )
}
