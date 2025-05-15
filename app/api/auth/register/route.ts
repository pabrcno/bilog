import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { hashPassword } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role,
      })
      .returning()

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
