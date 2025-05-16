"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { type LoginFormValues, loginSchema } from "@/db/schema"

interface LoginFormProps {
  role: "admin" | "patient"
  title: string
  description: string
  submitText: string
  alternativeText: string
  alternativeLink: string
  alternativeLinkText: string
  onSubmit: (values: LoginFormValues) => void
  isSubmitting?: boolean
}

export function LoginForm({
  role,
  title,
  description,
  submitText,
  alternativeText,
  alternativeLink,
  alternativeLinkText,
  onSubmit,
  isSubmitting = false,
}: LoginFormProps) {
  // Initialize React Hook Form
  const { handleSubmit, register, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role,
    },
  })

  return (
    <Card className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input
              id="email"
              type="email"
              placeholder={`${role === "admin" ? "dentist" : "patient"}@example.com`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <Input
              id="password"
              type="password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : submitText}
          </Button>
          <div className="text-center text-sm">
            {alternativeText}{" "}
            <Link href={alternativeLink} className="text-black font-medium hover:underline">
              {alternativeLinkText}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
