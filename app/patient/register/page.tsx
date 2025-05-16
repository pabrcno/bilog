"use client"

import { LoginLayout } from "@/components/login-layout"
import { RegisterForm } from "@/components/auth/register-form"
import { useAuth } from "@/hooks"
export default function PatientRegisterPage() {
  const { handleRegister } = useAuth()
  return (
    <LoginLayout>
      <RegisterForm
        role="patient"
        title="Patient Registration"
        description="Create an account to book dental appointments"
        submitText="Create Account"
        loginPath="/patient/login"
        onSubmit={handleRegister}
      />
    </LoginLayout>
  )
}
