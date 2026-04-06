import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Prisma } from "@prisma/client"

// Validation schema for move supplies
const moveSupplySchema = z.object({
  supplyId: z.string().uuid(),
  quantity: z.number().min(1, "Quantity must be at least 1")
})

const allocateSupplySchema = z.object({
  supplyId: z.string().uuid(),
  quantity: z.number().int().positive(),
})

export async function GET(
  req: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify move exists and belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        userId: session.user.id,
      },
    })

    if (!move) {
      return NextResponse.json(
        { error: "Move not found" },
        { status: 404 }
      )
    }

    // Fetch move supplies with the supply details
    const moveSupplies = await prisma.moveSupply.findMany({
      where: {
        moveId: params.moveId,
      },
      include: {
        supply: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            unit: true,
            quantityInStock: true,
            isActive: true,
            companyId: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: moveSupplies })
  } catch (error) {
    console.error("Error fetching move supplies:", error)
    return NextResponse.json(
      { error: "Failed to fetch move supplies" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { supplyId, quantity } = allocateSupplySchema.parse(body)

    // Verify move exists and belongs to user
    const move = await prisma.move.findFirst({
      where: {
        id: params.moveId,
        userId: session.user.id,
      },
    })

    if (!move) {
      return NextResponse.json(
        { error: "Move not found" },
        { status: 404 }
      )
    }

    // Verify supply exists and has enough quantity
    const supply = await prisma.supply.findUnique({
      where: { id: supplyId },
    })

    if (!supply) {
      return NextResponse.json(
        { error: "Supply not found" },
        { status: 404 }
      )
    }

    if (supply.quantityInStock < quantity) {
      return NextResponse.json(
        { error: "Not enough supplies in stock" },
        { status: 400 }
      )
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create move supply allocation
      const moveSupply = await tx.moveSupply.create({
        data: {
          moveId: params.moveId,
          supplyId,
          quantity,
        },
      })

      // Update supply quantity
      await tx.supply.update({
        where: { id: supplyId },
        data: {
          quantityInStock: {
            decrement: quantity,
          },
        },
      })

      return {
        ...moveSupply,
        supply,
      }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error allocating supply:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to allocate supply" },
      { status: 500 }
    )
  }
} 