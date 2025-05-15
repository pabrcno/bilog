import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { cookies } from "next/headers"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

// Define context type
export type Context = {
  user: {
    id: number
    role: string
    name: string
    email: string
  } | null
}

// Create context for each request
export const createContext = async (): Promise<Context> => {
  const userId = cookies().get("userId")?.value
  const userRole = cookies().get("userRole")?.value

  if (!userId || !userRole) {
    return { user: null }
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, Number(userId)),
  })

  if (!user) {
    return { user: null }
  }

  return {
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
  }
}

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

// Create router and procedure helpers
export const router = t.router
export const publicProcedure = t.procedure

// Middleware for authenticated routes
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

// Middleware for admin-only routes
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "admin") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

// Middleware for patient-only routes
const isPatient = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "patient") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Patient access required" })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

// Protected procedures
export const protectedProcedure = t.procedure.use(isAuthed)
export const adminProcedure = t.procedure.use(isAdmin)
export const patientProcedure = t.procedure.use(isPatient)
