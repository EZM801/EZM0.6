import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const resourceSchema = z.object({
  type: z.enum(["employees", "vehicles", "equipment", "supplies"]),
  resourceId: z.string(),
  quantity: z.string().optional(),
  role: z.enum(["MOVER", "DRIVER", "SUPERVISOR"]).optional(),
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
    const body = resourceSchema.parse(json)

    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!,
      },
    })

    if (!move) {
      return new NextResponse("Move not found", { status: 404 })
    }

    const startDate = body.startDate ? new Date(body.startDate) : new Date()
    const endDate = body.endDate ? new Date(body.endDate) : null

    let result

    switch (body.type) {
      case "employees":
        result = await prisma.companyMoveEmployee.create({
          data: {
            moveId: params.moveId,
            employeeId: body.resourceId,
            role: body.role || "MOVER",
            startDate,
            endDate,
          },
        })
        break

      case "vehicles":
        result = await prisma.companyMoveVehicle.create({
          data: {
            moveId: params.moveId,
            vehicleId: body.resourceId,
            startDate,
            endDate,
          },
        })
        break

      case "equipment":
        result = await prisma.companyMoveEquipment.create({
          data: {
            moveId: params.moveId,
            equipmentId: body.resourceId,
            quantity: parseInt(body.quantity || "1"),
            startDate,
            endDate,
          },
        })
        break

      case "supplies":
        result = await prisma.companyMoveSupply.create({
          data: {
            moveId: params.moveId,
            supplyId: body.resourceId,
            quantity: parseInt(body.quantity || "1"),
          },
        })
        break
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[RESOURCE_CREATE]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const move = await prisma.companyMove.findFirst({
      where: {
        id: params.moveId,
        companyId: session.user.companyId!,
      },
      include: {
        employees: {
          include: {
            employee: true,
          },
        },
        vehicles: {
          include: {
            vehicle: true,
          },
        },
        equipment: {
          include: {
            equipment: true,
          },
        },
        supplies: {
          include: {
            supply: true,
          },
        },
      },
    })

    if (!move) {
      return new NextResponse("Move not found", { status: 404 })
    }

    return NextResponse.json({
      employees: move.employees,
      vehicles: move.vehicles,
      equipment: move.equipment,
      supplies: move.supplies,
    })
  } catch (error) {
    console.error("[RESOURCES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 