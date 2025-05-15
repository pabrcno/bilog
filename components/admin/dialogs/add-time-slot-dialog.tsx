import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddTimeSlotForm } from "@/components/add-time-slot-form";
import React from "react";
import { TimeSlotFormValues } from "@/db/schema";

interface AddTimeSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TimeSlotFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function AddTimeSlotDialog({ open, onOpenChange, onSubmit, onCancel, isPending }: AddTimeSlotDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Available Time Slot</DialogTitle>
          <DialogDescription>Create a new time slot for patient appointments.</DialogDescription>
        </DialogHeader>
        <AddTimeSlotForm onSubmit={onSubmit} onCancel={onCancel} isPending={isPending} />
      </DialogContent>
    </Dialog>
  );
} 