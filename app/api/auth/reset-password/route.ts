import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      )
    }

    if (resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user's password
    await prisma.User.update({
      where: { email: resetToken.identifier },
      data: { password: hashedPassword }
    })

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    })

    return NextResponse.json({
      message: "Password reset successfully"
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Missing reset token" },
        { status: 400 }
      )
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      )
    }

    if (resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: resetToken.identifier
    })
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json(
      { error: "Failed to validate token" },
      { status: 500 }
    )
  }
} 