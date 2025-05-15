import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { showError } from "@/lib/toast"
import { trpc } from "@/utils/trpc"
import { TimeSlot, User } from "@/db/schema"

interface BookingConfirmationFormProps {
  timeSlot: TimeSlot & { dentist: User }
  onSuccess: () => void
  onCancel: () => void
}

export function BookingConfirmationForm({
  timeSlot,
  onSuccess,
  onCancel,
}: BookingConfirmationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const bookAppointmentMutation = trpc.appointment.bookAppointment.useMutation({
    onSuccess: () => {
      setIsSubmitting(false)
      onSuccess()
    },
    onError: (error) => {
      setIsSubmitting(false)
      showError(error.message || "Failed to book appointment")
    },
  })

  const handleConfirm = () => {
    setIsSubmitting(true)
    bookAppointmentMutation.mutate({
      timeSlotId: timeSlot.id,
    })
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        handleConfirm()
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <div>
          <span className="font-medium">Dentist:</span>{" "}
          <span>{timeSlot.dentist.name}</span>
        </div>
        <div>
          <span className="font-medium">Date:</span>{" "}
          <span>
            {new Date(timeSlot.startTime).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <div>
          <span className="font-medium">Time:</span>{" "}
          <span>
            {new Date(timeSlot.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {new Date(timeSlot.endTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="ml-2 sm:ml-0">
          {isSubmitting ? "Booking..." : "Confirm Appointment"}
        </Button>
      </DialogFooter>
    </form>
  )
}
