"use client"

import { useState } from "react"
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
import { StatusIndicator } from "@/components/ui/status-indicator"
import { DateHeader } from "@/components/ui/date-header"
import { useUser, useAppointments, useTimeSlots, useBooking, useDateFormat } from "@/hooks"


export default function PatientDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("book")

  // Custom hooks
  const { userName } = useUser()
  const { formatDate } = useDateFormat()
  
  const { 
    confirmAction, 
    pendingAppointments, 
    confirmedAppointments, 
    rejectedAppointments,
    isLoadingAppointments,
    handleRequestCancelAppointment,
    setConfirmAction,
    executeAppointmentAction,
    cancelPending
  } = useAppointments({ isAdmin: false, date })

  const {
    timeSlots,
    isLoadingTimeSlots,
  } = useTimeSlots({ date })
  
  const {
    isBookingOpen,
    setIsBookingOpen,
    selectedSlot,
    handleBookingSuccess,
    openBookingDialog
  } = useBooking()

  // Type-safe wrapper for booking dialog
  const handleSelectSlot = (slot: import("@/db/schema").TimeSlot & { dentist: { name: string } }) => {
    openBookingDialog(slot as unknown as import("@/db/schema").TimeSlot & { dentist: import("@/db/schema").User })
  }

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
                      onSelect={handleSelectSlot}
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
                      onCancel={handleRequestCancelAppointment}
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
                      onCancel={handleRequestCancelAppointment}
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
      <Dialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={executeAppointmentAction}
              disabled={cancelPending}
              className="ml-2 sm:ml-0"
            >
              {cancelPending ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
