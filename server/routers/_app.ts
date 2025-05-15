import { router } from "../trpc"
import { appointmentRouter } from "./appointment"
import { timeSlotRouter } from "./timeSlot"
import { authRouter } from "./auth"

export const appRouter = router({
  appointment: appointmentRouter,
  timeSlot: timeSlotRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter
