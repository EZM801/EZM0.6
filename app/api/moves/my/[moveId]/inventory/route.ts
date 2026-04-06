import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const inventory = await prisma.inventory.findMany({
      where: {
        moveId: params.moveId,
        move: {
          userId: session.user.id
        }
      }
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error("[INVENTORY_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()

    const inventory = await prisma.inventory.create({
      data: {
        name: body.name,
        description: body.description,
        quantity: body.quantity,
        category: body.category,
        condition: body.condition,
        moveId: params.moveId
      },
      include: {
        qrCodes: true
      }
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error("[INVENTORY_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 