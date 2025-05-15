"use client"

import { useState, useEffect } from "react"
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
import { PageLayout } from "@/components/ui/page-layout"
import { CalendarSidebar } from "@/components/ui/calendar-sidebar"
import { Section } from "@/components/ui/section"
import { AppointmentList } from "@/components/ui/appointment-list"
import { TimeSlotList } from "@/components/ui/time-slot-list"
import { BookingConfirmationForm } from "@/components/ui/booking-confirmation-form"
import { showSuccess, showError } from "@/lib/toast"
import { trpc } from "@/utils/trpc"
import { TimeSlot, User } from "@/db/schema"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { DateHeader } from "@/components/ui/date-header"

export default function PatientDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot & { dentist: User } | null>(null)
  const [cancelConfirmation, setCancelConfirmation] = useState<{ appointmentId: number; timeSlotId: number } | null>(null)
  const [userName, setUserName] = useState("John Smith")
  const [activeTab, setActiveTab] = useState("book")

  // tRPC queries and mutations
  const { data: currentUser } = trpc.auth.getCurrentUser.useQuery()
  const { data: appointments, isLoading: isLoadingAppointments } = trpc.appointment.getPatientAppointments.useQuery()
  const { data: timeSlots, isLoading: isLoadingTimeSlots } = trpc.timeSlot.getTimeSlotsForDate.useQuery({
    date: date || new Date(),
  })

  const cancelAppointmentMutation = trpc.appointment.cancelAppointment.useMutation({
    onSuccess: () => {
      showSuccess("Appointment cancelled successfully")
      setCancelConfirmation(null)
      // Refetch appointments
      utils.appointment.getPatientAppointments.invalidate()
    },
    onError: (error) => {
      showError(error.message || "Failed to cancel appointment")
    },
  })

  const utils = trpc.useUtils()

  // Update user name when current user data is available
  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.name)
    }
  }, [currentUser])

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  }

  // Handle booking success
  const handleBookingSuccess = () => {
    showSuccess("Appointment booked successfully")
    setIsBookingOpen(false)
    // Refetch appointments and time slots
    utils.appointment.getPatientAppointments.invalidate()
    utils.timeSlot.getTimeSlotsForDate.invalidate({ date: date || new Date() })
  }

  // Handle time slot selection
  const handleSelectTimeSlot = (slot: any) => {
    setSelectedSlot(slot)
    setIsBookingOpen(true)
  }

  const handleCancelAppointment = (appointmentId: number, timeSlotId: number) => {
    
    cancelAppointmentMutation.mutate({ appointmentId, timeSlotId })
  }

  // Organize appointments by status
  const getAppointmentsByStatus = (status: string) => {
    return appointments?.filter(appointment => appointment.status === status) || []
  }

  const pendingAppointments = getAppointmentsByStatus("pending")
  const confirmedAppointments = getAppointmentsByStatus("confirmed")
  const rejectedAppointments = getAppointmentsByStatus("rejected")

  return (
    <PageLayout userName={userName} userRole="patient">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <div className="space-y-6">
            <CalendarSidebar date={date} setDate={setDate} />
            
            <Section title="Appointment Status" variant="sidebar">
              <div className="space-y-3 text-sm">
                <StatusIndicator label="Pending" status="pending" count={pendingAppointments.length} />
                <StatusIndicator label="Confirmed" status="confirmed" count={confirmedAppointments.length} />
                <StatusIndicator label="Rejected" status="rejected" count={rejectedAppointments.length} />
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            <DateHeader 
              date={date} 
              formatDate={formatDate} 
       
            />

            <Tabs 
              defaultValue="book" 
              onValueChange={setActiveTab} 
              value={activeTab}
            >
              <TabsList>
                <TabsTrigger value="book" color="blue">
                  Book Appointment
                </TabsTrigger>
                <TabsTrigger value="pending" color="amber">
                  Pending ({pendingAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed" color="green">
                  Confirmed ({confirmedAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" color="red">
                  Rejected ({rejectedAppointments.length})
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="book">
                  <Section
                    title="Available Time Slots"
                    description="Select an available time slot to book your appointment"
                    variant="transparent"
                  >
                    <TimeSlotList
                      timeSlots={timeSlots || []}
                      isLoading={isLoadingTimeSlots}
                      onSelect={handleSelectTimeSlot}
                      emptyTitle="No available time slots"
                      emptyDescription="Please select another day to see available appointments."
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
                      onCancel={(appointmentId, timeSlotId) => setCancelConfirmation({ appointmentId, timeSlotId })}
                      emptyTitle="No pending appointments"
                      emptyDescription="You don't have any pending appointments."
                    />
                  </Section>
                </TabsContent>

                <TabsContent value="confirmed">
                  <Section 
                    title="Confirmed Appointments" 
                    description="Appointments confirmed by the dentist"
                    variant="transparent"
                  >
                    <AppointmentList
                      appointments={confirmedAppointments}
                      isLoading={isLoadingAppointments}
                      onCancel={(appointmentId, timeSlotId) => setCancelConfirmation({ appointmentId, timeSlotId })}
                      emptyTitle="No confirmed appointments"
                      emptyDescription="You don't have any confirmed appointments."
                    />
                  </Section>
                </TabsContent>

                <TabsContent value="rejected">
                  <Section 
                    title="Rejected Appointments" 
                    description="Appointments that have been rejected"
                    variant="transparent"
                  >
                    <AppointmentList
                      appointments={rejectedAppointments}
                      isLoading={isLoadingAppointments}
                      emptyTitle="No rejected appointments"
                      emptyDescription="You don't have any rejected appointments."
                    />
                  </Section>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>Please confirm your appointment details.</DialogDescription>
          </DialogHeader>

          {selectedSlot && (
            <BookingConfirmationForm
              timeSlot={selectedSlot}
              onSuccess={handleBookingSuccess}
              onCancel={() => setIsBookingOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelConfirmation !== null} onOpenChange={() => setCancelConfirmation(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelConfirmation(null)}>
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelConfirmation !== null && handleCancelAppointment(cancelConfirmation.appointmentId, cancelConfirmation.timeSlotId)}
              disabled={cancelAppointmentMutation.isPending}
              className="ml-2 sm:ml-0"
            >
              {cancelAppointmentMutation.isPending ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
