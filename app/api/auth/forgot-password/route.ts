import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { generatePasswordResetToken, sendPasswordResetEmail } from "@/app/lib/auth"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link"
      })
    }

    // Generate reset token
    const token = await generatePasswordResetToken(email)

    // Send reset email
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link"
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
} 