import { AppointmentCard } from "@/components/appointment-card"
import { EmptyState } from "@/components/empty-state"
import { Appointment, TimeSlot, User } from "@/db/schema"

interface AppointmentListProps {
  appointments: (Appointment & {
    patient: User
    timeSlot: TimeSlot & {
      dentist: User
    }
  })[]
  isLoading: boolean
  isAdmin?: boolean
  onCancel?: (appointmentId: number, timeSlotId: number) => void
  onConfirm?: (appointmentId: number) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function AppointmentList({
  appointments,
  isLoading,
  isAdmin = false,
  onCancel,
  onConfirm,
  emptyTitle = "No appointments",
  emptyDescription = "There are no appointments to display.",
}: AppointmentListProps) {
  if (isLoading) {
    return <div className="text-center py-12">Loading appointments...</div>
  }

  if (!appointments || appointments.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  console.log(appointments)

  return (
    <div className="space-y-4">

      {appointments.map((appointment) => (
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
        />
      ))}
    </div>
  )
}
