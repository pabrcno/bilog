import { useRouter } from "next/navigation"
import { useState } from "react"
import { trpc } from "@/utils/trpc"
import { showSuccess, showError } from "@/lib/toast"
import { type LoginFormValues, type RegisterFormValues } from "@/db/schema"

export function useAuth() {
  const router = useRouter()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [pendingLoginData, setPendingLoginData] = useState<{email: string, password: string, role: "admin" | "patient"} | null>(null)

  const utils = trpc.useUtils()

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      showSuccess("Logged in successfully")
      router.push(data.role === "admin" ? "/admin/dashboard" : "/patient/dashboard")
      router.refresh()
      setIsLoggingIn(false)
      setPendingLoginData(null)
    },
    onError: (error) => {
      showError(error.message || "Login failed")
      setIsLoggingIn(false)
      setPendingLoginData(null)
    },
  })

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      showSuccess("Account created successfully")
      // Use the saved credentials for login after successful registration
      if (pendingLoginData) {
        loginMutation.mutate(pendingLoginData)
      }
      setIsRegistering(false)
    },
    onError: (error) => {
      showError(error.message || "Registration failed")
      setIsRegistering(false)
      setPendingLoginData(null)
    },
  })

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      showSuccess("Logged out successfully")
      router.push("/")
      router.refresh()
      setIsLoggingOut(false)
    },
    onError: (error) => {
      showError(error.message || "Failed to log out")
      setIsLoggingOut(false)
    },
  })

  const handleLogin = (values: LoginFormValues) => {
    setIsLoggingIn(true)
    loginMutation.mutate({
      email: values.email,
      password: values.password,
      role: values.role,
    })
  }

  const handleRegister = (values: RegisterFormValues) => {
    setIsRegistering(true)
    // Save login credentials for after registration
    setPendingLoginData({
      email: values.email,
      password: values.password,
      role: values.role,
    })
    
    registerMutation.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
    })
  }

  const handleLogout = () => {
    setIsLoggingOut(true)
    logoutMutation.mutate()
  }

  return {
    handleLogin,
    handleRegister,
    handleLogout,
    isLoggingIn,
    isRegistering,
    isLoggingOut
  }
} 