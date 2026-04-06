import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { moveId } = params

    // Find the origin layout for this move
    const layout = await prisma.layout.findFirst({
      where: {
        moveId: moveId,
        orientation: "origin",
        move: {
          userId: session.user.id
        }
      },
      include: {
        rooms: true
      }
    })

    if (!layout) {
      return NextResponse.json(
        { error: { message: "Origin layout not found" } },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: layout })
  } catch (error) {
    console.error("[LAYOUTS_CURRENT_GET]", error)
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    )
  }
} 