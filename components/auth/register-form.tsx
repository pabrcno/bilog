"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { type RegisterFormValues, registerSchema } from "@/db/schema"

interface RegisterFormProps {
  role: "admin" | "patient"
  title: string
  description: string
  submitText: string
  loginPath: string
  onSubmit: (values: RegisterFormValues) => void
  isSubmitting?: boolean
}

export function RegisterForm({ 
  role, 
  title, 
  description, 
  submitText, 
  loginPath,
  onSubmit,
  isSubmitting = false
}: RegisterFormProps) {
  // Initialize React Hook Form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role,
    },
  })

  return (
    <Card className="w-full max-w-md">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
            <Input
              id="name"
              placeholder="John Smith"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input
              id="email"
              type="email"
              placeholder={`${role === "admin" ? "dentist" : "patient"}@example.com`}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
            <Input
              id="confirmPassword"
              type="password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : submitText}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href={loginPath} className="text-black font-medium hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
