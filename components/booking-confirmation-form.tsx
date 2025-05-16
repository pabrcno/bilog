"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { showError } from "@/lib/toast"
import { trpc } from "@/utils/trpc"
import { TimeSlot, User } from "@/db/schema"

interface BookingConfirmationFormProps {
  timeSlot: TimeSlot & {
    dentist: User
  }
  onSuccess: () => void
  onCancel: () => void
}

// Define BookingFormValues inline
interface BookingFormValues {
  timeSlotId: number
}

export function BookingConfirmationForm({ timeSlot, onSuccess, onCancel }: BookingConfirmationFormProps) {
  // Initialize React Hook Form
  const { handleSubmit, register } = useForm<BookingFormValues>({
    defaultValues: {
      timeSlotId: timeSlot.id,
    },
  })

  const bookAppointmentMutation = trpc.appointment.bookAppointment.useMutation({
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      showError(error.message || "Failed to book appointment")
    },
  })

  const onSubmit = (values: BookingFormValues) => {
    bookAppointmentMutation.mutate({ timeSlotId: values.timeSlotId })
  }

  // Format time for display
  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format date for display
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("timeSlotId", { valueAsNumber: true })} />
      <div className="py-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <Avatar>
                <AvatarFallback>{getInitials(timeSlot.dentist.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{timeSlot.dentist.name}</h3>
                <p className="text-sm text-gray-500">{"General Dentist"}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">{formatDate(timeSlot.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time:</span>
                <span className="font-medium">{formatTime(timeSlot.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">{timeSlot.duration} minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={bookAppointmentMutation.isPending}>
          {bookAppointmentMutation.isPending ? "Booking..." : "Confirm Booking"}
        </Button>
      </DialogFooter>
    </form>
  )
}
