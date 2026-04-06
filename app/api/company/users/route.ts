import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { z } from "zod"
import { hash } from "bcryptjs"

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "foreman", "employee"]),
})

const updateUserSchema = z.object({
  role: z.enum(["admin", "foreman", "employee"]).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/company/users - Get all company users
export async function GET() {
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

    // Get all users in the company
    const companyUsers = await prisma.user.findMany({
      where: { companyId: user.company.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    })

    return NextResponse.json({ users: companyUsers })
  } catch (error) {
    console.error("[COMPANY_USERS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch company users" },
      { status: 500 }
    )
  }
}

// POST /api/company/users - Add a new user to the company
export async function POST(request: Request) {
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

    // Only company admins can add users
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only company admins can add users" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Generate a random password
    const password = Math.random().toString(36).slice(-8)
    const hashedPassword = await hash(password, 10)

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        password: hashedPassword,
        role: validatedData.role,
        companyId: user.company.id,
        userType: "company",
        isActive: true,
        updatedAt: new Date(),
      },
    })

    // TODO: Send email with password to the new user

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isActive: newUser.isActive,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[COMPANY_USERS_POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}

// PATCH /api/company/users/[userId] - Update a user's role or status
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
      data: validatedData,
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
    console.error("[COMPANY_USERS_PATCH]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
} 