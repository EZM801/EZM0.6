import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; supplyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const supply = await prisma.supply.findFirst({
      where: {
        id: params.supplyId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!supply) {
      return new NextResponse("Supply not found", { status: 404 })
    }

    return NextResponse.json(supply)
  } catch (error) {
    console.error("[SUPPLY_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { moveId: string; supplyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const { name, description, quantity, type, status } = json

    // Verify supply belongs to user's move
    const existingSupply = await prisma.supply.findFirst({
      where: {
        id: params.supplyId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!existingSupply) {
      return new NextResponse("Supply not found", { status: 404 })
    }

    const supply = await prisma.supply.update({
      where: {
        id: params.supplyId,
      },
      data: {
        name,
        description,
        quantity,
        type,
        status,
      },
    })

    return NextResponse.json(supply)
  } catch (error) {
    console.error("[SUPPLY_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; supplyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify supply belongs to user's move
    const existingSupply = await prisma.supply.findFirst({
      where: {
        id: params.supplyId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!existingSupply) {
      return new NextResponse("Supply not found", { status: 404 })
    }

    await prisma.supply.delete({
      where: {
        id: params.supplyId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[SUPPLY_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 