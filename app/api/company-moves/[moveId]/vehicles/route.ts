import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { v4 as uuidv4 } from 'uuid'

const addVehicleSchema = z.object({
  vehicleId: z.string().uuid("Please select a vehicle"),
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
    const body = addVehicleSchema.parse(json)

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

    // Verify the vehicle belongs to the company
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: body.vehicleId,
        companyId: session.user.companyId!
      }
    })

    if (!vehicle) {
      return new NextResponse("Vehicle not found", { status: 404 })
    }

    // Create the vehicle assignment
    const moveVehicle = await prisma.companyMoveVehicle.create({
      data: {
        id: uuidv4(),
        moveId: params.moveId,
        vehicleId: body.vehicleId,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
      }
    })

    return NextResponse.json(moveVehicle)
  } catch (error) {
    console.error("Error adding vehicle to move:", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 