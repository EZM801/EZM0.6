import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const itemLists = await prisma.itemList.findMany({
      where: {
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(itemLists)
  } catch (error) {
    console.error("Error fetching item lists:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const { name, description } = json

    // Verify move belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        userId: session.user.id,
      },
    })

    if (!move) {
      return new NextResponse("Move not found", { status: 404 })
    }

    const itemList = await prisma.itemList.create({
      data: {
        name,
        description,
        moveId: params.moveId,
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: itemList
    })
  } catch (error) {
    console.error("Error creating item list:", error)
    return new NextResponse(JSON.stringify({
      success: false,
      error: {
        message: "Failed to create item list"
      }
    }), { status: 500 })
  }
} 