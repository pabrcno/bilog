import { useState, useEffect } from "react"
import { trpc } from "@/utils/trpc"

export function useUser() {
  const [userName, setUserName] = useState<string>("")
  const { data: currentUser, isLoading } = trpc.auth.getCurrentUser.useQuery()

  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.name)
    }
  }, [currentUser])

  return {
    user: currentUser,
    userName,
    isLoading
  }
} 