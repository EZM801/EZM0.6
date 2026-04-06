import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { z } from "zod"

// Validation schema
const updateUserSchema = z.object({
  role: z.enum(["admin", "foreman", "employee"]).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/company/users/[userId] - Get a specific user
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    })

    if (!user?.company) {
      return NextResponse.json(
        { error: "User is not associated with a company" },
        { status: 400 }
      )
    }

    // Get the requested user
    const requestedUser = await prisma.user.findFirst({
      where: {
        id: params.userId,
        companyId: user.company.id, // Ensure the user belongs to the company
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    })

    if (!requestedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: requestedUser })
  } catch (error) {
    console.error("[COMPANY_USER_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

// PATCH /api/company/users/[userId] - Update a user
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    })

    if (!user?.company) {
      return NextResponse.json(
        { error: "User is not associated with a company" },
        { status: 400 }
      )
    }

    // Only company admins can update users
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only company admins can update users" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Update the user
    const updatedUser = await prisma.user.update({
      where: {
        id: params.userId,
        companyId: user.company.id, // Ensure the user belongs to the company
      },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("[COMPANY_USER_PATCH]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

// DELETE /api/company/users/[userId] - Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    })

    if (!user?.company) {
      return NextResponse.json(
        { error: "User is not associated with a company" },
        { status: 400 }
      )
    }

    // Only company admins can delete users
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only company admins can delete users" },
        { status: 403 }
      )
    }

    // Delete the user
    await prisma.user.delete({
      where: {
        id: params.userId,
        companyId: user.company.id, // Ensure the user belongs to the company
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[COMPANY_USER_DELETE]", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
} 