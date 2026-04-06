import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = changePasswordSchema.parse(body)

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isCorrectPassword = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    )

    if (!isCorrectPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    // Update the password
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Password change error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
} 