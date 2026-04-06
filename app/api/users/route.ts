import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { CreateUserInput, UpdateUserInput } from '@/app/types/UserType'

// Types
type UserRole = "admin" | "user" | "manager"
type UserType = "employee" | "contractor" | "client"

// Validation schemas
const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  userType: z.enum(["employee", "contractor", "client"]),
  companyId: z.string().uuid("Invalid company ID").optional(),
  role: z.enum(["admin", "user", "manager"]).default("user")
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        company: true,
        moves: {
          include: {
            fromAddress: true,
            toAddress: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user data object
    const userData = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      password: hashedPassword,
      userType: validatedData.userType,
      role: validatedData.role,
      isActive: true,
      updatedAt: new Date()
    }

    // Add companyId only if it exists
    if (validatedData.companyId) {
      Object.assign(userData, { companyId: validatedData.companyId })
    }

    // Create user
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        role: true,
        companyId: true,
        isActive: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[USERS_POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UpdateUserInput = await request.json()

    const user = await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: body,
      include: {
        company: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.delete({
      where: {
        email: session.user.email
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
