import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { layoutId: string; roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { layoutId, roomId } = params
    if (!layoutId || !roomId) {
      return NextResponse.json(
        { success: false, error: "Layout ID and Room ID are required" },
        { status: 400 }
      )
    }

    // Verify layout exists and belongs to user
    const layout = await prisma.layout.findFirst({
      where: {
        id: layoutId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!layout) {
      return NextResponse.json(
        { success: false, error: "Layout not found" },
        { status: 404 }
      )
    }

    // Delete the room
    await prisma.room.delete({
      where: {
        id: roomId,
        layoutId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting room:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete room" },
      { status: 500 }
    )
  }
} 