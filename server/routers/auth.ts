import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, publicProcedure } from "../trpc"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { cookies } from "next/headers"

export const authRouter = router({
  // Login
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["admin", "patient"]),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Find user by email and role
        const user = await db.query.users.findFirst({
          where: and(eq(users.email, input.email), eq(users.role, input.role)),
        })

        if (!user) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" })
        }

        // Verify password
        const isValidPassword = input.password === user.passwordHash

        if (!isValidPassword) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" })
        }

        // Create session with secure cookies
        const cookieStore = await cookies()
        cookieStore.set("userId", user.id.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
          sameSite: "lax",
        })

        cookieStore.set("userRole", user.role, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
          sameSite: "lax",
        })

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      } catch (error) {
        console.error("Login error:", error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          cause: error,
        })
      }
    }),

  // Register
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["admin", "patient"]),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, input.email),
        })

        if (existingUser) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "User already exists" })
        }

        // Hash password
        const passwordHash = input.password

        // Create user
        const [newUser] = await db
          .insert(users)
          .values({
            name: input.name,
            email: input.email,
            passwordHash,
            role: input.role,
          })
          .returning()

        return {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        }
      } catch (error) {
        console.error("Registration error:", error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          cause: error,
        })
      }
    }),

  // Logout
  logout: publicProcedure.mutation(async () => {
    // Properly delete cookies by setting expiration in the past
    const cookieStore = await cookies()
    cookieStore.set("userId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
      sameSite: "lax",
    })

    cookieStore.set("userRole", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
      sameSite: "lax",
    })

    return { success: true }
  }),

  // Get current user
  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    return ctx.user
  }),
})
