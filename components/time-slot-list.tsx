"use client"

import { TimeSlotCard } from "@/components/time-slot-card"
import { EmptyState } from "@/components/empty-state"

interface TimeSlot {
  id: number
  startTime: string | Date
  duration: number
  dentistName?: string
  dentistSpecialty?: string
}

interface TimeSlotListProps {
  timeSlots: TimeSlot[]
  isLoading: boolean
  isAdmin?: boolean
  onSelect?: (slot: TimeSlot) => void
  onDelete?: (id: number) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function TimeSlotList({
  timeSlots,
  isLoading,
  isAdmin = false,
  onSelect,
  onDelete,
  emptyTitle = "No available time slots",
  emptyDescription = "There are no time slots available.",
}: TimeSlotListProps) {
  if (isLoading) {
    return <div className="text-center py-12">Loading time slots...</div>
  }

  if (!timeSlots || timeSlots.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className={isAdmin ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"}>
      {timeSlots.map((slot) => (
        <TimeSlotCard
          key={slot.id}
          id={slot.id}
          date={new Date(slot.startTime)}
          duration={slot.duration}
          dentistName={slot.dentistName}
          dentistSpecialty={slot.dentistSpecialty || "General Dentist"}
          onSelect={onSelect ? () => onSelect(slot) : undefined}
          onDelete={onDelete ? () => onDelete(slot.id) : undefined}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  )
}
