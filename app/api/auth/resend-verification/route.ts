import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { generateVerificationToken, sendVerificationEmail } from "@/app/lib/auth"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists and is not verified
    const user = await prisma.User.findUnique({
      where: { email }
    })

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a verification link"
      })
    }

    if (user.emailVerified) {
      return NextResponse.json({
        message: "This email is already verified"
      })
    }

    // Delete any existing verification tokens
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    // Generate and send new verification email
    const token = await generateVerificationToken(email)
    await sendVerificationEmail(email, token)

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a verification link"
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    )
  }
} 