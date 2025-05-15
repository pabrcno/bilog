import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogText: {
    title: string;
    description: string;
    actionButton: string;
    cancelButton: string;
  };
  onAction: () => void;
  onCancel: () => void;
  actionType?: "confirm" | "reject" | "cancel";
  loading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  dialogText,
  onAction,
  onCancel,
  actionType = "confirm",
  loading = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogText.title}</DialogTitle>
          <DialogDescription>{dialogText.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {dialogText.cancelButton}
          </Button>
          <Button
            variant={actionType === "confirm" ? "default" : "destructive"}
            onClick={onAction}
            disabled={loading}
            className="ml-2 sm:ml-0"
          >
            {dialogText.actionButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 