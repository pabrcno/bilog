"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { PageLayout } from "@/components/ui/page-layout"
import { CalendarSidebar } from "@/components/ui/calendar-sidebar"
import { Section } from "@/components/ui/section"
import { AppointmentList } from "@/components/ui/appointment-list"
import { TimeSlotList } from "@/components/ui/time-slot-list"
import { AddTimeSlotForm } from "@/components/add-time-slot-form"
import { showSuccess, showError } from "@/lib/toast"
import { trpc } from "@/utils/trpc"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { DateHeader } from "@/components/ui/date-header"

export default function AdminPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false)
  const [userName, setUserName] = useState("Dr. Sarah Wilson")
  const [activeTab, setActiveTab] = useState("all")
  
  const [confirmAction, setConfirmAction] = useState<{
    type: "confirm" | "reject" | "cancel";
    appointmentId: number;
    timeSlotId?: number;
  } | null>(null)

  // tRPC queries and mutations
  const { data: currentUser } = trpc.auth.getCurrentUser.useQuery()
  const { data: appointments, isLoading: isLoadingAppointments } = trpc.appointment.getDentistAppointments.useQuery()
  const { data: timeSlots, isLoading: isLoadingTimeSlots } = trpc.timeSlot.getTimeSlotsForDate.useQuery({
    date: date || new Date(),
  })

  const deleteTimeSlotMutation = trpc.timeSlot.deleteTimeSlot.useMutation({
    onSuccess: () => {
      showSuccess("Time slot deleted successfully")
      // Refetch time slots
      utils.timeSlot.getTimeSlotsForDate.invalidate({ date: date || new Date() })
    },
    onError: (error) => {
      showError(error.message || "Failed to delete time slot")
    },
  })

  const cancelAppointmentMutation = trpc.appointment.cancelAppointment.useMutation({
    onSuccess: () => {
      showSuccess("Appointment cancelled successfully")
      setConfirmAction(null)
      // Refetch appointments
      utils.appointment.getDentistAppointments.invalidate()
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

  const utils = trpc.useUtils()

  // Update user name when current user data is available
  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.name)
    }
  }, [currentUser])

  // Filter appointments for the selected date and status
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

  // Filter appointments by date only (for "All" tab)
  const filterAppointmentsByDate = () => {
    return appointments?.filter(
      (appointment) =>
        date &&
        new Date(appointment.timeSlot.startTime).getDate() === date.getDate() &&
        new Date(appointment.timeSlot.startTime).getMonth() === date.getMonth() &&
        new Date(appointment.timeSlot.startTime).getFullYear() === date.getFullYear(),
    ) || []
  }

  const allAppointments = filterAppointmentsByDate()
  const pendingAppointments = filterAppointmentsByDateAndStatus("pending")
  const confirmedAppointments = filterAppointmentsByDateAndStatus("confirmed")


  // Handle time slot form success
  const handleTimeSlotSuccess = () => {
    setIsAddSlotOpen(false)
    showSuccess("Time slot added successfully")
    // Refetch time slots
    utils.timeSlot.getTimeSlotsForDate.invalidate({ date: date || new Date() })
  }

  // Delete a time slot
  const handleDeleteTimeSlot = async (id: number) => {
    deleteTimeSlotMutation.mutate({ id })
  }

  // Request confirmation to cancel appointment
  const handleRequestCancelAppointment = (appointmentId: number, timeSlotId: number) => {
    setConfirmAction({
      type: "cancel",
      appointmentId,
      timeSlotId
    })
  }

  // Request confirmation to confirm appointment
  const handleRequestConfirmAppointment = (appointmentId: number) => {
    setConfirmAction({
      type: "confirm",
      appointmentId
    })
  }

  // Request confirmation to reject appointment
  const handleRequestRejectAppointment = (appointmentId: number, timeSlotId: number) => {
    setConfirmAction({
      type: "reject",
      appointmentId,
      timeSlotId
    })
  }

  // Execute the actual appointment actions
  const executeAppointmentAction = () => {
    if (!confirmAction) return

    if (confirmAction.type === "cancel" && confirmAction.timeSlotId) {
      cancelAppointmentMutation.mutate({ 
        appointmentId: confirmAction.appointmentId, 
        timeSlotId: confirmAction.timeSlotId
      })
    } 
    else if (confirmAction.type === "confirm") {
      confirmAppointmentMutation.mutate({ appointmentId: confirmAction.appointmentId })
    } 
    else if (confirmAction.type === "reject" && confirmAction.timeSlotId) {
      rejectAppointmentMutation.mutate({ 
        appointmentId: confirmAction.appointmentId, 
        timeSlotId: confirmAction.timeSlotId 
      })
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get dialog text based on action type
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

  const dialogText = getDialogText()

  return (
    <PageLayout userName={userName} userRole="admin">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <div className="space-y-6">
            <CalendarSidebar date={date} setDate={setDate} />

            <Section title="Quick Actions" variant="sidebar">
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                  variant="outline" 
                  onClick={() => setIsAddSlotOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Available Time Slot
                </Button>
              </div>
            </Section>
            
            <Section title="Appointment Counts" variant="sidebar">
              <div className="space-y-3 text-sm">
                <StatusIndicator label="All Today" status="all" count={allAppointments.length} />
                <StatusIndicator label="Pending" status="pending" count={pendingAppointments.length} />
                <StatusIndicator label="Confirmed" status="confirmed" count={confirmedAppointments.length} />
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            <DateHeader 
              date={date} 
              formatDate={formatDate}
             
              actions={
                <Button onClick={() => setIsAddSlotOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Time Slot
                </Button>
              }
            />

            <Tabs 
              defaultValue="all" 
              onValueChange={setActiveTab} 
              value={activeTab}
            >
              <TabsList>
                <TabsTrigger value="all" color="blue">
                  All ({allAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="pending" color="amber">
                  Pending ({pendingAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed" color="green">
                  Confirmed ({confirmedAppointments.length})
                </TabsTrigger>
            
                <TabsTrigger value="availability" color="purple">
                  Availability
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="all">
                  <Section 
                    title="All Appointments" 
                    description="View and manage all appointments for the selected date"
                    variant="transparent"
                  >
                    <AppointmentList
                      appointments={allAppointments}
                      isLoading={isLoadingAppointments}
                      isAdmin={true}
                      onCancel={handleRequestCancelAppointment}
                      onConfirm={handleRequestConfirmAppointment}
                      onReject={handleRequestRejectAppointment}
                      emptyTitle="No appointments for this day"
                      emptyDescription="There are no appointments scheduled for this day."
                    />
                  </Section>
                </TabsContent>
              
                <TabsContent value="pending">
                  <Section 
                    title="Pending Appointments" 
                    description="Appointments awaiting confirmation"
                    variant="transparent"
                  >
                    <AppointmentList
                      appointments={pendingAppointments}
                      isLoading={isLoadingAppointments}
                      isAdmin={true}
                      onCancel={handleRequestCancelAppointment}
                      onConfirm={handleRequestConfirmAppointment}
                      onReject={handleRequestRejectAppointment}
                      emptyTitle="No pending appointments for this day"
                      emptyDescription="All appointments have been processed or there are no pending bookings."
                    />
                  </Section>
                </TabsContent>
                
                <TabsContent value="confirmed">
                  <Section 
                    title="Confirmed Appointments" 
                    description="Appointments that have been confirmed"
                    variant="transparent"
                  >
                    <AppointmentList
                      appointments={confirmedAppointments}
                      isLoading={isLoadingAppointments}
                      isAdmin={true}
                      onCancel={handleRequestCancelAppointment}
                      emptyTitle="No confirmed appointments for this day"
                      emptyDescription="No confirmed appointments scheduled for this day."
                    />
                  </Section>
                </TabsContent>

              

                <TabsContent value="availability">
                  <Section 
                    title="Available Time Slots" 
                    description="Manage available time slots for appointments"
                    variant="transparent"
                  >
                    <div className="mb-4">
                      <Button 
                        onClick={() => setIsAddSlotOpen(true)}
                        className="w-full sm:w-auto"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add New Time Slot
                      </Button>
                    </div>
                    <TimeSlotList
                      timeSlots={timeSlots || []}
                      isLoading={isLoadingTimeSlots}
                      isAdmin={true}
                      onDelete={handleDeleteTimeSlot}
                      emptyTitle="No available time slots"
                      emptyDescription="Add time slots to allow patients to book appointments."
                    />
                  </Section>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Add Time Slot Dialog */}
      <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Available Time Slot</DialogTitle>
            <DialogDescription>Create a new time slot for patient appointments.</DialogDescription>
          </DialogHeader>

          <AddTimeSlotForm onSuccess={handleTimeSlotSuccess} onCancel={() => setIsAddSlotOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogText.title}</DialogTitle>
            <DialogDescription>{dialogText.description}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {dialogText.cancelButton}
            </Button>
            <Button
              variant={confirmAction?.type === "confirm" ? "default" : "destructive"}
              onClick={executeAppointmentAction}
              disabled={confirmAppointmentMutation.isPending || cancelAppointmentMutation.isPending || rejectAppointmentMutation.isPending}
              className="ml-2 sm:ml-0"
            >
              {dialogText.actionButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
