import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { v4 as uuidv4 } from 'uuid'

const addEmployeeSchema = z.object({
  employeeId: z.string().uuid("Please select an employee"),
  role: z.enum(["MOVER", "DRIVER", "SUPERVISOR"]).default("MOVER"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = addEmployeeSchema.parse(json)

    // Verify the move belongs to the company
    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!
      }
    })

    if (!move) {
      return new NextResponse("Move not found", { status: 404 })
    }

    // Verify the employee belongs to the company
    const user = await prisma.user.findFirst({
      where: {
        id: body.employeeId,
        companyId: session.user.companyId!,
        userType: "COMPANY",
        role: {
          in: ["WORKER", "FOREMAN"]
        }
      }
    })

    if (!user) {
      return new NextResponse("Employee not found", { status: 404 })
    }

    // Get or create the employee record
    let employee = await prisma.employee.findFirst({
      where: {
        companyId: session.user.companyId!,
        email: user.email
      }
    })

    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          id: uuidv4(),
          companyId: session.user.companyId!,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role || "WORKER",
          isActive: true
        }
      })
    }

    // Check if employee is already assigned to this move
    const existingAssignment = await prisma.companyMoveEmployee.findFirst({
      where: {
        moveId: params.moveId,
        employeeId: employee.id
      }
    })

    if (existingAssignment) {
      return new NextResponse("Employee is already assigned to this move", { status: 400 })
    }

    // Create the move employee assignment
    const moveEmployee = await prisma.companyMoveEmployee.create({
      data: {
        id: uuidv4(),
        moveId: params.moveId,
        employeeId: employee.id,
        role: body.role,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null
      },
      include: {
        employee: true
      }
    })

    // Fetch the updated move with all its relations
    const updatedMove = await prisma.companyMove.findUnique({
      where: { id: params.moveId },
      include: {
        employees: {
          include: {
            employee: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: {
        moveEmployee,
        move: updatedMove
      }
    })
  } catch (error) {
    console.error("Error adding employee to move:", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 