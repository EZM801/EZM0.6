import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { hash } from "bcryptjs"

const joinSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  token: z.string(),
  companyId: z.string(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = joinSchema.parse(json)

    // Verify the invitation exists and is valid
    const invitation = await prisma.companyInvite.findFirst({
      where: {
        token: body.token,
        companyId: body.companyId,
        expires: {
          gt: new Date(),
        },
        used: false,
      },
    })

    if (!invitation) {
      return new NextResponse("Invalid or expired invitation", { status: 400 })
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      return new NextResponse("Email already in use", { status: 400 })
    }

    // Hash the password
    const hashedPassword = await hash(body.password, 10)

    // Create the user
    await prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        password: hashedPassword,
        userType: "COMPANY",
        role: "WORKER", // Default role for new employees
        companyId: body.companyId,
        isActive: true,
      },
    })

    // Mark the invitation as used
    await prisma.companyInvite.update({
      where: { id: invitation.id },
      data: { used: true },
    })

    return new NextResponse(null, { status: 201 })
  } catch (error) {
    console.error("[JOIN_ERROR]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 