import { AppointmentCard } from "@/components/appointment-card"
import { EmptyState } from "@/components/empty-state"

interface Appointment {
  id: number
  patientName?: string
  startTime: string | Date
  duration: number
  status: string
  dentistName?: string
}

interface AppointmentListProps {
  appointments: Appointment[]
  isLoading: boolean
  isAdmin?: boolean
  onCancel?: (id: number) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function AppointmentList({
  appointments,
  isLoading,
  isAdmin = false,
  onCancel,
  emptyTitle = "No appointments",
  emptyDescription = "There are no appointments to display.",
}: AppointmentListProps) {
  if (isLoading) {
    return <div className="text-center py-12">Loading appointments...</div>
  }

  if (!appointments || appointments.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          id={appointment.id}
          patientName={appointment.patientName}
          date={new Date(appointment.startTime)}
          duration={appointment.duration}
          status={appointment.status}
          dentist={appointment.dentistName}
          isAdmin={isAdmin}
          onCancel={onCancel}
        />
      ))}
    </div>
  )
}
