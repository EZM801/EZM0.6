import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { z } from "zod"

const createRoomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z.string().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: { layoutId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = createRoomSchema.parse(body)

    const layout = await prisma.layout.findUnique({
      where: { id: params.layoutId },
      include: { move: true },
    })

    if (!layout || !layout.move) {
      return new NextResponse("Layout not found", { status: 404 })
    }

    if (layout.move.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const now = new Date()
    const room = await prisma.room.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        layoutId: params.layoutId,
        createdAt: now,
        updatedAt: now,
      },
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error("Error creating room:", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { layoutId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      )
    }

    // Get the layout to verify access
    const layout = await prisma.layout.findFirst({
      where: {
        id: params.layoutId,
        move: {
          userId: session.user.id
        }
      }
    })

    if (!layout) {
      return NextResponse.json(
        { success: false, error: { message: "Layout not found" } },
        { status: 404 }
      )
    }

    // Get all rooms for the layout
    const rooms = await prisma.room.findMany({
      where: {
        layoutId: params.layoutId
      }
    })

    return NextResponse.json({ success: true, data: rooms })
  } catch (error) {
    console.error("Error in rooms route:", error)
    return NextResponse.json(
      { success: false, error: { message: "Internal Server Error" } },
      { status: 500 }
    )
  }
} 