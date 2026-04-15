import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { z } from "zod"

const createRoomSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  dimensions: z.string().optional(),
  position: z.string().optional(),
  notes: z.string().optional(),
  floorLevel: z.number().optional(),
  moveId: z.string().uuid(),
  layoutId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = createRoomSchema.parse(body)

    // Verify move access
    const move = await prisma.move.findFirst({
      where: {
        id: validatedData.moveId,
        userId: session.user.id
      }
    })

    if (!move) {
      return new NextResponse("Move not found", { status: 404 })
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        name: validatedData.name,
        dimensions: validatedData.dimensions,
        notes: validatedData.notes,
        floorLevel: validatedData.floorLevel,
        layoutId: validatedData.layoutId,
      }
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error("[ROOMS_POST]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = createRoomSchema.parse(body)

    // Verify move access
    const move = await prisma.move.findFirst({
      where: {
        id: validatedData.moveId,
        userId: session.user.id
      }
    })

    if (!move) {
      return new NextResponse("Move not found", { status: 404 })
    }

    // Update room
    const room = await prisma.room.update({
      where: {
        id: validatedData.layoutId
      },
      data: {
        name: validatedData.name,
        dimensions: validatedData.dimensions,
        notes: validatedData.notes,
        floorLevel: validatedData.floorLevel,
      }
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error("[ROOMS_PATCH]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { moveId, layoutId } = body

    // Verify move access
    const move = await prisma.move.findFirst({
      where: {
        id: moveId,
        userId: session.user.id
      }
    })

    if (!move) {
      return new NextResponse("Move not found", { status: 404 })
    }

    // Delete room
    await prisma.room.delete({
      where: {
        id: layoutId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[ROOMS_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 