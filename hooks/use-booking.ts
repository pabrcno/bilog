import { useState } from "react"
import { trpc } from "@/utils/trpc"
import { showSuccess, showError } from "@/lib/toast"
import { TimeSlot, User } from "@/db/schema"

export function useBooking() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot & { dentist: { name: string } } | null>(null)
  const bookAppointmentMutation = trpc.appointment.bookAppointment.useMutation({
    onSuccess: () => {
      handleBookingSuccess()
    },
    onError: (error) => {
      showError(error.message || "Failed to book appointment")
    },
  })
  const utils = trpc.useUtils()

  // Handle booking success
  const handleBookingSuccess = () => {
    showSuccess("Appointment booked successfully")
    setIsBookingOpen(false)
    setSelectedSlot(null)
    
    // Refetch appointments and time slots
    utils.appointment.getPatientAppointments.invalidate()
    utils.timeSlot.getTimeSlotsForDate.invalidate()
  }

  // Open booking dialog with selected time slot
  const openBookingDialog = (slot: TimeSlot & { dentist: { name: string } }) => {
    setSelectedSlot(slot)
    setIsBookingOpen(true)
  }

  const handleBooking = ({timeSlotId}: {timeSlotId: number}) => {
    bookAppointmentMutation.mutate({ timeSlotId })
  }



  return {
    isBookingOpen,
    setIsBookingOpen,
    selectedSlot,
    setSelectedSlot,
    handleBookingSuccess,
    openBookingDialog,
    handleBooking
  }
} 