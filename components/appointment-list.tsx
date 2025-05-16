import { AppointmentCard } from "@/components/appointment-card"
import { EmptyState } from "@/components/empty-state"
import { Appointment, TimeSlot } from "@/db/schema"

interface AppointmentListProps {
  appointments: (Appointment & {
    patient: { name: string }
    timeSlot: TimeSlot & {
      dentist: { name: string }
    }
  })[]
  isLoading: boolean
  isAdmin?: boolean
  onCancel?: (appointmentId: number, timeSlotId: number) => void
  onConfirm?: (appointmentId: number) => void
  onReject?: (appointmentId: number, timeSlotId: number) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function AppointmentList({
  appointments,
  isLoading,
  isAdmin = false,
  onCancel,
  onConfirm,
  onReject,
  emptyTitle = "No appointments",
  emptyDescription = "There are no appointments to display.",
}: AppointmentListProps) {
  if (isLoading) {
    return <div className="text-center py-12">Loading appointments...</div>
  }

  if (!appointments || appointments.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  // Sort appointments so that canceled ones are at the end
  const sortedAppointments = [...appointments].sort((a, b) => {
    const aCanceled = a.status === "cancelled"
    const bCanceled = b.status === "cancelled"
    if (aCanceled === bCanceled) return 0
    if (aCanceled) return 1
    return -1
  })

  return (
    <div className="space-y-4">
      {sortedAppointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          id={appointment.id}
          timeSlotId={appointment.timeSlot.id}
          patientName={appointment.patient.name}
          date={new Date(appointment.timeSlot.startTime)}
          duration={appointment.timeSlot.duration}
          status={appointment.status}
          dentist={appointment.timeSlot.dentist.name}
          isAdmin={isAdmin}
          onCancel={onCancel}
          onConfirm={onConfirm}
          onReject={onReject}
        />
      ))}
    </div>
  )
}
