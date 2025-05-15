import { useState } from "react"
import { trpc } from "@/utils/trpc"
import { showSuccess, showError } from "@/lib/toast"
import { TimeSlot, User } from "@/db/schema"

interface UseTimeSlotsParams {
  date?: Date;
  isAdmin?: boolean;
}

export function useTimeSlots({ date = new Date(), isAdmin = false }: UseTimeSlotsParams) {
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot & { dentist: User } | null>(null)
  
  const utils = trpc.useUtils()

  // Query time slots
  const { 
    data: timeSlots, 
    isLoading: isLoadingTimeSlots 
  } = trpc.timeSlot.getTimeSlotsForDate.useQuery({
    date
  })

  // Mutations
  const createTimeSlotMutation = trpc.timeSlot.createTimeSlot.useMutation({
    onSuccess: () => {
      setIsAddSlotOpen(false)
      showSuccess("Time slot added successfully")
      // Refetch time slots
      utils.timeSlot.getTimeSlotsForDate.invalidate({ date })
    },
    onError: (error) => {
      showError(error.message || "Failed to add time slot")
    },
  })

  const deleteTimeSlotMutation = trpc.timeSlot.deleteTimeSlot.useMutation({
    onSuccess: () => {
      showSuccess("Time slot deleted successfully")
      // Refetch time slots
      utils.timeSlot.getTimeSlotsForDate.invalidate({ date })
    },
    onError: (error) => {
      showError(error.message || "Failed to delete time slot")
    },
  })

  // Handle time slot form submit
  const handleCreateTimeSlot = ({ startTime, duration }: { startTime: string; duration: number }) => {
    createTimeSlotMutation.mutate({
      startTime,
      duration
    })
  }

  // Handle time slot deletion
  const handleDeleteTimeSlot = (id: number) => {
    deleteTimeSlotMutation.mutate({ id })
  }

  // Handle time slot selection (for patient booking)
  const handleSelectTimeSlot = (slot: TimeSlot & { dentist: User }) => {
    setSelectedSlot(slot)
  }

  return {
    // Data
    timeSlots,
    isLoadingTimeSlots,
    selectedSlot,
    
    // UI state
    isAddSlotOpen,
    setIsAddSlotOpen,
    
    // Actions
    handleCreateTimeSlot,
    handleDeleteTimeSlot,
    handleSelectTimeSlot,
    setSelectedSlot,
    
    // Action states
    isCreating: createTimeSlotMutation.isPending,
    isDeleting: deleteTimeSlotMutation.isPending
  }
} 