import { toast } from "sonner"

// Success toast
export function showSuccess(message: string) {
  toast.success(message)
}

// Error toast
export function showError(message: string) {
  toast.error(message)
}

// Info toast
export function showInfo(message: string) {
  toast.info(message)
}

// Loading toast
export function showLoading(message: string) {
  return toast.loading(message)
}

// Update a loading toast
export function updateToast(toastId: string, type: "success" | "error", message: string) {
  toast.dismiss(toastId)
  if (type === "success") {
    toast.success(message)
  } else {
    toast.error(message)
  }
}
