"use client"

import { LoginLayout } from "@/components/login-layout"
import { RegisterForm } from "@/components/auth/register-form"

export default function PatientRegisterPage() {
  return (
    <LoginLayout>
      <RegisterForm
        role="patient"
        title="Patient Registration"
        description="Create an account to book dental appointments"
        submitText="Create Account"
        redirectPath="/patient"
        loginPath="/patient/login"
      />
    </LoginLayout>
  )
}
