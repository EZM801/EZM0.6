import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { moveId: string; inventoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const inventory = await prisma.inventory.findFirst({
      where: {
        id: params.inventoryId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!inventory) {
      return new NextResponse("Inventory not found", { status: 404 })
    }

    return NextResponse.json(inventory)
  } catch (error) {
    console.error("[INVENTORY_GET]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { moveId: string; inventoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const { name, description, quantity, status } = json

    // Verify inventory belongs to user's move
    const existingInventory = await prisma.inventory.findFirst({
      where: {
        id: params.inventoryId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!existingInventory) {
      return new NextResponse("Inventory not found", { status: 404 })
    }

    const inventory = await prisma.inventory.update({
      where: {
        id: params.inventoryId,
      },
      data: {
        name,
        description,
        quantity,
        status,
      },
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error("[INVENTORY_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moveId: string; inventoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify inventory belongs to user's move
    const existingInventory = await prisma.inventory.findFirst({
      where: {
        id: params.inventoryId,
        moveId: params.moveId,
        move: {
          userId: session.user.id,
        },
      },
    })

    if (!existingInventory) {
      return new NextResponse("Inventory not found", { status: 404 })
    }

    await prisma.inventory.delete({
      where: {
        id: params.inventoryId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[INVENTORY_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 