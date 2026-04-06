import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { hash } from "bcryptjs"
import { v4 as uuidv4 } from 'uuid'

const employeeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["WORKER", "FOREMAN", "ADMIN"]).default("WORKER"),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.userType !== "COMPANY") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const employees = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        role: {
          in: ["WORKER", "FOREMAN"]
        },
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.userType !== "COMPANY") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Debug logging
    console.log("[EMPLOYEE_CREATE] Session data:", {
      userId: session.user.id,
      companyId: session.user.companyId,
      userType: session.user.userType
    })

    const json = await req.json()
    const body = employeeSchema.parse(json)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 })
    }

    // Hash the password
    const hashedPassword = await hash(body.password, 10)

    // Ensure companyId is a valid UUID
    if (!session.user.companyId) {
      return new NextResponse("Company ID is required", { status: 400 })
    }

    try {
      const employee = await prisma.user.create({
        data: {
          id: uuidv4(), // Generate a new UUID for the employee
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
          password: hashedPassword,
          role: body.role,
          userType: "COMPANY",
          companyId: session.user.companyId,
          isActive: true,
          updatedAt: new Date(),
          accountType: "company",
          isVerified: true
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      })

      return NextResponse.json(employee)
    } catch (error) {
      console.error("[EMPLOYEE_CREATE] Detailed error:", error)
      if (error instanceof z.ZodError) {
        return new NextResponse("Invalid request data", { status: 400 })
      }
      return new NextResponse("Internal error", { status: 500 })
    }
  } catch (error) {
    console.error("[EMPLOYEE_CREATE] Outer error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 