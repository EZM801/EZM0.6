import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { v4 as uuidv4 } from 'uuid'

const addEquipmentSchema = z.object({
  equipmentId: z.string().uuid("Please select equipment"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
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
    const body = addEquipmentSchema.parse(json)

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

    // Verify the equipment belongs to the company
    const equipment = await prisma.equipment.findFirst({
      where: {
        id: body.equipmentId,
        companyId: session.user.companyId!,
        isAvailable: true
      }
    })

    if (!equipment) {
      return new NextResponse("Equipment not found or not available", { status: 404 })
    }

    // Check if equipment is already assigned to this move
    const existingAssignment = await prisma.companyMoveEquipment.findFirst({
      where: {
        moveId: params.moveId,
        equipmentId: body.equipmentId
      }
    })

    if (existingAssignment) {
      return new NextResponse("Equipment is already assigned to this move", { status: 400 })
    }

    // Create the equipment assignment
    const moveEquipment = await prisma.companyMoveEquipment.create({
      data: {
        id: uuidv4(),
        moveId: params.moveId,
        equipmentId: body.equipmentId,
        quantity: body.quantity,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
      }
    })

    return NextResponse.json(moveEquipment)
  } catch (error) {
    console.error("Error adding equipment to move:", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 