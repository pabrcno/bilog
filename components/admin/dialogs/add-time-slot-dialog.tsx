import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddTimeSlotForm } from "@/components/add-time-slot-form";
import React from "react";

interface AddTimeSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddTimeSlotDialog({ open, onOpenChange, onSuccess, onCancel }: AddTimeSlotDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Available Time Slot</DialogTitle>
          <DialogDescription>Create a new time slot for patient appointments.</DialogDescription>
        </DialogHeader>
        <AddTimeSlotForm onSuccess={onSuccess} onCancel={onCancel} />
      </DialogContent>
    </Dialog>
  );
} 