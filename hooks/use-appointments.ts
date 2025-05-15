import { useState } from "react"
import { trpc } from "@/utils/trpc"
import { showSuccess, showError } from "@/lib/toast"

interface AppointmentAction {
  type: "confirm" | "reject" | "cancel";
  appointmentId: number;
  timeSlotId?: number;
}

interface UseAppointmentsParams {
  isAdmin: boolean;
  date?: Date;
}

export function useAppointments({ isAdmin, date = new Date() }: UseAppointmentsParams) {
  const [confirmAction, setConfirmAction] = useState<AppointmentAction | null>(null)
  const utils = trpc.useUtils()

  // Fetch appointments based on user role
  const { 
    data: appointments, 
    isLoading: isLoadingAppointments 
  } = isAdmin 
    ? trpc.appointment.getDentistAppointments.useQuery() 
    : trpc.appointment.getPatientAppointments.useQuery()

  // Mutations
  const cancelAppointmentMutation = trpc.appointment.cancelAppointment.useMutation({
    onSuccess: () => {
      showSuccess("Appointment cancelled successfully")
      setConfirmAction(null)
      // Refetch appointments
      if (isAdmin) {
        utils.appointment.getDentistAppointments.invalidate()
      } else {
        utils.appointment.getPatientAppointments.invalidate()
      }
      utils.timeSlot.getTimeSlotsForDate.invalidate({ date })
    },
    onError: (error) => {
      showError(error.message || "Failed to cancel appointment")
    },
  })

  const confirmAppointmentMutation = trpc.appointment.confirmAppointment.useMutation({
    onSuccess: () => {
      showSuccess("Appointment confirmed successfully")
      setConfirmAction(null)
      utils.appointment.getDentistAppointments.invalidate()
    },
    onError: (error) => {
      showError(error.message || "Failed to confirm appointment")
    },
  })

  const rejectAppointmentMutation = trpc.appointment.rejectAppointment.useMutation({
    onSuccess: () => {
      showSuccess("Appointment rejected successfully")
      setConfirmAction(null)
      utils.appointment.getDentistAppointments.invalidate()
    },
    onError: (error) => {
      showError(error.message || "Failed to reject appointment")
    },
  })

  // Filter appointments by date and status
  const filterAppointmentsByDateAndStatus = (status: string) => {
    return appointments?.filter(
      (appointment) =>
        date &&
        appointment.status === status &&
        new Date(appointment.timeSlot.startTime).getDate() === date.getDate() &&
        new Date(appointment.timeSlot.startTime).getMonth() === date.getMonth() &&
        new Date(appointment.timeSlot.startTime).getFullYear() === date.getFullYear(),
    ) || []
  }

  // Filter appointments by date only
  const filterAppointmentsByDate = () => {
    return appointments?.filter(
      (appointment) =>
        date &&
        new Date(appointment.timeSlot.startTime).getDate() === date.getDate() &&
        new Date(appointment.timeSlot.startTime).getMonth() === date.getMonth() &&
        new Date(appointment.timeSlot.startTime).getFullYear() === date.getFullYear(),
    ) || []
  }

  // Appointment action handlers
  const handleRequestCancelAppointment = (appointmentId: number, timeSlotId: number) => {
    setConfirmAction({
      type: "cancel",
      appointmentId,
      timeSlotId
    })
  }

  const handleRequestConfirmAppointment = (appointmentId: number) => {
    setConfirmAction({
      type: "confirm",
      appointmentId
    })
  }

  const handleRequestRejectAppointment = (appointmentId: number, timeSlotId: number) => {
    setConfirmAction({
      type: "reject",
      appointmentId,
      timeSlotId
    })
  }

  // Execute appointment action
  const executeAppointmentAction = () => {
    if (!confirmAction) return

    if (confirmAction.type === "cancel" && confirmAction.timeSlotId) {
      cancelAppointmentMutation.mutate({ 
        appointmentId: confirmAction.appointmentId, 
        timeSlotId: confirmAction.timeSlotId
      })
    } else if (confirmAction.type === "confirm") {
      confirmAppointmentMutation.mutate({ appointmentId: confirmAction.appointmentId })
    } else if (confirmAction.type === "reject" && confirmAction.timeSlotId) {
      rejectAppointmentMutation.mutate({ 
        appointmentId: confirmAction.appointmentId, 
        timeSlotId: confirmAction.timeSlotId 
      })
    }
  }

  // Filter appointments by status (for patient view)
  const getAppointmentsByStatus = (status: string) => {
    return appointments?.filter(appointment => appointment.status === status) || []
  }

  // Dialog text helper
  const getDialogText = () => {
    switch (confirmAction?.type) {
      case "confirm":
        return {
          title: "Confirm Appointment",
          description: "Are you sure you want to confirm this appointment?",
          actionButton: confirmAppointmentMutation.isPending ? "Confirming..." : "Confirm Appointment",
          cancelButton: "Cancel"
        }
      case "reject":
        return {
          title: "Reject Appointment",
          description: "Are you sure you want to reject this appointment? The time slot will be made available again.",
          actionButton: rejectAppointmentMutation.isPending ? "Rejecting..." : "Reject Appointment",
          cancelButton: "Cancel"
        }
      case "cancel":
        return {
          title: "Cancel Appointment",
          description: "Are you sure you want to cancel this appointment? The time slot will be made available again.",
          actionButton: cancelAppointmentMutation.isPending ? "Cancelling..." : "Cancel Appointment",
          cancelButton: "Keep Appointment"
        }
      default:
        return {
          title: "",
          description: "",
          actionButton: "",
          cancelButton: ""
        }
    }
  }

  return {
    // Data
    appointments,
    isLoadingAppointments,
    confirmAction,

    // Action states
    cancelPending: cancelAppointmentMutation.isPending,
    confirmPending: confirmAppointmentMutation.isPending,
    rejectPending: rejectAppointmentMutation.isPending,
    
    // Filtered data
    allAppointments: filterAppointmentsByDate(),
    pendingAppointments: filterAppointmentsByDateAndStatus("pending"),
    confirmedAppointments: filterAppointmentsByDateAndStatus("confirmed"),
    rejectedAppointments: getAppointmentsByStatus("rejected"),
    
    // Actions
    setConfirmAction,
    handleRequestCancelAppointment,
    handleRequestConfirmAppointment,
    handleRequestRejectAppointment,
    executeAppointmentAction,
    getDialogText,
  }
} 