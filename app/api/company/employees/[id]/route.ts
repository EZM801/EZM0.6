import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from "@/lib/auth"

const employeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  isActive: z.boolean().default(true),
})

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = employeeSchema.parse(json)

    const employee = await prisma.user.update({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
      data: {
        name: body.name,
        email: body.email,
        userType: body.role.toUpperCase(),
        isActive: body.isActive,
      },
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.type !== "COMPANY") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const employee = await prisma.user.findUnique({
      where: {
        id: params.id,
        companyId: session.user.companyId,
      },
    })

    if (!employee) {
      return new NextResponse("Employee not found", { status: 404 })
    }

    await prisma.user.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[EMPLOYEE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 