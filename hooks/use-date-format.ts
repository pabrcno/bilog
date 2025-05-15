import { useState } from "react"

export function useDateFormat() {
  // Format date for display 
  const formatDate = (date?: Date) => {
    if (!date) return ""
    
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return { formatDate }
} 